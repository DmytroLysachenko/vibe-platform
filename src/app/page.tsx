"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQuery } from "@tanstack/react-query";
import React from "react";
import { toast } from "sonner";

const Home = () => {
  const [value, setValue] = React.useState("");
  const trpc = useTRPC();
  const { data: messages } = useQuery(trpc.messages.getMany.queryOptions());

  const createMessage = useMutation(
    trpc.messages.create.mutationOptions({
      onSuccess: () => {
        toast.success("Message created");
      },
    })
  );

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      <Button
        disabled={createMessage.isPending}
        onClick={() => createMessage.mutate({ value })}
      >
        Invoke Background Job
      </Button>
      <ul>
        {messages?.map((msg) => (
          <li key={msg.id}>{JSON.stringify(msg)}</li>
        ))}
      </ul>
    </div>
  );
};

export default Home;
