import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import React from "react";

import ProjectView from "@/modules/projects/ui/views/project-view";
import { getQueryClient, trpc } from "@/trpc/server";

interface Props {
  params: Promise<{ projectId: string }>;
}

const ProjectPage = async ({ params }: Props) => {
  const { projectId } = await params;

  const queryClient = getQueryClient();

  void queryClient.prefetchQuery(
    trpc.projects.getOne.queryOptions({ id: projectId })
  );

  void queryClient.prefetchQuery(
    trpc.messages.getMany.queryOptions({ projectId })
  );

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ProjectView projectId={projectId} />
    </HydrationBoundary>
  );
};

export default ProjectPage;
