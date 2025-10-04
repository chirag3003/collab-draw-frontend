"use client";

import {
  FileText,
  FolderOpen,
  Search,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCreateWorkspace, useWorkspaces } from "@/lib/hooks/workspace";
import CreateWorkspaceDialog from "./CreateWorkspaceDialog";

interface SidebarProps {
  userID: string;
}

export default function Sidebar({ userID }: SidebarProps) {
  const { data: workspaces } = useWorkspaces(userID);
  const pathname = usePathname();
  const [createWorkspace] = useCreateWorkspace();

  const handleCreateWorkspace = async (data: {
    title: string;
    description: string;
  }) => {
    // TODO: Implement workspace creation logic
    await createWorkspace({
      variables: {
        name: data.title,
        description: data.description,
        owner: userID,
      },
    });
    console.log("Creating workspace:", data);
    // Here you would typically make an API call to create the workspace
  };

  return (
    <div className="w-80 h-screen border-r border-sidebar-border flex flex-col">
      {/* User Profile Section */}
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center space-x-3 mb-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src="/placeholder-avatar.jpg" alt="Sophia Carter" />
            <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground font-semibold text-lg">
              SC
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="font-semibold text-sidebar-foreground text-lg">
              Sophia Carter
            </h2>
            <p className="text-sm text-sidebar-foreground/70">
              Product Designer
            </p>
          </div>
        </div>

        {/* New workspace Button */}
        <CreateWorkspaceDialog onCreateWorkspace={handleCreateWorkspace} />
      </div>

      {/* Navigation Section */}
      <div className="p-6 space-y-4 flex-1 overflow-hidden flex flex-col">
        {/* My Workspace */}
        <Button
          variant="default"
          className="w-full justify-start h-11 rounded-lg font-medium"
        >
          <FolderOpen className="h-4 w-4 mr-3" />
          My Workspace
        </Button>

        {/* Shared with Me */}
        <Button
          variant="secondary"
          className="w-full justify-start h-11 rounded-lg font-medium"
        >
          <Users className="h-4 w-4 mr-3" />
          Shared with Me
        </Button>

        {/* Search */}
        <div className="relative pt-2 flex items-center">
          <Search className="absolute left-3 h-4 w-4 text-sidebar-foreground/50" />
          <Input
            placeholder="Search workspaces..."
            className="pl-10 h-11 rounded-lg"
          />
        </div>

        {/* Workspace List */}
        <div className="flex-1 overflow-hidden flex flex-col">
          <h3 className="text-xs font-medium text-sidebar-foreground/50 uppercase tracking-wider mb-3 mt-4">
            RECENT WORKSPACE
          </h3>
          <div className="flex-1 overflow-y-auto space-y-1 pr-2">
            {workspaces
              ? workspaces.workspacesByUser.map((project) => (
                  <Link
                    href={`/app/${project.id}`}
                    key={project.id}
                    className={`group flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                      pathname.endsWith(project.id)
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : "hover:bg-sidebar-accent/50 text-sidebar-foreground/80 hover:text-sidebar-foreground"
                    }`}
                  >
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <FileText className="h-4 w-4 flex-shrink-0" />
                      <span className="text-sm font-medium truncate">
                        {project.name}
                      </span>
                    </div>
                  </Link>
                ))
              : null}
          </div>
        </div>
      </div>
    </div>
  );
}
