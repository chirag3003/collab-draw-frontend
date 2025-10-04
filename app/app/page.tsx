"use client";

import ProjectsList from "@/components/app/ProjectsList";
import { useCreateProject, useProjectByOwner } from "@/lib/hooks/project";
import { useUser } from "@clerk/nextjs";
import { useEffect } from "react";

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

  const handleAddUser = async (email: string) => {
    // TODO: Implement user invitation logic
    console.log("Inviting user:", email);
    // Here you would typically make an API call to invite the user
  };

  const handleRemoveUser = (userId: string) => {
    // TODO: Implement user removal logic
    console.log("Removing user:", userId);
    // Here you would typically make an API call to remove the user
  };

  useEffect(() => {
    if (user) {
      getProjects({ variables: { owner: user.id } });
    }
  }, [user, getProjects]);

  return (
    <div className="h-full p-8">
      <div className="max-w-7xl mx-auto">
        {data && (
          <ProjectsList
            projects={data.projectsByUser}
            currentUsers={[]}
            onCreateProject={handleCreateProject}
            personal={true}
            onAddUser={handleAddUser}
            onRemoveUser={handleRemoveUser}
          />
        )}
      </div>
    </div>
  );
}
