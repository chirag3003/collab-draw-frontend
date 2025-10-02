"use client";

import {
  FileText,
  FolderOpen,
  MoreHorizontal,
  Plus,
  Search,
  Users,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Sidebar() {
  // Sample workspace data
  const workspace = [
    { id: 1, title: "Dashboard Redesign", isActive: true },
    { id: 2, title: "Mobile App Wireframes", isActive: false },
    { id: 3, title: "Logo Design System", isActive: false },
    { id: 4, title: "User Research Study", isActive: false },
    { id: 5, title: "Marketing Website", isActive: false },
    { id: 6, title: "E-commerce Platform", isActive: false },
  ];

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
        <Button className="w-full bg-sidebar-primary hover:bg-sidebar-primary/90 text-sidebar-primary-foreground font-medium h-11 rounded-lg">
          <Plus className="h-4 w-4 mr-2" />
          New Workspace
        </Button>
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
            {workspace.map((project) => (
              <div
                key={project.id}
                className={`group flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                  project.isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "hover:bg-sidebar-accent/50 text-sidebar-foreground/80 hover:text-sidebar-foreground"
                }`}
              >
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <FileText className="h-4 w-4 flex-shrink-0" />
                  <span className="text-sm font-medium truncate">
                    {project.title}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreHorizontal className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
