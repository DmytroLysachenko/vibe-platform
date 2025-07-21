import { inngest } from "./client";
import { Sandbox } from "@e2b/code-interpreter";
import { openai, createAgent } from "@inngest/agent-kit";
import { getSandbox } from "./utils";

export const helloWorld = inngest.createFunction(
  { id: "hello-world" },
  { event: "test/hello.world" },
  async ({ event, step }) => {
    const sandboxId = await step.run("get-sandbox-id", async () => {
      const sandbox = await Sandbox.create("6r2jgzswf42j0eavwk0n");
      return sandbox.sandboxId;
    });

    const codeAgent = createAgent({
      name: "Code Agent",
      system:
        "You are an expert next.js developer. You write readable, maintainable, and efficient code. You write simple Next.js & React snippets.",
      model: openai({ model: "gpt-4o" }),
    });

    const { output } = await codeAgent.run(
      `Write the following snippet: ${event.data.email}`
    );

    const sandboxUrl = await step.run("get-sandbox-url", async () => {
      try {
        const sandbox = await getSandbox(sandboxId);
        const host = sandbox.getHost(3000);
        return `https://${host}`;
      } catch (error) {
        throw new Error(`Failed to get sandbox URL: ${error}`);
      }
    });
    return { output, sandboxUrl };
  }
);
