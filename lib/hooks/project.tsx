import { gql } from "@apollo/client";
import { useLazyQuery, useMutation, useQuery } from "@apollo/client/react";

export const useProjectByID = (projectID: string) => {
  const QUERY = gql`
    query getProjectByID($ID:ID!) {
  project(id: $ID) {
    name
    description
    workspace
    appState
    elements
  }
}
    `;
  return useQuery<{
    project: {
      name: string;
      description: string;
      workspace: string;
      appState: string;
      elements: string;
    };
  }>(QUERY, { variables: { ID: projectID } });
};

export const useProjectByOwner = () => {
  const QUERY = gql`
    query GetProjectByOwner($ID:ID!){
  projectsByUser(userId:$ID){
    id
    name
    description
    owner
    createdAt
  }
}
 `;
  return useLazyQuery<{
    projectsByUser: {
      id: string;
      name: string;
      description: string;
      owner: string;
      createdAt: string;
    }[];
  }>(QUERY);
};

export const useProjectsByWorkspace = (workspaceID: string) => {
  const QUERY = gql`
    query GetProjectByWorkspace($ID:ID!){
  projectsByWorkspace(workspaceId:$ID){
    id
    name
    description
    owner
    createdAt
  }
}
    `;
  return useQuery<{
    projectsByWorkspace: {
      id: string;
      name: string;
      description: string;
      owner: string;
      createdAt: string;
    }[];
  }>(QUERY, { variables: { ID: workspaceID } });
};

export const useCreateProject = () => {
  const QUERY = gql`
mutation createProject($name:String!, $description:String!, $owner:ID!, $personal:Boolean!, $workspace:ID){
  createProject(input:{
    name:$name,
    description:$description,
    owner:$owner,
    personal:$personal,
    workspace:$workspace
  })
}
    `;
  return useMutation(QUERY, {
    refetchQueries: ["GetProjectByOwner", "GetProjectByWorkspace"],
  });
};

export const useUpdateProject = () => {
  const QUERY = gql`
    mutation updateProject($ID:ID!, $appState:String!, $elements:String!) {
  updateProject(
    id: $ID
    appState: $appState
    elements: $elements
  )
}
    `;
  return useMutation(QUERY);
};
