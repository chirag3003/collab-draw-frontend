import Project from "@/components/projects/Project";

interface ProjectPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { id } = await params;
  // const { data: projectData, loading } = useProjectByID(id);
  return <Project projectID={id} />;
}