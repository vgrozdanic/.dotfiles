import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { getSupportedThinkingLevels, type Model, type ThinkingLevel } from "@earendil-works/pi-ai";

export default function (pi: ExtensionAPI) {
  pi.registerCommand("effort", {
    description: "Choose reasoning effort for current model",
    handler: async (args, ctx) => {
      const levels = getSupportedThinkingLevels(ctx.model as Model<any>);
      if (levels.length === 1 && levels[0] === "off") {
        ctx.ui.notify("Reasoning is unavailable for this model.", "warning");
        return;
      }

      const requested = args.trim() as ThinkingLevel;
      const level = requested || await ctx.ui.select("Reasoning effort", levels);
      if (!level) return;
      if (!levels.includes(level)) {
        ctx.ui.notify(`Unsupported effort "${level}". Choose: ${levels.join(", ")}`, "error");
        return;
      }

      const before = pi.getThinkingLevel();
      pi.setThinkingLevel(level);
      ctx.ui.notify(before === level ? `Reasoning effort is already ${level}.` : `Reasoning effort: ${before} → ${level}.`, "info");
    },
  });
}
