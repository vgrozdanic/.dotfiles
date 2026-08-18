import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import * as fs from "node:fs";
import * as path from "node:path";
import type { ThinkingLevel } from "@earendil-works/pi-agent-core";
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { Text } from "@earendil-works/pi-tui";
import { Type } from "typebox";

const MAX_REVIEW_ROUNDS = 5;
const COMPLEXITY_SKILL = "ponytail-review";
const FULL_TOOLS = ["read", "bash", "edit", "write", "grep", "find", "ls"];
const REVIEW_TOOLS = ["read", "bash", "grep", "find", "ls"];
const MAX_STDERR_BYTES = 50 * 1024;

type ChildRole = "implement" | "feedback" | ReviewKind;
type ReviewKind = "security" | "complexity" | "performance" | "bugs";
type ReviewVerdict = "clean" | "changes-required";
type WorkflowStatus = "running" | "done" | "max-rounds";
type WorkflowStage = "implement" | "review" | "feedback";

interface UsageStats {
  input: number;
  output: number;
  cacheRead: number;
  cacheWrite: number;
  cost: number;
  contextTokens: number;
  turns: number;
}

interface ChildResult {
  role: ChildRole;
  round?: number;
  output: string;
  stderr: string;
  exitCode: number;
  stopReason?: string;
  errorMessage?: string;
  usage: UsageStats;
  model?: string;
}

interface SpecialtyReview {
  kind: ReviewKind;
  verdict: ReviewVerdict;
  result: ChildResult;
}

interface ReviewRound {
  round: number;
  reviews: SpecialtyReview[];
  feedback?: ChildResult;
}

interface WorkflowDetails {
  status: WorkflowStatus;
  maxRounds: number;
  current?: { stage: WorkflowStage; round?: number };
  implementation?: ChildResult;
  rounds: ReviewRound[];
}

interface ChildRequest {
  role: ChildRole;
  task: string;
  tools: string[];
  model?: string;
  thinkingLevel?: ThinkingLevel;
  skill?: string;
  round?: number;
}

interface JsonMessage {
  role?: string;
  content?: Array<{ type?: string; text?: string }>;
  model?: string;
  stopReason?: string;
  errorMessage?: string;
  usage?: {
    input?: number;
    output?: number;
    cacheRead?: number;
    cacheWrite?: number;
    totalTokens?: number;
    cost?: { total?: number };
  };
}

interface JsonEvent {
  type?: string;
  message?: JsonMessage;
}

const REVIEW_INSTRUCTIONS: Record<Exclude<ReviewKind, "complexity">, string> = {
  security: `Act as a security specialist. Report only high-confidence vulnerabilities in changed code.
Research surrounding code before reporting. Trace attacker-controlled input through validation, authorization, framework protections, and sinks. Do not flag server-controlled configuration, framework-mitigated patterns, test code, or theoretical defense-in-depth concerns. For each finding, include severity, exact location, attack path, impact, evidence, and a concrete fix.`,
  performance: `Act as a performance specialist. Find concrete performance regressions or scalability risks in changed code.
Trace execution paths and data sizes. Check algorithmic complexity, repeated queries, N+1 access, unbounded work, blocking I/O, unnecessary serialization, memory growth, and hot-path allocations. Do not report micro-optimizations without plausible impact. For each finding, include exact location, triggering workload, impact, evidence, and a concrete fix.`,
  bugs: `Act as a correctness specialist. Find concrete bugs in changed code.
Trace inputs, outputs, callers, state changes, and error paths. Check edge cases, incorrect conditions, API contract breaks, missing validation, concurrency hazards, resource leaks, data loss, and failure handling. Do not report style preferences or speculative concerns. For each finding, include exact location, failing scenario, impact, evidence, and a concrete fix.`,
};

function getPiInvocation(args: string[]): { command: string; args: string[] } {
  const currentScript = process.argv[1];
  const isBunVirtualScript = currentScript?.startsWith("/$bunfs/root/");
  if (currentScript && !isBunVirtualScript && fs.existsSync(currentScript)) {
    return { command: process.execPath, args: [currentScript, ...args] };
  }

  const execName = path.basename(process.execPath).toLowerCase();
  const isGenericRuntime = /^(node|bun)(\.exe)?$/.test(execName);
  return isGenericRuntime ? { command: "pi", args } : { command: process.execPath, args };
}

