import { gql } from "@apollo/client";
import Project from "@/components/projects/Project";
import { getServerApollo } from "@/lib/serverApollo";
import { redirect } from "next/navigation";

interface ProjectPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { id } = await params;

  const apollo = await getServerApollo();
  try {
    const { data } = await apollo.query<{
      project: {
        name: string;
      };
    }>({
      query: gql`
        query GetProject($id: ID!) {
          project(id: $id) {
            name
          }
        }
      `,
      variables: { id },
    });
    if (!data?.project) {
      redirect("/app");
    }
  } catch {
    redirect("/app");
  }

  return <Project projectID={id} />;
}

export async function generateMetadata({ params }: ProjectPageProps) {
  const { id } = await params;
  const apollo = await getServerApollo();
  let title = "Project";
  try {
    const { data } = await apollo.query<{
      project: {
        name: string;
      };
    }>({
      query: gql`
        query GetProject($id: ID!) {
          project(id: $id) {
            name
          }
        }
      `,
      variables: { id },
    });
    if (!data?.project) {
      title = "project";
    } else {
      title = data.project.name || "Project";
    }
  } catch {
    title = "Project";
  }

  return {
    title,
  };
}
