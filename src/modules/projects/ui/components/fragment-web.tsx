import { ExternalLinkIcon, RefreshCcwIcon } from "lucide-react";
import React, { useState } from "react";

import { Button } from "@/components/ui/button";
import { Hint } from "@/components/ui/hint";
import { Fragment } from "@/generated/prisma";

interface Props {
  data: Fragment;
}

const FragmentWeb = ({ data }: Props) => {
  const [copied, setCopied] = useState(false);
  const [fragmentKey, setFragmentKey] = useState(0);

  const onRefresh = () => {
    setFragmentKey((previousKey) => previousKey + 1);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(data.sandboxUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col w-full h-full">
      <div className="p-2 border-b bg-sidebar flex items-center gap-x-2">
        <Hint
          text="Refresh page"
          side="bottom"
          align="start"
        >
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
          >
            <RefreshCcwIcon />
          </Button>
        </Hint>
        <Hint
          text="Click to copy the URL"
          side="bottom"
          align="center"
        >
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            disabled={!data.sandboxUrl || copied}
            className="flex-1 justify-start text-start font-normal"
          >
            <span className="truncate">{data.sandboxUrl}</span>
          </Button>
        </Hint>
        <Hint
          text="Open in a new tab"
          side="bottom"
          align="start"
        >
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (!data.sandboxUrl) return;

              window.open(data.sandboxUrl, "_blank");
            }}
            disabled={!data.sandboxUrl}
          >
            <ExternalLinkIcon />
          </Button>
        </Hint>
      </div>
      <iframe
        fragment-key={fragmentKey}
        className="w-full h-full"
        sandbox="allow-forms allow-scripts allow-same-origin"
        loading="lazy"
        src={data.sandboxUrl}
      />
    </div>
  );
};

export default FragmentWeb;
