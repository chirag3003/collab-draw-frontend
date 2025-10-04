"use client";

import { use } from "react";
import ProjectsList from "@/components/app/ProjectsList";
import { useCreateProject, useProjectsByWorkspace } from "@/lib/hooks/project";
import { useWorkspace } from "@/lib/hooks/workspace";
import { useUser } from "@clerk/nextjs";

interface WorkspaceAppProps {
  params: Promise<{ id: string }>;
}
export default function WorkspaceApp({ params }: WorkspaceAppProps) {
  const { user } = useUser();
  const { id } = use(params);
  const { data: workspaceData, loading } = useWorkspace(id);
  const { data: projectsData } = useProjectsByWorkspace(id);
  const [createProject] = useCreateProject();

  // Sample users data
  const sampleUsers = [
    {
      id: "1",
      name: "Sophia Carter",
      email: "sophia.carter@company.com",
      initials: "SC",
      avatar: "/avatar-1.jpg",
      role: "owner" as const,
    },
    {
      id: "2",
      name: "John Doe",
      email: "john.doe@company.com",
      initials: "JD",
      avatar: "/avatar-2.jpg",
      role: "editor" as const,
    },
    {
      id: "3",
      name: "Jane Smith",
      email: "jane.smith@company.com",
      initials: "JS",
      role: "viewer" as const,
    },
  ];

  const handleCreateProject = async (data: {
    title: string;
    description: string;
  }) => {
    await createProject({
      variables: {
        name: data.title,
        description: data.description,
        personal: false,
        owner: user?.id ?? "",
        workspace: id,
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

  return (
    <div className="h-full p-8">
      <div className="max-w-7xl mx-auto">
        {!loading && workspaceData && projectsData && (
          <ProjectsList
            projects={projectsData.projectsByWorkspace}
            currentUsers={sampleUsers}
            onCreateProject={handleCreateProject}
            personal={false}
            details={{
              title: workspaceData.workspace.name,
              description: workspaceData.workspace.description,
            }}
            onAddUser={handleAddUser}
            onRemoveUser={handleRemoveUser}
          />
        )}
      </div>
    </div>
  );
}
