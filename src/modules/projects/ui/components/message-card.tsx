import React from "react";
import { format } from "date-fns";

import { Card } from "@/components/ui/card";
import { Fragment, MessageRole, MessageType } from "@/generated/prisma";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { ChevronRightIcon, Code2Icon } from "lucide-react";

interface MessageCardProps {
  content: string;
  role: MessageRole;
  fragment: Fragment | null; // Replace 'any' with the appropriate type if known
  createdAt: Date;
  isActiveFragment: boolean;
  onFragmentClick: (fragment: Fragment | null) => void;
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
  onFragmentClick: (fragment: Fragment | null) => void;
  type: MessageType;
}

interface FragmentCardProps {
  fragment: Fragment | null;
  isActiveFragment: boolean;
  onFragmentClick: (fragment: Fragment | null) => void;
}

const FragmentCard = ({
  fragment,
  isActiveFragment,
  onFragmentClick,
}: FragmentCardProps) => {
  return (
    <button
      className={cn(
        "flex items-start gap-2 border rounded-lg bg-muted w-fit p-3 hover:bg-secondary transition-colors",
        isActiveFragment &&
          "bg-primary text-primary-foreground border-primary hover:bg-primary"
      )}
      onClick={() => onFragmentClick(fragment)}
    >
      <Code2Icon />
      <div className="flex flex-col flex-1">
        <span className="text-sm font-semibold line-clamp-1">
          {fragment?.title}
        </span>
        <span className="text-sm font-medium text-left">Preview</span>
      </div>
      <div className="flex items-center justify-center mt-0.5">
        <ChevronRightIcon className="size-4" />
      </div>
    </button>
  );
};

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
      type === "ERROR" && "text-red-700 dark:text-red-500"
    )}
  >
    <div className="flex items-center gap-2 pl-2 mb-2">
      <Image
        src={"/logo.webp"}
        width={24}
        height={24}
        alt={"Vibe"}
        className="shrink-0"
      />
      <span className="text-sm font-medium">Vibe</span>
      <span className="text-xs text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">
        {format(createdAt, "HH:mm 'on' MMM dd, yyyy")}
      </span>
    </div>

    <div className="pl-8 flex flex-col gap-y-4">
      <span>{content}</span>
      {fragment && type === "RESULT" && (
        <FragmentCard
          fragment={fragment}
          isActiveFragment={isActiveFragment}
          onFragmentClick={onFragmentClick}
        />
      )}
    </div>
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
