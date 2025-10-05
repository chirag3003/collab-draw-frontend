"use client";

import { ApolloProvider as Provider } from "@apollo/client/react";
import { ApolloClient, HttpLink, InMemoryCache, from, split } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { getMainDefinition } from "@apollo/client/utilities";
import { createClient } from "graphql-ws";
import { useAuth } from "@clerk/nextjs";
import { useMemo } from "react";

export default function ApolloProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { getToken } = useAuth();

  const apolloClient = useMemo(() => {
    // Create HTTP link
    const httpLink = new HttpLink({
      uri:
        process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT ||
        "http://localhost:5000/query",
      credentials: "include", // Include cookies for authentication
    });

    // Create WebSocket link for subscriptions
    const wsUri = 
      process.env.NEXT_PUBLIC_GRAPHQL_WS_ENDPOINT ||
      "ws://localhost:5000/query";
    
    const wsLink = new GraphQLWsLink(
      createClient({
        url: wsUri,
        connectionParams: async () => {
          let token = null;
          try {
            // Get token from Clerk
            token = await getToken();
            console.log("WebSocket connecting with token:", token ? "Token exists" : "No token");
          } catch (error) {
            console.error("Error getting Clerk token for WebSocket:", error);
          }
          return {
            ...(token && { authorization: `Bearer ${token}` }),
          };
        },
        shouldRetry: (errOrCloseEvent) => {
          console.error("WebSocket connection failed:", errOrCloseEvent);
          return true;
        },
        retryAttempts: 5,
        keepAlive: 10000,
        on: {
          connected: () => console.log("WebSocket connected successfully"),
          closed: (event) => console.log("WebSocket closed:", event),
          error: (error) => console.error("WebSocket error:", error),
        },
      }),
    );

    // Create auth link
    const authLink = setContext(async (_, { headers }) => {
      let token = null;
      
      try {
        // Get token from Clerk
        token = await getToken();
      } catch (error) {
        console.error("Error getting Clerk token:", error);
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
    const splitLink = split(
      ({ query }) => {
        const definition = getMainDefinition(query);
        return (
          definition.kind === "OperationDefinition" &&
          definition.operation === "subscription"
        );
      },
      wsLink,
      from([authLink, httpLink]),
    );

    return new ApolloClient({
      link: splitLink,
      cache: new InMemoryCache(),
    });
  }, [getToken]);

  return <Provider client={apolloClient}>{children}</Provider>;
}
