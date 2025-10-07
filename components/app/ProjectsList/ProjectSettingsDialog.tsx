"use client";

import { useState } from "react";
import { Cog, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface ProjectSettingsDialogProps {
  project: {
    id: string;
    name: string;
    description?: string;
  };
  onUpdateProject: (data: {
    id: string;
    name: string;
    description: string;
  }) => Promise<void>;
  onDeleteProject: (id: string) => Promise<void>;
}

export default function ProjectSettingsDialog({
  project,
  onUpdateProject,
  onDeleteProject,
}: ProjectSettingsDialogProps) {
  const [open, setOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const [formData, setFormData] = useState({
    name: project.name,
    description: project.description || "",
  });

  const handleUpdateProject = async () => {
    if (!formData.name.trim()) {
      return;
    }

    setIsLoading(true);
    try {
      await onUpdateProject({
        id: project.id,
        name: formData.name.trim(),
        description: formData.description.trim(),
      });
      setOpen(false);
    } catch (error) {
      console.error("Failed to update project:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteProject = async () => {
    setIsDeleting(true);
    try {
      await onDeleteProject(project.id);
      setShowDeleteConfirm(false);
      setOpen(false);
    } catch (error) {
      console.error("Failed to delete project:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (newOpen) {
      // Reset form data when opening
      setFormData({
        name: project.name,
        description: project.description || "",
      });
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>
          <Button variant="secondary" size="icon">
            <Cog className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Project Settings</DialogTitle>
            <DialogDescription>
              Update your project details or delete the project.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Edit Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Pencil className="h-4 w-4" />
                <span>Edit Project</span>
              </div>

              <div className="space-y-2">
                <Label htmlFor="project-name">Project Name</Label>
                <Input
                  id="project-name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Enter project name"
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="project-description">Description</Label>
                <Textarea
                  id="project-description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Enter project description (optional)"
                  rows={3}
                  disabled={isLoading}
                />
              </div>

              <Button
                onClick={handleUpdateProject}
                disabled={isLoading || !formData.name.trim()}
                className="w-full"
              >
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </div>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Danger Zone
                </span>
              </div>
            </div>

            {/* Delete Section */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium text-destructive">
                <Trash2 className="h-4 w-4" />
                <span>Delete Project</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Once you delete a project, there is no going back. Please be
                certain.
              </p>
              <Button
                variant="destructive"
                onClick={() => setShowDeleteConfirm(true)}
                className="w-full"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Project
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              project <span className="font-semibold">"{project.name}"</span>{" "}
              and remove all of its data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteProject}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete Project"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
