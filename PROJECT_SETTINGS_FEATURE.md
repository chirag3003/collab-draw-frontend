# Project Settings Feature

## Overview
Added a project settings dialog that allows project owners to edit project details and delete projects.

## Components Created

### 1. `ProjectSettingsDialog.tsx`
A comprehensive dialog component with two main sections:

#### Edit Section
- Edit project name
- Edit project description
- Save button with loading state
- Form validation (name is required)

#### Delete Section (Danger Zone)
- Delete button
- Confirmation dialog before deletion
- Clear warning about permanent action
- Displays project name in confirmation

## Features

### ✅ Edit Project
- Real-time form updates
- Disabled state while saving
- Resets to original values when dialog is opened
- Only saves if name is not empty

### ✅ Delete Project
- Two-step confirmation process
- Shows project name in confirmation dialog
- Disabled state while deleting
- Clear warning about data loss

### ✅ Access Control
- Settings button only visible to project owners
- Uses `user?.id === project.owner` check

### ✅ UI/UX
- Clean, modern design with shadcn/ui components
- Loading states for all actions
- Error handling in console
- Auto-closes after successful operations

## Usage

The dialog is automatically integrated into the ProjectsList component:

```tsx
{user?.id === project.owner && onUpdateProject && onDeleteProject && (
  <ProjectSettingsDialog
    project={project}
    onUpdateProject={onUpdateProject}
    onDeleteProject={onDeleteProject}
  />
)}
```

## Backend Requirements

You'll need to implement these GraphQL mutations in your backend:

### 1. Update Project Metadata
```graphql
mutation UpdateProjectMetadata($ID:ID!, $name:String!, $description:String!) {
  updateProjectMetadata(id:$ID, name:$name, description:$description)
}
```

**Expected behavior:**
- Updates the project's name and description
- Returns success/error
- Triggers refetch of project lists

### 2. Delete Project (Already exists)
```graphql
mutation DeleteProject($ID:ID!) {
  deleteProject(id:$ID)
}
```

**Expected behavior:**
- Permanently deletes the project
- Removes all associated data
- Returns success/error
- Triggers refetch of project lists

## Integration Points

### Modified Files:
1. **`components/app/ProjectsList/index.tsx`**
   - Added `onUpdateProject` and `onDeleteProject` props
   - Imported and rendered `ProjectSettingsDialog`
   - Replaced Cog button with dialog component

2. **`app/app/page.tsx`** (Personal projects)
   - Added `useUpdateProjectMetadata` and `useDeleteProject` hooks
   - Implemented `handleUpdateProject` function
   - Implemented `handleDeleteProject` function
   - Passed handlers to ProjectsList

3. **`app/app/[id]/page.tsx`** (Workspace projects)
   - Added `useUpdateProjectMetadata` and `useDeleteProject` hooks
   - Implemented `handleUpdateProject` function
   - Implemented `handleDeleteProject` function
   - Passed handlers to ProjectsList

4. **`lib/hooks/project.tsx`**
   - Added `useUpdateProjectMetadata` hook with proper refetchQueries

## Testing Checklist

- [ ] Settings button appears only for project owners
- [ ] Dialog opens when clicking settings button
- [ ] Can edit project name and description
- [ ] Save button disabled when name is empty
- [ ] Shows loading state while saving
- [ ] Dialog closes after successful save
- [ ] Projects list refreshes after save
- [ ] Delete button opens confirmation dialog
- [ ] Confirmation shows correct project name
- [ ] Can cancel delete operation
- [ ] Shows loading state while deleting
- [ ] Projects list refreshes after delete
- [ ] Error handling works for both operations

## Screenshots

### Settings Button (Owner View)
The cog icon button appears next to "Open Project" for project owners.

### Edit Project Section
- Text input for project name
- Textarea for description
- Save button

### Danger Zone
- Clear visual separation
- Red destructive styling
- Warning text

### Delete Confirmation
- Alert dialog overlay
- Bold project name display
- Cancel and Delete buttons
- Warning cannot be undone

## Future Enhancements

Potential improvements:
- [ ] Add project thumbnail/banner upload
- [ ] Add project visibility settings (public/private)
- [ ] Add project collaborators management
- [ ] Add project archive instead of delete
- [ ] Add project duplication
- [ ] Add activity log viewer
- [ ] Add project tags/categories
- [ ] Add project export options

## Notes

- The dialog uses shadcn/ui components for consistent styling
- All mutations trigger refetch of project lists automatically
- Form state is reset when dialog opens/closes
- Loading states prevent multiple simultaneous operations
- Console errors are logged for debugging
