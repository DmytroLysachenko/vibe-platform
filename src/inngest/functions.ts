import { inngest } from "./client";

import { openai, createAgent } from "@inngest/agent-kit";

export const helloWorld = inngest.createFunction(
  { id: "hello-world" },
  { event: "test/hello.world" },
  async ({ event, step }) => {
    const codeAgent = createAgent({
      name: "Code Agent",
      system:
        "You are an expert next.js developer. You write readable, maintainable, and efficient code. You write simple Next.js & React snippets.",
      model: openai({ model: "gpt-4o" }),
    });

    const { output } = await codeAgent.run(
      `Write the following snippet: ${event.data.email}`
    );

    await step.sleep("wait-a-moment", "30s");
    return { output };
  }
);
