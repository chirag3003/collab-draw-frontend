import { gql } from "@apollo/client";
import { useMutation, useQuery } from "@apollo/client/react";

export function useWorkspace(id: string) {
  const QUERY = gql`
        query GetWorkspace($ID:ID!){
  workspace(id:$ID){
    id
    name
    description
    members{
      owner{
        id
        imageURL
        fullName
        email
      }
      members{
        id
        fullName
        email
        imageURL
      }
    }
  }
}
    `;
  return useQuery<{
    workspace: {
      id: string;
      name: string;
      description: string;
      members: {
        owner: {
          id: string;
          imageURL: string;
          fullName: string;
          email: string;
        };
        members: {
          id: string;
          fullName: string;
          email: string;
          imageURL: string;
        }[];
      };
    };
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

export function useSharedWorkspaces(userID: string) {
  const QUERY = gql`
  query GetSharedWorkspace($ID:ID!){
  sharedWorkspacesByUser(userId:$ID){
    id
    name
    description
  }
}
`;
  return useQuery<{
    sharedWorkspacesByUser: { id: string; name: string; description: string }[];
  }>(QUERY, {
    variables: {
      ID: userID,
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

export function useAddUserToWorkspace() {
  const QUERY = gql`
    mutation AddUserToWorkspace($ID:ID!, $email:String!){
  addMemberToWorkspace(workspaceId:$ID,email:$email)
}
  `;
  return useMutation(QUERY, {
    refetchQueries: ["GetWorkspace"],
  });
}

export function useRemoveUserFromWorkspace() {
  const QUERY = gql`
mutation RemoveUserFromWorkspace($ID:ID!, $userID:ID!){
  removeMemberFromWorkspace(workspaceId:$ID, userId:$userID)
}
  `;
  return useMutation(QUERY, {
    refetchQueries: ["GetWorkspace"],
  });
}

export function useDeleteWorkspace() {
  const QUERY = gql`
mutation DeleteWorkspace($ID:ID!){
  deleteWorkspace(id:$ID)
}
  `;
  return useMutation(QUERY, {
    refetchQueries: ["GetWorkspaceByID"],
  });
}

export function useUpdateWorkspaceMetadata() {
  const QUERY = gql`
mutation UpdateWorkspaceMetadata($ID:ID!, $name:String!, $description:String!){
  updateWorkspaceMetadata(id:$ID, name:$name, description:$description)
}
  `;
  return useMutation(QUERY, {
    refetchQueries: ["GetWorkspace", "GetWorkspaceByID"],
  });
}