function messageText(message: JsonMessage): string {
  return (message.content ?? [])
    .flatMap((part) => (part.type === "text" && part.text ? [part.text] : []))
    .join("\n");
}

function parseReviewVerdict(output: string): ReviewVerdict {
  const finalLine = output
    .trim()
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .at(-1);

  if (finalLine === "VERDICT:CLEAN") return "clean";
  if (finalLine === "VERDICT:CHANGES_REQUIRED") return "changes-required";
  throw new Error("Reviewer must end with VERDICT:CLEAN or VERDICT:CHANGES_REQUIRED");
}

if (process.env.PI_WORKFLOW_CYCLE_SELF_TEST === "1") {
  assert.equal(parseReviewVerdict("No findings.\nVERDICT:CLEAN"), "clean");
  assert.equal(parseReviewVerdict("One finding.\nVERDICT:CHANGES_REQUIRED"), "changes-required");
  assert.throws(() => parseReviewVerdict("No verdict"));
}

function assertSuccessful(result: ChildResult): void {
  const failed =
    result.exitCode !== 0 ||
    result.stopReason === "error" ||
    result.stopReason === "aborted" ||
    Boolean(result.errorMessage) ||
    !result.output.trim();

  if (!failed) return;

  const reason = result.errorMessage || result.stderr.trim() || result.stopReason || `exit ${result.exitCode}`;
  throw new Error(`${result.role} subagent failed: ${reason}`);
}

function reviewPrompt(kind: ReviewKind, plan: string): string {
  const specialty =
    kind === "complexity"
      ? `Use ponytail-review to find over-engineering only. Find code to delete or replace with existing code, standard library features, or native platform features. Do not edit files.`
      : REVIEW_INSTRUCTIONS[kind];

  return `${specialty}

Review implementation against this plan:

${plan}

Inspect current git diff and enough surrounding code to verify each finding. Review only changes related to plan. Do not edit files. Report actionable findings only.

If no actionable findings remain, end with this exact final line:
VERDICT:CLEAN

If actionable findings remain, end with this exact final line:
VERDICT:CHANGES_REQUIRED

Never output both verdicts.`;
}

function aggregateFindings(reviews: SpecialtyReview[]): string {
  return reviews
    .filter((review) => review.verdict === "changes-required")
    .map((review) => `## ${review.kind}\n\n${review.result.output}`)
    .join("\n\n---\n\n");
}

async function spawnChild(
  request: ChildRequest,
  cwd: string,
  signal: AbortSignal | undefined,
): Promise<ChildResult> {
  signal?.throwIfAborted();

  const args = ["--mode", "json", "-p", "--no-session", "--no-extensions", "--tools", request.tools.join(",")];
  if (request.model) args.push("--model", request.model);
  if (request.thinkingLevel) args.push("--thinking", request.thinkingLevel);

  const prompt = request.skill ? `/skill:${request.skill} ${request.task}` : `Task:\n${request.task}`;
  args.push(prompt);

  const result: ChildResult = {
    role: request.role,
    round: request.round,
    output: "",
    stderr: "",
    exitCode: 0,
    usage: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0, cost: 0, contextTokens: 0, turns: 0 },
    model: request.model,
  };

  let aborted = false;
  let buffer = "";
  let spawnError = "";

  const invocation = getPiInvocation(args);
  const proc = spawn(invocation.command, invocation.args, {
    cwd,
    shell: false,
    stdio: ["ignore", "pipe", "pipe"],
  });

  const processLine = (line: string): void => {
    if (!line.trim()) return;

    let event: JsonEvent;
    try {
      event = JSON.parse(line) as JsonEvent;
    } catch {
      return;
    }

    if (event.type !== "message_end" || event.message?.role !== "assistant") return;

    const message = event.message;
    const text = messageText(message);
    if (text) result.output = text;
    result.usage.turns++;
    result.usage.input += message.usage?.input ?? 0;
    result.usage.output += message.usage?.output ?? 0;
    result.usage.cacheRead += message.usage?.cacheRead ?? 0;
    result.usage.cacheWrite += message.usage?.cacheWrite ?? 0;
    result.usage.cost += message.usage?.cost?.total ?? 0;
    result.usage.contextTokens = message.usage?.totalTokens ?? result.usage.contextTokens;
    result.model = message.model ?? result.model;
    result.stopReason = message.stopReason;
    result.errorMessage = message.errorMessage;
  };

  proc.stdout.on("data", (data) => {
    buffer += data.toString();
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";
    for (const line of lines) processLine(line);
  });

  proc.stderr.on("data", (data) => {
    result.stderr = `${result.stderr}${data.toString()}`.slice(-MAX_STDERR_BYTES);
  });

  proc.once("error", (error) => {
    spawnError = error.message;
  });

  let killTimer: NodeJS.Timeout | undefined;
  const abort = (): void => {
    aborted = true;
    proc.kill("SIGTERM");
    killTimer = setTimeout(() => {
      if (proc.exitCode === null) proc.kill("SIGKILL");
    }, 5000);
    killTimer.unref();
  };

  if (signal) signal.addEventListener("abort", abort, { once: true });

  result.exitCode = await new Promise<number>((resolve) => {
    proc.once("close", (code) => resolve(code ?? 1));
  });

  if (buffer.trim()) processLine(buffer);
  if (signal) signal.removeEventListener("abort", abort);
  if (killTimer) clearTimeout(killTimer);
  if (spawnError) result.stderr = `${result.stderr}\n${spawnError}`.trim();
  if (aborted) throw new Error("Workflow cancelled");

  return result;
}

