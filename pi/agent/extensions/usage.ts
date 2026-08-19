import assert from "node:assert/strict";
import type { Usage } from "@earendil-works/pi-ai";
import {
  type ExtensionAPI,
  type SessionEntry,
  SessionManager,
} from "@earendil-works/pi-coding-agent";

const DEFAULT_DAYS = 30;
const number = new Intl.NumberFormat("en-US");
const date = new Intl.DateTimeFormat(undefined, {
  year: "numeric",
  month: "short",
  day: "numeric",
});

interface DateRange {
  start: Date;
  end: Date;
}

interface UsageTotals {
  input: number;
  output: number;
  cacheRead: number;
  cacheWrite: number;
  cost: number;
}

interface UsageReport extends UsageTotals {
  days: number;
  range: DateRange;
  sessions: number;
  skippedSessions: number;
  totalTokens: number;
}

interface LegacyWorkflowUsage {
  input?: number;
  output?: number;
  cacheRead?: number;
  cacheWrite?: number;
  cost?: number;
}

interface LegacyWorkflowChild {
  usage?: LegacyWorkflowUsage;
}

interface LegacyWorkflowDetails {
  implementation?: LegacyWorkflowChild;
  rounds?: Array<{
    reviews?: Array<{ result?: LegacyWorkflowChild }>;
    feedback?: LegacyWorkflowChild;
  }>;
}

interface EntryUsage {
  key: string;
  totals: UsageTotals;
}

export function parseDays(args: string): number {
  const value = args.trim();
  if (!value) return DEFAULT_DAYS;

  const match = /^([1-9]\d*)d$/.exec(value);
  const days = match ? Number(match[1]) : Number.NaN;
  if (!Number.isSafeInteger(days)) {
    throw new Error("Usage: /usage [Nd], for example /usage 7d");
  }
  return days;
}

export function calendarWindow(days: number, now = new Date()): DateRange {
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - days + 1);
  if (Number.isNaN(start.getTime()))
    throw new Error("Usage range is too large");
  return { start, end: now };
}

function emptyTotals(): UsageTotals {
  return { input: 0, output: 0, cacheRead: 0, cacheWrite: 0, cost: 0 };
}

function standardTotals(usage: Usage): UsageTotals {
  return {
    input: usage.input ?? 0,
    output: usage.output ?? 0,
    cacheRead: usage.cacheRead ?? 0,
    cacheWrite: usage.cacheWrite ?? 0,
    cost: usage.cost?.total ?? 0,
  };
}

function legacyTotals(usage: LegacyWorkflowUsage): UsageTotals {
  return {
    input: usage.input ?? 0,
    output: usage.output ?? 0,
    cacheRead: usage.cacheRead ?? 0,
    cacheWrite: usage.cacheWrite ?? 0,
    cost: usage.cost ?? 0,
  };
}

function entryUsage(entry: SessionEntry): EntryUsage[] {
  if (entry.type === "compaction" || entry.type === "branch_summary") {
    return entry.usage
      ? [{ key: "summary", totals: standardTotals(entry.usage) }]
      : [];
  }
  if (entry.type !== "message") return [];

  const message = entry.message;
  if (message.role === "assistant") {
    return [{ key: "assistant", totals: standardTotals(message.usage) }];
  }
  if (message.role !== "toolResult") return [];
  if (message.usage) {
    return [{ key: "tool", totals: standardTotals(message.usage) }];
  }
  if (message.toolName !== "workflow_cycle") return [];

  const details = message.details as LegacyWorkflowDetails | undefined;
  const children: Array<LegacyWorkflowChild | undefined> = [
    details?.implementation,
    ...(details?.rounds ?? []).flatMap((round) => [
      ...(round.reviews ?? []).map((review) => review.result),
      round.feedback,
    ]),
  ];
  return children.flatMap((child, index) =>
    child?.usage
      ? [{ key: `workflow:${index}`, totals: legacyTotals(child.usage) }]
      : []
  );
}

function add(target: UsageTotals, value: UsageTotals): void {
  target.input += value.input;
  target.output += value.output;
  target.cacheRead += value.cacheRead;
  target.cacheWrite += value.cacheWrite;
  target.cost += value.cost;
}

export async function collectUsage(
  days: number,
  range: DateRange
): Promise<UsageReport> {
  const totals = emptyTotals();
  const seen = new Set<string>();
  let sessions = 0;
  let skippedSessions = 0;

  for (const session of await SessionManager.listAll()) {
    let contributed = false;
    try {
      for (const entry of SessionManager.open(session.path).getEntries()) {
        const timestamp = new Date(entry.timestamp);
        if (timestamp < range.start || timestamp > range.end) continue;

        for (const usage of entryUsage(entry)) {
          const key = `${entry.id}:${entry.timestamp}:${usage.key}`;
          if (seen.has(key)) continue;
          seen.add(key);
          add(totals, usage.totals);
          contributed = true;
        }
      }
    } catch {
      skippedSessions++;
    }
    if (contributed) sessions++;
  }

  return {
    ...totals,
    days,
    range,
    sessions,
    skippedSessions,
    totalTokens:
      totals.input + totals.output + totals.cacheRead + totals.cacheWrite,
  };
}

export function formatReport(report: UsageReport): string {
  const lines = [
    `Usage · last ${report.days} calendar day${report.days === 1 ? "" : "s"}`,
    `${date.format(report.range.start)} – ${date.format(report.range.end)}`,
    "",
    `Sessions: ${number.format(report.sessions)}`,
    `Input: ${number.format(report.input)} tokens`,
    `Output: ${number.format(report.output)} tokens`,
    `Cache reads: ${number.format(report.cacheRead)} tokens`,
    `Cache writes: ${number.format(report.cacheWrite)} tokens`,
    `Total: ${number.format(report.totalTokens)} tokens`,
    `Estimated API-equivalent cost: $${report.cost.toFixed(2)}`,
  ];
  if (report.skippedSessions) {
    lines.push(`Skipped unreadable sessions: ${report.skippedSessions}`);
  }
  return lines.join("\n");
}

if (process.env.PI_USAGE_SELF_TEST === "1") {
  assert.equal(parseDays(""), 30);
  assert.equal(parseDays("7d"), 7);
  assert.throws(() => parseDays("0d"));
  assert.throws(() => parseDays("7"));
  const now = new Date(2026, 7, 19, 13, 14, 15);
  const range = calendarWindow(7, now);
  assert.equal(range.start.getFullYear(), 2026);
  assert.equal(range.start.getMonth(), 7);
  assert.equal(range.start.getDate(), 13);
  assert.equal(range.start.getHours(), 0);
  assert.equal(range.end, now);
}

export default function usageExtension(pi: ExtensionAPI): void {
  pi.registerCommand("usage", {
    description: "Report token usage and cost for last N calendar days",
    handler: async (args, ctx) => {
      try {
        const days = parseDays(args);
        const report = await collectUsage(days, calendarWindow(days));
        ctx.ui.notify(formatReport(report), "info");
      } catch (error) {
        ctx.ui.notify(
          error instanceof Error ? error.message : String(error),
          "error"
        );
      }
    },
  });
}
