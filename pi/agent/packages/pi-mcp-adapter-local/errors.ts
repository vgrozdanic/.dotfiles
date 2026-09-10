export const INPUT_REQUIRED_NEEDS_UI = "input_required_needs_ui" as const;

export interface InputRequiredNeedsUiDetails {
  error: typeof INPUT_REQUIRED_NEEDS_UI;
  server: string;
  tool?: string;
  resourceUri?: string;
  inputKey: string;
  inputMethod: string;
  message: string;
}

export interface InputRequiredIdentity {
  server: string;
  tool?: string;
  resourceUri?: string;
}

const INPUT_REQUIRED_METHODS = new Set(["elicitation/create", "sampling/createMessage"]);
const MAX_SERVER_LENGTH = 96;
const MAX_TARGET_LENGTH = 160;
const MAX_DETAIL_LENGTH = 128;

function asRecord(value: unknown): Record<string, unknown> | undefined {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : undefined;
}

function boundedText(value: unknown, maxLength: number): string | undefined {
  if (typeof value !== "string" || value.length === 0) return undefined;
  return value.length <= maxLength ? value : `${value.slice(0, maxLength - 1)}…`;
}

interface EmbeddedInputRequest {
  inputKey: string;
  inputMethod: string;
  server?: string;
  tool?: string;
  resourceUri?: string;
}

function findEmbeddedInputRequest(error: unknown): EmbeddedInputRequest | undefined {
  let current: unknown = error;
  const seen = new Set<unknown>();
  for (let depth = 0; depth < 8 && current !== undefined && current !== null; depth++) {
    if (seen.has(current)) return undefined;
    seen.add(current);
    const record = asRecord(current);
    if (!record) return undefined;

    if (record.code === INPUT_REQUIRED_NEEDS_UI) {
      const details = asRecord(record.details);
      const inputKey = boundedText(details?.inputKey, MAX_DETAIL_LENGTH);
      const inputMethod = boundedText(details?.inputMethod, MAX_DETAIL_LENGTH);
      if (inputKey && inputMethod && INPUT_REQUIRED_METHODS.has(inputMethod)) {
        const server = boundedText(details?.server, MAX_SERVER_LENGTH);
        const tool = boundedText(details?.tool, MAX_TARGET_LENGTH);
        const resourceUri = boundedText(details?.resourceUri, MAX_TARGET_LENGTH);
        return {
          inputKey,
          inputMethod,
          ...(server ? {server} : {}),
          ...(tool ? {tool} : {}),
          ...(resourceUri ? {resourceUri} : {}),
        };
      }
    }

    if (record.code === "CAPABILITY_NOT_SUPPORTED") {
      const data = asRecord(record.data);
      const inputKey = boundedText(data?.key, MAX_DETAIL_LENGTH);
      const inputMethod = boundedText(data?.method, MAX_DETAIL_LENGTH);
      if (inputKey && inputMethod && INPUT_REQUIRED_METHODS.has(inputMethod)) {
        return {inputKey, inputMethod};
      }
    }

    current = record.cause;
  }
  return undefined;
}

export function getInputRequiredNeedsUiDetails(
  error: unknown,
  identity: InputRequiredIdentity,
): InputRequiredNeedsUiDetails | undefined {
  const request = findEmbeddedInputRequest(error);
  if (!request) return undefined;

  const server = boundedText(request.server ?? identity.server, MAX_SERVER_LENGTH) ?? "unknown";
  const tool = boundedText(request.tool ?? identity.tool, MAX_TARGET_LENGTH);
  const resourceUri = boundedText(request.resourceUri ?? identity.resourceUri, MAX_TARGET_LENGTH);
  const target = resourceUri
    ? `read resource "${resourceUri}"`
    : tool
      ? `call tool "${tool}"`
      : "complete MCP request";
  const guidance = request.inputMethod === "elicitation/create"
    ? "Run this call in an interactive Pi session with elicitation enabled, then retry."
    : "Run this call in an interactive Pi session with required MCP capability enabled, then retry.";

  return {
    error: INPUT_REQUIRED_NEEDS_UI,
    server,
    ...(tool ? {tool} : {}),
    ...(resourceUri ? {resourceUri} : {}),
    inputKey: request.inputKey,
    inputMethod: request.inputMethod,
    message: `MCP server "${server}" requested input to ${target}, but this session has no handler for "${request.inputMethod}" (input "${request.inputKey}"). ${guidance}`,
  };
}
