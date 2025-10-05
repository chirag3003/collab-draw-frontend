"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect } from "react";
import ProjectsList from "@/components/app/ProjectsList";
import { useCreateProject, useProjectByOwner } from "@/lib/hooks/project";

export default function App() {
  const [getProjects, { data }] = useProjectByOwner();
  const [createProject] = useCreateProject();
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

  useEffect(() => {
    if (user) {
      getProjects({ variables: { ID: user.id } });
    }
  }, [user, getProjects]);

  return (
    <div className="h-full p-8">
      <div className="max-w-7xl mx-auto">
        {data && (
          <ProjectsList
            projects={data.projectsByUser}
            onCreateProject={handleCreateProject}
            personal={true}
            // onAddUser={handleAddUser}
            // onRemoveUser={handleRemoveUser}
          />
        )}
      </div>
    </div>
  );
}
