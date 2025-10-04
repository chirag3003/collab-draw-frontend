import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client";

const createApolloClient = () => {
  return new ApolloClient({
    link: new HttpLink({
      uri:
        process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT ||
        "http://localhost:5000/query",
      credentials: "include", // Include cookies for authentication
    }),
    cache: new InMemoryCache(),
  });
};

export default createApolloClient;
