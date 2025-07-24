import React from "react";

interface Props {
  params: Promise<{ projectId: string }>;
}

const ProjectPage = async ({ params }: Props) => {
  const { projectId } = await params;

  return <div>Project id {projectId}</div>;
};

export default ProjectPage;
