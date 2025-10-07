# Workspace Settings Feature

## Overview
Added a workspace settings dialog that allows workspace owners to edit workspace details and delete workspaces, similar to the project settings functionality.

## Components Created

### 1. `WorkspaceSettingsDialog.tsx`
A comprehensive dialog component with two main sections:

#### Edit Section
- Edit workspace name
- Edit workspace description
- Save button with loading state
- Form validation (name is required)

#### Delete Section (Danger Zone)
- Delete button with strong warning
- Confirmation dialog before deletion
- Clear warning about permanent action and that all projects will be deleted
- Displays workspace name in confirmation
- Redirects to `/app` after successful deletion

## Features

### ✅ Edit Workspace
- Real-time form updates
- Disabled state while saving
- Resets to original values when dialog is opened
- Only saves if name is not empty
- Uses GraphQL hooks directly for better integration

### ✅ Delete Workspace
- Two-step confirmation process
- Shows workspace name in confirmation dialog
- Disabled state while deleting
- Clear warning about data loss AND project deletion
- Auto-redirects to app page after deletion
- Prevents orphaned data

### ✅ Access Control
- Settings button only visible to workspace owners
- Uses `workspaceData.workspace.members.owner.id === user?.id` check

### ✅ UI/UX
- Clean, modern design with shadcn/ui components
- Loading states for all actions
- Error handling in console
- Auto-closes after successful operations
- Custom trigger support (cog button)

## Usage

The dialog is automatically integrated into the ProjectsList component for workspace pages:

```tsx
{!personal && owned && workspaceId && (
  <WorkspaceSettingsDialog
    workspace={{
      id: workspaceId,
      name: details?.title || "",
      description: details?.description || "",
    }}
    trigger={
      <Button variant={"outline"}>
        <Cog className="h-4 w-4" />
      </Button>
    }
  />
)}
```

## Backend Requirements

You'll need to implement this GraphQL mutation in your backend:

### Update Workspace Metadata
```graphql
mutation UpdateWorkspaceMetadata($ID:ID!, $name:String!, $description:String!) {
  updateWorkspaceMetadata(id:$ID, name:$name, description:$description)
}
```

**Expected behavior:**
- Updates the workspace's name and description
- Returns success/error
- Triggers refetch of workspace data

### Delete Workspace (Already exists)
```graphql
mutation DeleteWorkspace($ID:ID!) {
  deleteWorkspace(id:$ID)
}
```

**Expected behavior:**
- Permanently deletes the workspace
- Cascades deletion to all projects within the workspace
- Removes all associated data
- Returns success/error
- Triggers refetch of workspace lists

## Integration Points

### Modified Files:
1. **`components/app/Sidebar/WorkspaceSettingsDialog.tsx`** (NEW)
   - Workspace settings dialog component
   - Uses hooks directly for GraphQL operations
   - Handles both edit and delete operations
   - Auto-redirects after deletion

2. **`components/app/ProjectsList/index.tsx`**
   - Added `workspaceId` prop
   - Imported and rendered `WorkspaceSettingsDialog`
   - Conditionally shows settings button for workspace owners
   - Custom trigger (cog icon button)

3. **`app/app/[id]/page.tsx`** (Workspace page)
   - Passes `workspaceId` to ProjectsList
   - Removed handler props (using hooks directly in dialogs)

4. **`lib/hooks/workspace.tsx`**
   - Added `useUpdateWorkspaceMetadata` hook with proper refetchQueries
   - Existing `useDeleteWorkspace` hook already present

## Comparison with Project Settings

| Feature | Project Settings | Workspace Settings |
|---------|-----------------|-------------------|
| Edit name/description | ✅ | ✅ |
| Delete confirmation | ✅ | ✅ |
| Uses hooks directly | ✅ | ✅ |
| Auto-redirect after delete | ❌ | ✅ (to /app) |
| Custom trigger support | ❌ | ✅ |
| Warning about cascading delete | N/A | ✅ |

## Testing Checklist

- [ ] Settings button appears only for workspace owners
- [ ] Settings button hidden on personal projects page
- [ ] Dialog opens when clicking settings button
- [ ] Can edit workspace name and description
- [ ] Save button disabled when name is empty
- [ ] Shows loading state while saving
- [ ] Dialog closes after successful save
- [ ] Workspace data refreshes after save
- [ ] Delete button opens confirmation dialog
- [ ] Confirmation shows correct workspace name
- [ ] Confirmation warns about project deletion
- [ ] Can cancel delete operation
- [ ] Shows loading state while deleting
- [ ] Redirects to /app after successful deletion
- [ ] Error handling works for both operations

## Screenshots

### Settings Button (Owner View - Workspace)
The cog icon button appears in the header controls for workspace owners.

### Edit Workspace Section
- Text input for workspace name
- Textarea for description
- Save button

### Danger Zone
- Clear visual separation
- Red destructive styling
- Warning text about projects
- "All projects within this workspace will also be deleted"

### Delete Confirmation
- Alert dialog overlay
- Bold workspace name display
- Strong warning about cascade deletion
- Cancel and Delete buttons
- "Cannot be undone" warning

## Architecture Decisions

### Why Hooks Directly in Dialogs?
The dialogs use GraphQL hooks directly rather than prop drilling:
- **Simpler API**: No need to pass handlers through multiple components
- **Better encapsulation**: Each dialog manages its own mutations
- **Consistent with Project Settings**: Matches the pattern used in ProjectSettingsDialog
- **Easier maintenance**: Changes to mutation logic stay in one place

### Why Auto-Redirect After Delete?
- User can't stay on a page for a deleted workspace
- Prevents 404 errors or broken state
- Clear user experience: action complete, go home
- Workspace list will automatically refresh

## Future Enhancements

Potential improvements:
- [ ] Add workspace thumbnail/banner upload
- [ ] Add workspace visibility settings (public/private)
- [ ] Add workspace templates
- [ ] Add workspace archive instead of delete
- [ ] Add workspace duplication
- [ ] Add activity log viewer
- [ ] Add workspace tags/categories
- [ ] Add workspace export options
- [ ] Add bulk project operations
- [ ] Add workspace analytics

## Notes

- The dialog uses the same shadcn/ui components as ProjectSettingsDialog
- All mutations trigger refetch of workspace lists automatically
- Form state is reset when dialog opens/closes
- Loading states prevent multiple simultaneous operations
- Console errors are logged for debugging
- Redirects use `window.location.href` for hard navigation
- Only workspace owners see the settings button
- Personal projects page doesn't show workspace settings
