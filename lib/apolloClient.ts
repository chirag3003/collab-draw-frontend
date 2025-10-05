import { ApolloClient, HttpLink, InMemoryCache, from, split } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { getMainDefinition } from "@apollo/client/utilities";
import { createClient } from "graphql-ws";

// Define interface for Clerk window object
interface ClerkWindow extends Window {
  Clerk?: {
    session?: {
      getToken: () => Promise<string | null>;
    };
  };
}

declare const window: ClerkWindow;

let apolloClient: ApolloClient | null = null;

const createApolloClient = () => {
  // Create HTTP link
  const httpLink = new HttpLink({
    uri:
      process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT ||
      "http://localhost:5000/query",
    credentials: "include", // Include cookies for authentication
  });

  // Create WebSocket link for subscriptions (only in browser)
  let wsLink: GraphQLWsLink | null = null;
  if (typeof window !== "undefined") {
    const wsUri = 
      process.env.NEXT_PUBLIC_GRAPHQL_WS_ENDPOINT ||
      "ws://localhost:5000/query";
    
    wsLink = new GraphQLWsLink(
      createClient({
        url: wsUri,
        connectionParams: async () => {
          let token = null;
          try {
            // Try to get token from Clerk session
            if (window.Clerk?.session) {
              token = await window.Clerk.session.getToken();
            }
          } catch (error) {
            console.error("Error getting Clerk token for WebSocket:", error);
          }
          return {
            ...(token && { authorization: `Bearer ${token}` }),
          };
        },
        shouldRetry: () => true,
        retryAttempts: Infinity,
        keepAlive: 10000,
      }),
    );
  }

  // Create auth link
  const authLink = setContext(async (_, { headers }) => {
    let token = null;
    
    // Check if we're in the browser environment
    if (typeof window !== "undefined") {
      try {
        // Try to get token from Clerk session
        if (window.Clerk?.session) {
          token = await window.Clerk.session.getToken();
        }
      } catch (error) {
        console.error("Error getting Clerk token:", error);
      }
    }

    // Return the headers with authorization
    return {
      headers: {
        ...headers,
        ...(token && { authorization: `Bearer ${token}` }),
      },
    };
  });

  // Split links based on operation type
  const splitLink = wsLink
    ? split(
        ({ query }) => {
          const definition = getMainDefinition(query);
          return (
            definition.kind === "OperationDefinition" &&
            definition.operation === "subscription"
          );
        },
        wsLink,
        from([authLink, httpLink]),
      )
    : from([authLink, httpLink]);

  apolloClient = new ApolloClient({
    link: splitLink,
    cache: new InMemoryCache(),
  });
  
  return apolloClient;
};

export default createApolloClient;
export const getApolloClient = () => {
  if (!apolloClient) {
    apolloClient = createApolloClient();
  }
  return apolloClient;
};
