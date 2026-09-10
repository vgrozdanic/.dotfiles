import type { ExtensionAPI, ExtensionContext } from "@earendil-works/pi-coding-agent";
import type { McpLifecycleManager } from "./lifecycle.ts";
import type { McpServerManager } from "./server-manager.ts";
import type { AuthStorageOptions } from "./mcp-auth.ts";
import type { ToolMetadata, PromptMetadata, McpConfig, McpStatusEventBus } from "./types.ts";
import type { McpRuntimeOwner } from "./runtime-owner.ts";
import type { McpOAuthRuntime } from "./mcp-auth-flow.ts";

export type SendMessageFn = (
  message: {
    customType: string;
    content: Array<{ type: "text"; text: string }>;
    display?: string;
    details?: unknown;
  },
  options?: { triggerTurn?: boolean }
) => void;

export interface McpExtensionState {
  owner: McpRuntimeOwner;
  manager: McpServerManager;
  lifecycle: McpLifecycleManager;
  toolMetadata: Map<string, ToolMetadata[]>;
  /** Resource counts retained separately because tool metadata includes resource tools. */
  resourceCounts: Map<string, number>;
  promptMetadata: Map<string, PromptMetadata[]>;
  /** Servers whose prompt inventory came from successful live discovery. */
  promptMetadataLive: Set<string>;
  serverInstructions: Map<string, string>;
  config: McpConfig;
  programmaticConfig?: boolean;
  oauthRuntime: McpOAuthRuntime;
  authStorageOptions: AuthStorageOptions;
  failureTracker: Map<string, number>;
  failureMessages: Map<string, string>;
  /** Session-only approvals keyed by server and original tool name. */
  approvedToolCalls: Map<string, true>;
  /** Shared event bus used by permission extensions to broker MCP approvals. */
  approvalEvents?: ExtensionAPI["events"];
  ui?: ExtensionContext["ui"];
  sendMessage?: SendMessageFn;
  onToolMetadataUpdated?: (serverName: string, reason: string) => void | Promise<void>;
  statusEvents?: McpStatusEventBus;
}
