"use client";

import ProjectsList from "@/components/app/ProjectsList";

export default function App() {
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
      id: "2",
      title: "Mobile App Wireframes",
      createdDate: "2024-09-20",
      collaborators: [
        { id: "1", name: "Sophia Carter", initials: "SC" },
        { id: "4", name: "Mike Johnson", initials: "MJ" },
        { id: "5", name: "Sarah Wilson", initials: "SW" },
        { id: "6", name: "Tom Brown", initials: "TB" },
        { id: "7", name: "Lisa Davis", initials: "LD" },
      ],
      isShared: true,
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

  return (
    <div className="h-full p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Welcome back, Sophia
          </h1>
          <p className="text-muted-foreground">
            Continue working on your projects or start something new
          </p>
        </div>

        <ProjectsList
          projects={sampleProjects}
          //   title="My Projects"
        />
      </div>
    </div>
  );
}
