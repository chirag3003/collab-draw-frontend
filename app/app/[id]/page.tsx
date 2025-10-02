"use client";

import ProjectsList from "@/components/app/ProjectsList";

export default function WorkspaceApp() {
  // Sample projects data
  const sampleProjects = [
    {
      id: "1",
      title: "Dashboard Redesign",
      createdDate: "2024-09-15",
      bannerImage: "/placeholder-project-1.jpg",
      collaborators: [
        {
          id: "1",
          name: "Sophia Carter",
          initials: "SC",
          avatar: "/avatar-1.jpg",
        },
        { id: "2", name: "John Doe", initials: "JD", avatar: "/avatar-2.jpg" },
        { id: "3", name: "Jane Smith", initials: "JS" },
      ],
      isShared: false,
    },
    {
      id: "3",
      title: "Logo Design System",
      createdDate: "2024-09-25",
      bannerImage: "/placeholder-project-2.jpg",
      collaborators: [
        { id: "1", name: "Sophia Carter", initials: "SC" },
        { id: "8", name: "Alex Chen", initials: "AC" },
      ],
      isShared: false,
    },
    {
      id: "4",
      title: "User Research Study",
      createdDate: "2024-09-28",
      collaborators: [
        { id: "1", name: "Sophia Carter", initials: "SC" },
        { id: "9", name: "Emma White", initials: "EW" },
        { id: "10", name: "David Lee", initials: "DL" },
      ],
      isShared: true,
    },
    {
      id: "5",
      title: "Marketing Website Redesign",
      createdDate: "2024-10-01",
      bannerImage: "/placeholder-project-3.jpg",
      collaborators: [{ id: "1", name: "Sophia Carter", initials: "SC" }],
      isShared: false,
    },
    {
      id: "6",
      title: "E-commerce Platform UI Kit",
      createdDate: "2024-10-02",
      collaborators: [
        { id: "1", name: "Sophia Carter", initials: "SC" },
        { id: "11", name: "Ryan Garcia", initials: "RG" },
        { id: "12", name: "Maria Rodriguez", initials: "MR" },
      ],
      isShared: false,
    },
  ];

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

  const handleCreateProject = (data: { title: string }) => {
    // TODO: Implement project creation logic
    console.log("Creating project:", data);
    // Here you would typically make an API call to create the project
    // and then redirect to the project editor or refresh the project list
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
        <ProjectsList
          projects={sampleProjects}
          currentUsers={sampleUsers}
          onCreateProject={handleCreateProject}
          personal={false}
          onAddUser={handleAddUser}
          onRemoveUser={handleRemoveUser}
        />
      </div>
    </div>
  );
}
