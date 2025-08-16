import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import React, { useEffect, useRef } from "react";

import MessageCard from "./message-card";
import MessageForm from "./message-form";
import { Fragment } from "@/generated/prisma";
import MessageLoading from "./message-loading";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@radix-ui/react-dropdown-menu";
import { Send, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  projectId: string;
  activeFragment: Fragment | null;
  setActiveFragment: (fragment: Fragment | null) => void;
}

const MessagesContainer = ({
  projectId,
  activeFragment,
  setActiveFragment,
}: Props) => {
  const trpc = useTRPC();
  const bottomRef = useRef<HTMLDivElement>(null);
  const lastAssistantMessageIdRef = useRef<string | null>(null);

  const { data: messages } = useSuspenseQuery(
    trpc.messages.getMany.queryOptions(
      {
        projectId,
      },
      { refetchInterval: 5000 }
    )
  );

  useEffect(() => {
    const lastAssistantMessage = messages.findLast((message) => {
      return message.role === "ASSISTANT";
    });

    if (
      lastAssistantMessage?.fragment &&
      lastAssistantMessage.id !== lastAssistantMessageIdRef.current
    ) {
      setActiveFragment(lastAssistantMessage.fragment);
      lastAssistantMessageIdRef.current = lastAssistantMessage.id;
    }
  }, [messages, setActiveFragment]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const lastMessage = messages[messages.length - 1];
  const isLastMessageUser = lastMessage?.role === "USER";

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="pt-2 pr-1">
          {messages.map((message) => (
            <MessageCard
              key={message.id}
              content={message.content}
              role={message.role}
              fragment={message.fragment}
              createdAt={message.createdAt}
              isActiveFragment={activeFragment?.id === message.fragment?.id}
              onFragmentClick={() => setActiveFragment(message.fragment)}
              type={message.type}
            />
          ))}

          {isLastMessageUser && <MessageLoading />}

          <div ref={bottomRef} />
        </div>
      </div>

      <div className="relative p-3 pt-1">
        <div className="absolute -top-6 left-0 right-0 h-6 bg-gradient-to-b from-transparent to-background/70 pointer-events-none"></div>
        <MessageForm projectId={projectId} />
      </div>
    </div>
  );
};

const MessagesContainerSkeleton = () => {
  return (
    <div className="mx-auto grid w-full max-w-screen-xl grid-cols-1 gap-4 p-2 sm:p-4 lg:grid-cols-12">
      {/* Left: conversation column */}
      <div className="lg:col-span-7 xl:col-span-8 space-y-4">
        {/* User prompt chip */}
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 opacity-40" />
              <Skeleton className="h-4 w-40" />
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/6" />
            <Skeleton className="h-4 w-3/6" />
          </CardContent>
        </Card>

        {/* Assistant response block */}
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Skeleton className="h-6 w-6 rounded-md" />
              <CardTitle className="text-base font-medium text-muted-foreground">
                <Skeleton className="h-5 w-48" />
              </CardTitle>
            </div>
          </CardHeader>
          <Separator />
          <CardContent className="space-y-3 pt-4">
            <Skeleton className="h-4 w-[92%]" />
            <Skeleton className="h-4 w-[84%]" />
            <Skeleton className="h-4 w-[76%]" />

            {/* Inline preview card placeholder */}
            <div className="pt-2">
              <Card className="border-dashed shadow-none">
                <CardContent className="flex items-center gap-3 p-4">
                  <Skeleton className="h-10 w-10 rounded-md" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-3 w-1/3" />
                  </div>
                  <Skeleton className="h-8 w-24 rounded-md" />
                </CardContent>
              </Card>
            </div>

            {/* Secondary message */}
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-4 w-1/2" />
          </CardContent>
        </Card>

        {/* Composer */}
        <div className="sticky bottom-2 z-10">
          <div className="flex items-center gap-2 rounded-xl border bg-card p-2 shadow-sm sm:gap-3 sm:p-3">
            <Skeleton className="h-10 w-10 rounded-md" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-2/4" />
            </div>
            <Button
              size="icon"
              disabled
            >
              <Send className="h-4 w-4" />
              <span className="sr-only">Send</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Right: preview pane */}
      <div className="lg:col-span-5 xl:col-span-4 space-y-4">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              <Skeleton className="h-4 w-40" />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="aspect-video w-full overflow-hidden rounded-xl border">
              <Skeleton className="h-full w-full" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Skeleton className="h-8 w-full rounded-md" />
              <Skeleton className="h-8 w-full rounded-md" />
            </div>
          </CardContent>
        </Card>

        {/* Secondary card list */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-1">
          {[0, 1, 2].map((i) => (
            <Card
              key={i}
              className="shadow-sm"
            >
              <CardContent className="flex items-center gap-3 p-4">
                <Skeleton className="h-12 w-12 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
                <Skeleton className="h-8 w-16 rounded-md" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export { MessagesContainer, MessagesContainerSkeleton };
