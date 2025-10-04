import { gql } from "@apollo/client";
import { useMutation, useQuery } from "@apollo/client/react";

export function useWorkspace(id: string) {
  const QUERY = gql`
        query GetWorkspace($ID:ID!){
            workspace(id:$ID){
                id
                name
                description
            }
        }
    `;
  return useQuery<{
    workspace: { id: string; name: string; description: string };
  }>(QUERY, {
    variables: {
      ID: id,
    },
  });
}

export function useWorkspaces(userID: string) {
  const QUERY = gql`
        query GetWorkspaceByID($user:ID!){
            workspacesByUser(userId:$user){
                id
                name
                description

            }
        }
    `;
  return useQuery<{
    workspacesByUser: { id: string; name: string; description: string }[];
  }>(QUERY, {
    variables: {
      user: userID,
    },
  });
}

export function useCreateWorkspace() {
  const MUTATION = gql`
        mutation CreateWorkspace($name: String!, $description: String!, $owner: ID!) {
            createWorkspace(
                input: { name: $name, description: $description, owner: $owner }
            )
        }
    `;
  return useMutation(MUTATION, {
    refetchQueries: ["GetWorkspaceByID"],
  });
}
