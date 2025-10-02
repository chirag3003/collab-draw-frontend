"use client";

import { CalendarDays, ExternalLink, Users } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import CreateProjectDialog from "./CreateProjectDialog";
import ShareWorkspaceDialog from "./ShareWorkspaceDialog";

interface Collaborator {
  id: string;
  name: string;
  avatar?: string;
  initials: string;
}

interface Project {
  id: string;
  title: string;
  createdDate: string;
  bannerImage?: string;
  collaborators: Collaborator[];
}

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  initials: string;
  role: "owner" | "editor" | "viewer";
}

interface WorkspaceListProps {
  projects: Project[];
  details?: { title: string; description: string };
  currentUsers?: User[];
  onCreateProject?: (data: { title: string }) => void;
  onAddUser?: (email: string) => void;
  onRemoveUser?: (userId: string) => void;
}

export default function ProjectsList({
  projects,
  details,
  currentUsers = [],
  onCreateProject,
  onAddUser,
  onRemoveUser,
}: WorkspaceListProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleCreateProject = (data: { title: string }) => {
    // Call the parent callback if provided
    if (onCreateProject) {
      onCreateProject(data);
    } else {
      // TODO: Implement project creation logic
      console.log("Creating project:", data);
    }
  };

  const handleAddUser = async (email: string) => {
    // Call the parent callback if provided
    if (onAddUser) {
      await onAddUser(email);
    } else {
      // TODO: Implement user invitation logic
      console.log("Inviting user:", email);
    }
  };

  const handleRemoveUser = (userId: string) => {
    // Call the parent callback if provided
    if (onRemoveUser) {
      onRemoveUser(userId);
    } else {
      // TODO: Implement user removal logic
      console.log("Removing user:", userId);
    }
  };

  return (
    <div className="w-full">
      <div className="header flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {details?.title || "Welcome back, Sophia"}
          </h1>
          <p className="text-muted-foreground">
            {details?.description ||
              "Continue working on your projects or start something new"}
          </p>
        </div>
        <div className="controls flex space-x-3">
          <ShareWorkspaceDialog
            currentUsers={currentUsers}
            onAddUser={handleAddUser}
            onRemoveUser={handleRemoveUser}
            workspaceTitle={details?.title}
          />
          <CreateProjectDialog onCreateProject={handleCreateProject} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {projects.map((project) => (
          <Card key={project.id} className="pt-0 gap-0 border border-border">
            <CardHeader className="p-0">
              {/* Banner Image */}
              <div className="relative w-full h-36 bg-muted rounded-t-lg overflow-hidden">
                {project.bannerImage ? (
                  <img
                    src={"https://placehold.co/400x200"}
                    alt={`${project.title} preview`}
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                    <div className="text-4xl font-bold text-muted-foreground/50">
                      {project.title.charAt(0).toUpperCase()}
                    </div>
                  </div>
                )}
              </div>
            </CardHeader>

            <CardContent className="p-4">
              {/* Project Title */}
              <h3 className="font-semibold text-foreground text-lg mb-2 line-clamp-2">
                {project.title}
              </h3>

              {/* Created Date */}
              <div className="flex items-center text-sm text-muted-foreground mb-3">
                <CalendarDays className="h-4 w-4 mr-2" />
                Created {formatDate(project.createdDate)}
              </div>
            </CardContent>

            <CardFooter className="px-4">
              <Link
                href={`/projects/${project.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(buttonVariants(), "w-full")}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Open Project
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>

      {projects.length === 0 && (
        <div className="text-center py-12">
          <div className="text-muted-foreground mb-4">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">No projects yet</h3>
            <p className="text-sm">Create your first project to get started</p>
          </div>
        </div>
      )}
    </div>
  );
}
