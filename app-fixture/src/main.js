// @flow
import Router from 'fusion-plugin-react-router';
import App, {ApolloClientToken, GraphQLSchemaToken} from 'fusion-apollo';
import ApolloServer, {
  ApolloServerEndpointToken,
} from 'fusion-plugin-apollo-server';
import {FetchToken} from 'fusion-tokens';
import unfetch from 'unfetch';
import {addMockFunctionsToSchema, makeExecutableSchema} from 'graphql-tools';

import ApolloClientPlugin, {ApolloClientEndpointToken} from '../../src/index';

import root from './root.js';

const typeDefs = `
type Query {
   getHello: Test
}
type Test {
   name: String
}
`;

export const schema = makeExecutableSchema({
  typeDefs,
});

addMockFunctionsToSchema({schema});

export default () => {
  const app = new App(root);
  // eslint-disable-next-line
  __BROWSER__ && app.register(FetchToken, window.fetch);
  __NODE__ && app.register(FetchToken, unfetch);
  app.register(Router);

  app.register(ApolloClientToken, ApolloClientPlugin);

  // Integration tests ensures that we are able to hydrate without hitting this endpoint.
  // Don't update without updating tests as well.
  app.register(ApolloClientEndpointToken, '/graphql');
  __NODE__ && app.register(ApolloServerEndpointToken, '/graphql');
  __NODE__ && app.register(ApolloServer);
  __NODE__ && app.register(GraphQLSchemaToken, schema);

  return app;
};
