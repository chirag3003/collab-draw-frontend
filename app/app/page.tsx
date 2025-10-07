"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect } from "react";
import ProjectsList from "@/components/app/ProjectsList";
import { 
  useCreateProject, 
  usePersonalProjects,
  useUpdateProjectMetadata,
  useDeleteProject 
} from "@/lib/hooks/project";

export default function App() {
  const [getProjects, { data }] = usePersonalProjects();
  const [createProject] = useCreateProject();
  const [updateProjectMetadata] = useUpdateProjectMetadata();
  const [deleteProject] = useDeleteProject();
  const { user } = useUser();

  const handleCreateProject = async (data: {
    title: string;
    description: string;
  }) => {
    await createProject({
      variables: {
        name: data.title,
        description: data.description,
        personal: true,
        owner: user?.id ?? "",
      },
    });
  };

  const handleUpdateProject = async (data: {
    id: string;
    name: string;
    description: string;
  }) => {
    await updateProjectMetadata({
      variables: {
        ID: data.id,
        name: data.name,
        description: data.description,
      },
    });
  };

  const handleDeleteProject = async (id: string) => {
    await deleteProject({
      variables: {
        ID: id,
      },
    });
  };

  useEffect(() => {
    if (user) {
      console.log("Fetching projects for user:", user.id);
      getProjects({ variables: { ID: user.id } });
    }
  }, [user, getProjects]);

  return (
    <div className="h-full p-8">
      <div className="max-w-7xl mx-auto">
        {data && (
          <ProjectsList
            projects={data.projectsPersonalByUser}
            onCreateProject={handleCreateProject}
            onUpdateProject={handleUpdateProject}
            onDeleteProject={handleDeleteProject}
            personal={true}
          />
        )}
      </div>
    </div>
  );
}
