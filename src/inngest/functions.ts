import { Sandbox } from "@e2b/code-interpreter";
import {
  openai,
  createAgent,
  createTool,
  createNetwork,
  Tool,
  Message,
  createState,
} from "@inngest/agent-kit";
import { z } from "zod";

import { FRAGMENT_TITLE_PROMPT, PROMPT, RESPONSE_PROMPT } from "@/prompt";
import prisma from "@/lib/db";
import { inngest } from "./client";
import { getSandbox, lastAssistantTextMessageContent, isFilesMap } from "./utils";

interface AgentState {
  summary: string;
  files: { [path: string]: string };
}

export const codeAgentFunction = inngest.createFunction(
  { id: "code-agent" },
  { event: "code-agent/run" },
  async ({ event, step }) => {
    const sandboxId = await step.run("get-sandbox-id", async () => {
      const sandbox = await Sandbox.create("6r2jgzswf42j0eavwk0n");
      return sandbox.sandboxId;
    });

    const previousMessages = await step.run(
      "get-previous-messages",
      async () => {
        const formattedMessages: Message[] = [];

        const messages = await prisma.message.findMany({
          where: {
            projectId: event.data.projectId,
          },
          orderBy: {
            createdAt: "desc",
          },
        });

        for (const message of messages) {
          if (messages.indexOf(message) === 0) continue;

          formattedMessages.push({
            type: "text",
            role: message.role === "USER" ? "user" : "assistant",
            content: `${messages.indexOf(message) + 1}. ${message.content}`,
          });
        }

        return formattedMessages;
      }
    );

    const previousFiles = await step.run("get-previous-code", async () => {
      const messages = await prisma.message.findFirst({
        where: {
          projectId: event.data.projectId,
          role: "ASSISTANT",
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      if (!messages) {
        return {};
      }

      const frag= await prisma.fragment.findFirst({
        where: {
          messageId: messages.id,
        },
          select: { files: true },
      });

        if (!frag || frag.files == null) return {};


  const files = frag.files
 if (typeof files === "string") {
    try {
      const parsed = JSON.parse(files);
      return isFilesMap(parsed) ? parsed : {};
    } catch {
      return {};
    }
  }

  // If stored as JSON/JSONB, it's already parsed
  if (isFilesMap(files)) return files;

  return {};


    });

    const state = createState<AgentState>(
      {
        summary: "",
        files: previousFiles,
      },
      {
        messages: previousMessages,
      }
    );

    const codeAgent = createAgent<AgentState>({
      name: "code-agent",
      system: PROMPT,
      model: openai({
        model: "gpt-4.1-2025-04-14",
        defaultParameters: {
          temperature: 0.1,
        },
      }),
      tools: [
        createTool({
          name: "terminal",
          description: "Use the terminal to run commands",
          parameters: z
            .object({
              command: z.string(),
            })
            .strict(),
          handler: async ({ command }, { step }) => {
            return step?.run("terminal", async () => {
              const buffers = { stdout: "", stderr: "" };

              try {
                const sandbox = await getSandbox(sandboxId);

                const result = await sandbox.commands.run(command, {
                  onStdout: (data) => {
                    buffers.stdout += data.toString();
                  },
                  onStderr: (data) => {
                    buffers.stderr += data.toString();
                  },
                });

                return result.stdout;
              } catch (error) {
                console.error(
                  `Command failed: ${error} \nstdout: ${buffers.stdout} \nstderr: ${buffers.stderr}`
                );
                return `Command failed: ${error} \nstdout: ${buffers.stdout} \nstderr: ${buffers.stderr}`;
              }
            });
          },
        }),
        createTool({
          name: "createOrUpdateFiles",
          description: "Create or update files in the sandbox",
          parameters: z
            .object({
              files: z.array(
                z.object({ path: z.string(), content: z.string() })
              ),
            })
            .strict(),
          handler: async (
            { files },
            { step, network }: Tool.Options<AgentState>
          ) => {
            const newFiles = await step?.run(
              "createOrUpdateFiles",
              async () => {
                try {
                  const updatedFiles = network.state.data.files || {};
                  const sandbox = await getSandbox(sandboxId);

                  for (const file of files) {
                    await sandbox.files.write(file.path, file.content);

                    updatedFiles[file.path] = file.content;
                  }

                  return updatedFiles;
                } catch (error) {
                  return `Failed to create or update files: ${error}`;
                }
              }
            );

            if (typeof newFiles === "object") {
              network.state.data.files = newFiles;
            }
          },
        }),
        createTool({
          name: "readFiles",
          description: "Read files from the sandbox",
          parameters: z
            .object({
              files: z.array(z.string()),
            })
            .strict(),
          handler: async ({ files }, { step }) => {
            return await step?.run("readFiles", async () => {
              try {
                const sandbox = await getSandbox(sandboxId);
                const contents = [];

                for (const file of files) {
                  const content = await sandbox.files.read(file);
                  contents.push({ path: file, content });
                }

                return JSON.stringify(contents);
              } catch (error) {
                return `Failed to read files: ${error}`;
              }
            });
          },
        }),
      ],
      lifecycle: {
        onResponse: async ({ result, network }) => {
          const lastAssistantTextMessage =
            lastAssistantTextMessageContent(result);

          if (lastAssistantTextMessage && network) {
            if (lastAssistantTextMessage.includes("<task_summary>")) {
              network.state.data.summary = lastAssistantTextMessage;
            }
          }

          return result;
        },
      },
    });

    const network = createNetwork<AgentState>({
      name: "coding-agent-network",
      agents: [codeAgent],
      maxIter: 15,
      defaultState: state,
      router: async ({ network }) => {
        const summary = network.state.data.summary;

        if (summary) {
          return;
        }
        return codeAgent;
      },
    });

    const result = await network.run(event.data.value, { state });

    const fragmentTitleGenerator = createAgent<AgentState>({
      name: "fragment-title-generator",
      description: "A fragment title generator",
      system: FRAGMENT_TITLE_PROMPT,
      model: openai({
        model: "gpt-5-mini",
      }),
    });

    const responseGenerator = createAgent<AgentState>({
      name: "response-generator",
      description: "A response generator",
      system: RESPONSE_PROMPT,
      model: openai({
        model: "gpt-5-mini",
      }),
    });

    const { output: fragmentTitleOutput } = await fragmentTitleGenerator.run(
      result.state.data.summary
    );

    const { output: responseOutput } = await responseGenerator.run(
      result.state.data.summary
    );

    const generateFragmentTitle = () => {
      if (fragmentTitleOutput[0].type !== "text") {
        return "Fragment";
      }

      if (Array.isArray(fragmentTitleOutput[0].content)) {
        return fragmentTitleOutput[0].content
          .map((content) => content.text)
          .join("");
      }

      return fragmentTitleOutput[0].content;
    };

    const generateResponse = () => {
      if (responseOutput[0].type !== "text") {
        return "This is a result";
      }

      if (Array.isArray(responseOutput[0].content)) {
        return responseOutput[0].content
          .map((content) => content.text)
          .join("");
      }

      return responseOutput[0].content;
    };

    const isError =
      !result.state.data.summary ||
      Object.keys(result.state.data.files || {}).length === 0;

    const sandboxUrl = await step.run("get-sandbox-url", async () => {
      try {
        const sandbox = await getSandbox(sandboxId);
        const host = sandbox.getHost(3000);
        return `https://${host}`;
      } catch (error) {
        throw new Error(`Failed to get sandbox URL: ${error}`);
      }
    });

    await step.run("save-result", async () => {
      if (isError) {
        return await prisma.message.create({
          data: {
            projectId: event.data.projectId,
            content: "Something went wrong. Try again later",
            role: "ASSISTANT",
            type: "ERROR",
          },
        });
      }

      return await prisma.message.create({
        data: {
          projectId: event.data.projectId,
          content: generateResponse(),
          role: "ASSISTANT",
          type: "RESULT",
          fragment: {
            create: {
              title: generateFragmentTitle(),
              sandboxUrl,
              files: result.state.data.files,
            },
          },
        },
      });
    });

    return {
      url: sandboxUrl,
      title: "Fragment",
      files: result.state.data.files,
      summary: result.state.data.summary,
    };
  }
);
