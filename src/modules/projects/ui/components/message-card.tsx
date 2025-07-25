import { Card } from "@/components/ui/card";
import { Fragment, MessageRole, MessageType } from "@/generated/prisma";
import { cn } from "@/lib/utils";
import React from "react";

interface MessageCardProps {
  content: string;
  role: MessageRole;
  fragment: Fragment | null; // Replace 'any' with the appropriate type if known
  createdAt: Date;
  isActiveFragment: boolean;
  onFragmentClick: () => void;
  type: MessageType;
}

interface UserMessageProps {
  content: string;
}

interface AssistantMessageProps {
  content: string;
  fragment: Fragment | null; // Replace 'any' with the appropriate type if known
  createdAt: Date;
  isActiveFragment: boolean;
  onFragmentClick: () => void;
  type: MessageType;
}

const UserMessage = ({ content }: UserMessageProps) => (
  <div className="flex justify-end pb-4 pr-2 pl-10">
    <Card className="rounded-lg bg-muted p-3 shadow-none border-none max-w-[80%] break-words">
      {content}
    </Card>
  </div>
);

const AssistantMessage = ({
  content,
  fragment,
  createdAt,
  isActiveFragment,
  onFragmentClick,
  type,
}: AssistantMessageProps) => (
  <div
    className={cn(
      "flex flex-col group px-2 pb-4",
      type === "ERROR" && "text-red-500 dark:text-red-400"
    )}
  >
    <div>
      <span className="text-sm font-medium"></span>
      <span></span>
      <span></span>
    </div>
    <Card className="rounded-lg bg-muted p-3 shadow-none border-none max-w-[80%] break-words">
      {content}
    </Card>
  </div>
);

const MessageCard = ({
  content,
  role,
  fragment,
  createdAt,
  isActiveFragment,
  onFragmentClick,
  type,
}: MessageCardProps) => {
  if (role === "ASSISTANT") {
    return (
      <AssistantMessage
        {...{
          content,
          fragment,
          createdAt,
          isActiveFragment,
          onFragmentClick,
          type,
        }}
      />
    );
  }

  return <UserMessage content={content} />;
};

export default MessageCard;
