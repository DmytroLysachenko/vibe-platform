import { Sandbox } from "@e2b/code-interpreter";

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
