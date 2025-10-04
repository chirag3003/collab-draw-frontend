import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client";

let apolloClient: ApolloClient | null = null;

const createApolloClient = () => {
  apolloClient = new ApolloClient({
    link: new HttpLink({
      uri:
        process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT ||
        "http://localhost:5000/query",
      credentials: "include", // Include cookies for authentication
    }),
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
