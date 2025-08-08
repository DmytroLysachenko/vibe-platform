import { Sandbox } from "@e2b/code-interpreter";
import { AgentResult } from "@inngest/agent-kit";
import type { TextMessage } from "@inngest/agent-kit";

type FilesMap = Record<string, string>;

/**
 * Connects to a sandbox environment by ID
 * @param sandboxId - The unique identifier for the sandbox
 * @returns Promise that resolves to the connected Sandbox instance
 * @throws Error if connection fails or sandboxId is invalid
 */
export const getSandbox = async (sandboxId: string): Promise<Sandbox> => {
  if (!sandboxId?.trim()) {
    throw new Error("Invalid sandbox ID: must be a non-empty string");
  }

  try {
    const sandbox = await Sandbox.connect(sandboxId);
    return sandbox;
  } catch (error) {
    throw new Error(
      `Failed to connect to sandbox '${sandboxId}': ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
};

export const lastAssistantTextMessageContent = (result: AgentResult) => {
  const lastAssistantTextMessageIndex = result.output.findLastIndex(
    (message) => message.role === "assistant"
  );

  const message = result.output[lastAssistantTextMessageIndex] as
    | TextMessage
    | undefined;

  return message?.content
    ? typeof message.content === "string"
      ? message.content
      : message.content.map((content) => content.text).join("")
    : undefined;
};


 export function isFilesMap(v: unknown): v is FilesMap {
  return !!v && typeof v === "object" && !Array.isArray(v) &&
    Object.values(v as Record<string, unknown>).every(val => typeof val === "string");
}