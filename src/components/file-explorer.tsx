import React, { Fragment, useCallback, useMemo, useState } from "react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "./ui/resizable";
import { Hint } from "./ui/hint";
import { Button } from "./ui/button";
import { CopyCheckIcon, CopyIcon } from "lucide-react";
import CodeView from "./ui/code-view";
import { convertFilesToTreeItems } from "@/lib/utils";
import TreeView from "./tree-view";
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "./ui/breadcrumb";

type FileCollection = { [path: string]: string };

interface FileExplorerProps {
  files: FileCollection;
}

interface FilesBreadcrumbProps {
  path: string;
}

const FileBreadcrumb = ({ path }: FilesBreadcrumbProps) => {
  const pathSegments = path.split("/");
  const maxSegments = 3;

  const renderBreadcrumbItems = () => {
    if (pathSegments.length <= maxSegments) {
      // Show all segments if 4 or less
      return pathSegments.map((segment, index) => {
        const isLast = index === pathSegments.length - 1;

        return (
          <Fragment key={index}>
            <BreadcrumbItem>
              {isLast ? (
                <BreadcrumbPage className="font-medium">
                  {segment}
                </BreadcrumbPage>
              ) : (
                <span className="text-muted-foreground">{segment}</span>
              )}
            </BreadcrumbItem>
            {!isLast && <BreadcrumbSeparator className="self-end" />}
          </Fragment>
        );
      });
    } else {
      const firstFragment = pathSegments[0];
      const lastFragment = pathSegments[pathSegments.length - 1];

      return (
        <>
          <BreadcrumbItem>
            <span className="text-muted-foreground">{firstFragment}</span>
          </BreadcrumbItem>

          <BreadcrumbSeparator className="self-end" />

          <BreadcrumbItem>
            <BreadcrumbEllipsis />
          </BreadcrumbItem>

          <BreadcrumbSeparator className="self-end" />

          <BreadcrumbItem>
            <BreadcrumbPage className="font-medium">
              {lastFragment}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </>
      );
    }
  };

  return (
    <Breadcrumb>
      <BreadcrumbList>{renderBreadcrumbItems()}</BreadcrumbList>
    </Breadcrumb>
  );
};

const getLanguageFromExtension = (fileName: string) => {
  const extension = fileName.split(".").pop()?.toLowerCase();

  return extension || "text";
};

const FileExplorer = ({ files }: FileExplorerProps) => {
  const [selectedFile, setSelectedFile] = React.useState<string | null>(() => {
    const fileKeys = Object.keys(files);
    return fileKeys.length > 0 ? fileKeys[0] : null;
  });

  const [copied, setCopied] = useState(false);

  const treeData = useMemo(() => {
    return convertFilesToTreeItems(files);
  }, [files]);

  const handleFileSelect = useCallback(
    (filePath: string) => {
      if (files[filePath]) {
        setSelectedFile(filePath);
      }
    },
    [files]
  );

  const handleCopy = () => {
    if (selectedFile) {
      navigator.clipboard.writeText(files[selectedFile]);

      setCopied(true);

      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <ResizablePanelGroup direction="horizontal">
      <ResizablePanel
        defaultSize={30}
        minSize={30}
        className="bg-sidebar"
      >
        <TreeView
          data={treeData}
          value={selectedFile}
          onSelect={handleFileSelect}
        />
      </ResizablePanel>

      <ResizableHandle className="hover:bg-primary transition-colors" />

      <ResizablePanel
        defaultSize={70}
        minSize={50}
      >
        {selectedFile && files[selectedFile] ? (
          <div className="h-full w-full flex flex-col">
            <div className="border-b bg-sidebar px-4 py-2 flex justify-between items-center gap-x-2">
              <FileBreadcrumb path={selectedFile} />
              <Hint
                text="Copy to clipboard"
                side="bottom"
              >
                <Button
                  variant="outline"
                  size="icon"
                  className="ml-auto"
                  onClick={handleCopy}
                  disabled={copied}
                >
                  {copied ? <CopyCheckIcon /> : <CopyIcon />}
                </Button>
              </Hint>
            </div>

            <div className="flex-1 overflow-auto">
              <CodeView
                code={files[selectedFile]}
                language={getLanguageFromExtension(selectedFile)}
              />
            </div>
          </div>
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            Select a file to view it&apos;s content
          </div>
        )}
      </ResizablePanel>
    </ResizablePanelGroup>
  );
};

export default FileExplorer;
