import { ApolloClient, HttpLink, InMemoryCache, from } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";

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

  apolloClient = new ApolloClient({
    link: from([authLink, httpLink]),
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
