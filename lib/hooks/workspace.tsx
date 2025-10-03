import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import { useUser } from "@clerk/nextjs";

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
  return useQuery(QUERY, {
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
  return useQuery(QUERY, {
    variables: {
      user: userID,
    },
  });
}