export default function workflowCycle(pi: ExtensionAPI): void {
  let running = false;
  let toolsBeforeCycle: string[] | undefined;

  const restoreParentTools = (): void => {
    if (!toolsBeforeCycle) return;
    pi.setActiveTools(toolsBeforeCycle);
    toolsBeforeCycle = undefined;
  };

  pi.registerTool({
    name: "workflow_cycle",
    label: "Workflow Cycle",
    description: "Implement an existing plan, run four isolated specialty reviews, and address feedback until clean or five review rounds finish.",
    promptSnippet: "Implement an existing plan through isolated review and feedback subagents",
    promptGuidelines: ["Use workflow_cycle exactly once when a user starts /cycle. Pass existing plan verbatim. Do not edit code in parent agent."],
    parameters: Type.Object({
      plan: Type.String({ description: "Existing implementation plan to execute" }),
    }),

    async execute(_toolCallId, params, signal, onUpdate, ctx) {
      if (running) throw new Error("Workflow cycle is already running");
      if (!params.plan.trim()) throw new Error("Implementation plan is required");

      const commands = new Set(pi.getCommands().filter((command) => command.source === "skill").map((command) => command.name));
      if (!commands.has(`skill:${COMPLEXITY_SKILL}`)) throw new Error(`Required skill is unavailable: ${COMPLEXITY_SKILL}`);

      running = true;
      const details: WorkflowDetails = { status: "running", maxRounds: MAX_REVIEW_ROUNDS, rounds: [] };
      const model = ctx.model ? `${ctx.model.provider}/${ctx.model.id}` : undefined;
      const thinkingLevel = ctx.thinkingLevel;

      const update = (stage: WorkflowStage, round?: number): void => {
        details.current = { stage, round };
        const label = round ? `round ${round}/${MAX_REVIEW_ROUNDS}: ${stage}` : stage;
        ctx.ui.setStatus("workflow-cycle", label);
        onUpdate?.({
          content: [{ type: "text", text: `Workflow running: ${label}` }],
          details: { ...details, rounds: [...details.rounds] },
        });
      };

      try {
        update("implement");
        const implementation = await spawnChild(
          {
            role: "implement",
            task: `Implement this existing plan:\n\n${params.plan}\n\nInspect code before editing. Follow project instructions. Fix root causes. Keep changes minimal. Run smallest relevant checks.`,
            tools: FULL_TOOLS,
            model,
            thinkingLevel,
          },
          ctx.cwd,
          signal,
        );
        assertSuccessful(implementation);
        details.implementation = implementation;

        for (let round = 1; round <= MAX_REVIEW_ROUNDS; round++) {
          update("review", round);
          const reviewKinds: ReviewKind[] = ["security", "complexity", "performance", "bugs"];
          const reviewResults = await Promise.all(
            reviewKinds.map((kind) =>
              spawnChild(
                {
                  role: kind,
                  round,
                  skill: kind === "complexity" ? COMPLEXITY_SKILL : undefined,
                  task: reviewPrompt(kind, params.plan),
                  tools: REVIEW_TOOLS,
                  model,
                  thinkingLevel,
                },
                ctx.cwd,
                signal,
              ),
            ),
          );

          const reviews = reviewResults.map((result, index): SpecialtyReview => {
            assertSuccessful(result);
            return {
              kind: reviewKinds[index],
              verdict: parseReviewVerdict(result.output),
              result,
            };
          });
          const reviewRound: ReviewRound = { round, reviews };
          details.rounds.push(reviewRound);

          if (reviews.every((review) => review.verdict === "clean")) {
            details.status = "done";
            details.current = undefined;
            return {
              content: [{ type: "text", text: `WORKFLOW_DONE after ${round} review round${round === 1 ? "" : "s"}.` }],
              details,
            };
          }

          update("feedback", round);
          const feedback = await spawnChild(
            {
              role: "feedback",
              round,
              task: `Address actionable review feedback for this implementation plan:\n\n${params.plan}\n\nSpecialty review findings:\n\n${aggregateFindings(reviews)}\n\nInspect each finding and surrounding code. Fix every valid finding at root cause. Do not make unrelated changes. Run smallest relevant checks. If a finding is false, leave code unchanged for that finding and explain why in final summary.`,
              tools: FULL_TOOLS,
              model,
              thinkingLevel,
            },
            ctx.cwd,
            signal,
          );
          assertSuccessful(feedback);
          reviewRound.feedback = feedback;

          if (round === MAX_REVIEW_ROUNDS) {
            details.status = "max-rounds";
            details.current = undefined;
            return {
              content: [{ type: "text", text: `WORKFLOW_MAX_ROUNDS after ${MAX_REVIEW_ROUNDS} review and feedback rounds. Final feedback was applied but not re-reviewed.` }],
              details,
            };
          }
        }

        throw new Error("Workflow ended unexpectedly");
      } finally {
        running = false;
        ctx.ui.setStatus("workflow-cycle", undefined);
      }
    },

    renderCall(args, theme) {
      const plan = args.plan ?? "...";
      const preview = plan.length > 100 ? `${plan.slice(0, 100)}...` : plan;
      return new Text(`${theme.fg("toolTitle", theme.bold("workflow_cycle"))}\n${theme.fg("dim", preview)}`, 0, 0);
    },

    renderResult(result, { expanded }, theme) {
      const details = result.details as WorkflowDetails | undefined;
      if (!details) {
        const text = result.content[0];
        return new Text(text?.type === "text" ? text.text : "Workflow failed", 0, 0);
      }

      const icon = details.status === "done" ? theme.fg("success", "✓") : details.status === "max-rounds" ? theme.fg("warning", "◐") : theme.fg("warning", "⏳");
      let text = `${icon} ${theme.fg("toolTitle", theme.bold("workflow cycle"))}`;
      if (details.current) {
        text += ` ${theme.fg("muted", details.current.round ? `${details.current.stage} ${details.current.round}/${details.maxRounds}` : details.current.stage)}`;
      } else {
        text += ` ${theme.fg("muted", `${details.rounds.length}/${details.maxRounds} review rounds`)}`;
      }

      if (expanded && details.rounds.length > 0) {
        const finalRound = details.rounds.at(-1)!;
        for (const review of finalRound.reviews) {
          text += `\n\n${theme.fg("muted", `${review.kind} review:`)}\n${review.result.output}`;
        }
      } else if (!expanded && details.status !== "running") {
        text += `\n${theme.fg("dim", "Expand to view final specialty reviews")}`;
      }

      return new Text(text, 0, 0);
    },
  });

  pi.registerCommand("cycle", {
    description: "Implement latest plan through isolated specialty review rounds",
    handler: async (args, ctx) => {
      if (!ctx.isIdle() || running) {
        ctx.ui.notify("Workflow cycle is already running", "warning");
        return;
      }

      const extra = args.trim();
      toolsBeforeCycle = pi.getActiveTools();
      pi.setActiveTools(["workflow_cycle"]);
      try {
        pi.sendUserMessage(`Call workflow_cycle exactly once. Pass the latest implementation plan from this conversation verbatim as plan. Do not inspect or edit code in parent agent.${extra ? `\n\nAdditional constraints:\n${extra}` : ""}`);
      } catch (error) {
        restoreParentTools();
        throw error;
      }
    },
  });

  pi.on("agent_settled", () => {
    if (!running) restoreParentTools();
  });
}
