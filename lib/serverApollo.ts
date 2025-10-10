import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client"
import { auth } from "@clerk/nextjs/server";

export const getServerApollo =async () => {
    const {getToken} = await auth()
    const token = await getToken()
    const httpLink = new HttpLink({
        uri:
          process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT ||
          "http://localhost:5000/query",
        credentials: "include", // Include cookies for authentication
        headers: {
          Authorization: `Bearer ${token}`
        }
      });


    const client = new ApolloClient({
        link: httpLink,
        cache: new InMemoryCache(),
        
      });
    return client;
}