import { useSuspenseQuery } from "@tanstack/react-query";
import {
  ChevronDown,
  ChevronDownIcon,
  ChevronLeftIcon,
  SunMoonIcon,
} from "lucide-react";
import { useTheme } from "next-themes";
import Image from "next/image";
import Link from "next/link";
import React from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTRPC } from "@/trpc/client";
import { Skeleton } from "@/components/ui/skeleton";

interface Props {
  projectId: string;
}

const ProjectHeader = ({ projectId }: Props) => {
  const trpc = useTRPC();
  const { data: project } = useSuspenseQuery(
    trpc.projects.getOne.queryOptions({
      id: projectId,
    })
  );

  const { setTheme, theme } = useTheme();

  return (
    <header className="p-2 flex justify-between items-center  border-b">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="focus-visible:ring-0 hover:bg-transparent hover:opacity-75 transition-opacity pl-2!"
          >
            <Image
              src={"/logo.webp"}
              width={24}
              height={24}
              alt={"Vibe"}
            />

            <span className="text-sm font-medium">{project.name}</span>

            <ChevronDownIcon />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent>
          <DropdownMenuItem asChild>
            <Link href="/">
              <ChevronLeftIcon /> <span>Go to Dashboard</span>
            </Link>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="gap-2">
              <SunMoonIcon className="size-4 text-muted-foreground" />

              <span>Appearance</span>
            </DropdownMenuSubTrigger>

            <DropdownMenuPortal>
              <DropdownMenuSubContent sideOffset={4}>
                <DropdownMenuRadioGroup
                  value={theme}
                  onValueChange={setTheme}
                >
                  <DropdownMenuRadioItem value="light">
                    <span>Light</span>
                  </DropdownMenuRadioItem>

                  <DropdownMenuRadioItem value="dark">
                    <span>Dark</span>
                  </DropdownMenuRadioItem>

                  <DropdownMenuRadioItem value="system">
                    <span>System</span>
                  </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
};

const ProjectHeaderSkeleton = () => {
  return (
    <div className="w-full border-b bg-background">
      <div className="mx-auto flex h-12 max-w-screen-2xl items-center gap-2 px-2 sm:h-14 sm:px-4">
        <div className="flex items-center gap-2">
          <Skeleton className="h-6 w-6 rounded-md" />
          <div className="hidden sm:flex items-center gap-2">
            <Skeleton className="h-5 w-44" />
            <ChevronDown className="h-4 w-4 opacity-40" />
          </div>
        </div>

        <div className="flex-1" />

        <div className="flex items-center gap-2 sm:gap-3">
          <Skeleton className="h-8 w-20 rounded-md" />
          <Skeleton className="h-8 w-8 rounded-md" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      </div>
    </div>
  );
};

export { ProjectHeader, ProjectHeaderSkeleton };
