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

  return <Project projectID={id} />;
}

 export async function generateMetadata({ params }: ProjectPageProps) {
    const { id } = await params;
    const apollo = await getServerApollo();
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

    const title = data?.project?.name || "Project";

    if (!data?.project) {
      redirect("/app");
    }

    return {
      title,
    };
  }