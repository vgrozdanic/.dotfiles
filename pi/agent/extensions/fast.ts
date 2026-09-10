import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

const FAST_MODELS = new Set([
  "gpt-5.4",
  "gpt-5.5",
  "gpt-5.6",
  "gpt-5.6-sol",
  "gpt-5.6-terra",
  "gpt-5.6-luna",
]);

function supportsFastMode(model: { provider: string; id: string } | undefined): boolean {
  return (
    model !== undefined &&
    (model.provider === "openai" || model.provider === "openai-codex") &&
    FAST_MODELS.has(model.id)
  );
}

export function applyFastMode(
  payload: unknown,
  model: { provider: string; id: string } | undefined,
  enabled: boolean,
): unknown | undefined {
  if (!enabled || !supportsFastMode(model) || typeof payload !== "object" || payload === null || Array.isArray(payload)) {
    return undefined;
  }

  return { ...payload, service_tier: "priority" };
}

export default function (pi: ExtensionAPI) {
  let enabled = true;

  const updateStatus = (ctx: { model: { provider: string; id: string } | undefined; ui: { setStatus(key: string, text: string | undefined): void } }) => {
    ctx.ui.setStatus("fast-mode", enabled && supportsFastMode(ctx.model) ? "fast" : undefined);
  };

  pi.registerCommand("fast", {
    description: "Toggle OpenAI Fast Mode. Usage: /fast [on|off|toggle]",
    getArgumentCompletions: prefix => ["on", "off", "toggle"]
      .filter(option => option.startsWith(prefix.trim().toLowerCase()))
      .map(value => ({ value, label: value })),
    handler: async (args, ctx) => {
      const command = args.trim().toLowerCase();
      if (command === "" || command === "toggle") enabled = !enabled;
      else if (command === "on") enabled = true;
      else if (command === "off") enabled = false;
      else {
        ctx.ui.notify("Usage: /fast [on|off|toggle]", "error");
        return;
      }

      updateStatus(ctx);
      ctx.ui.notify(`Fast mode ${enabled ? "enabled" : "disabled"}.`, "info");
    },
  });

  pi.on("session_start", (_event, ctx) => updateStatus(ctx));
  pi.on("model_select", (_event, ctx) => updateStatus(ctx));
  pi.on("before_provider_request", (event, ctx) =>
    applyFastMode(event.payload, ctx.model, enabled),
  );
}
