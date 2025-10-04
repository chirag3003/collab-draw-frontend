"use client";

import { ApolloProvider as Provider } from "@apollo/client/react";
import { ApolloClient, HttpLink, InMemoryCache, from } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
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

    return new ApolloClient({
      link: from([authLink, httpLink]),
      cache: new InMemoryCache(),
    });
  }, [getToken]);

  return <Provider client={apolloClient}>{children}</Provider>;
}
