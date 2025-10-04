"use client";

import { ApolloProvider as Provider } from "@apollo/client/react";
import createApolloClient from "@/lib/apolloClient";

export default function ApolloProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const apolloClient = createApolloClient();
  return <Provider client={apolloClient}>{children}</Provider>;
}
