"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface CreateWorkspaceDialogProps {
  onCreateWorkspace?: (data: { title: string; description: string }) => void;
}

export default function CreateWorkspaceDialog({
  onCreateWorkspace,
}: CreateWorkspaceDialogProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [workspaceTitle, setWorkspaceTitle] = useState("");
  const [workspaceDescription, setWorkspaceDescription] = useState("");

  const handleCreateWorkspace = () => {
    if (workspaceTitle.trim()) {
      const workspaceData = {
        title: workspaceTitle.trim(),
        description: workspaceDescription.trim(),
      };

      // Call the parent callback if provided
      if (onCreateWorkspace) {
        onCreateWorkspace(workspaceData);
      } else {
        // TODO: Implement workspace creation logic
        console.log("Creating workspace:", workspaceData);
      }

      // Reset form and close dialog
      setWorkspaceTitle("");
      setWorkspaceDescription("");
      setIsDialogOpen(false);
    }
  };

  const handleCancel = () => {
    // Reset form and close dialog
    setWorkspaceTitle("");
    setWorkspaceDescription("");
    setIsDialogOpen(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && e.ctrlKey) {
      handleCreateWorkspace();
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium h-11 rounded-lg shadow-sm">
          <Plus className="h-5 w-5 mr-2" />
          New Workspace
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create New Workspace</DialogTitle>
          <DialogDescription>
            Create a new workspace to organize your projects and collaborate
            with your team.
            <br />
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="workspace-title">Workspace Title *</Label>
            <Input
              id="workspace-title"
              placeholder="Enter workspace title..."
              value={workspaceTitle}
              onChange={(e) => setWorkspaceTitle(e.target.value)}
              onKeyDown={handleKeyPress}
              className="w-full"
              maxLength={50}
              autoFocus
            />
            <p className="text-xs text-muted-foreground">
              {workspaceTitle.length}/50 characters
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="workspace-description">
              Description (Optional)
            </Label>
            <Textarea
              id="workspace-description"
              placeholder="Describe your workspace and its purpose..."
              value={workspaceDescription}
              onChange={(e) => setWorkspaceDescription(e.target.value)}
              onKeyDown={handleKeyPress}
              className="w-full min-h-[100px]"
              maxLength={200}
            />
            <p className="text-xs text-muted-foreground">
              {workspaceDescription.length}/200 characters
            </p>
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button
            onClick={handleCreateWorkspace}
            disabled={!workspaceTitle.trim()}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Workspace
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
