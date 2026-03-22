import { GraphQLClient } from "graphql-request";

import { getWordPressConfig } from "@/lib/wp-client";

export function getWordPressGraphQLClient(): GraphQLClient {
  const { graphqlUrl } = getWordPressConfig();
  return new GraphQLClient(graphqlUrl);
}

export async function wpGraphQLFetch<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
  const client = getWordPressGraphQLClient();
  return client.request<T>(query, variables);
}