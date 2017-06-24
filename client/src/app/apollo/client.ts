import { ApolloClient, createNetworkInterface } from 'apollo-client';

export const client = new ApolloClient({
  networkInterface: createNetworkInterface({
    uri: 'http://localhost:3001/graphql',
  }),
});

export function provideClient(): ApolloClient {
  return client;
}
