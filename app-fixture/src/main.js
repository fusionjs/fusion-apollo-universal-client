// @flow
import Router from 'fusion-plugin-react-router';
import {RenderToken} from 'fusion-core';
import App from 'fusion-react';
import ApolloPlugin, {
  ApolloClientToken,
  GraphQLSchemaToken,
  GraphQLEndpointToken,
} from 'fusion-plugin-apollo';
import {FetchToken} from 'fusion-tokens';
import unfetch from 'unfetch';
import {addMockFunctionsToSchema, makeExecutableSchema} from 'graphql-tools';

import ApolloClientPlugin from '../../src/index';

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
  app.register(GraphQLEndpointToken, '/graphql');
  __NODE__ && app.register(RenderToken, ApolloPlugin);
  __NODE__ && app.register(GraphQLSchemaToken, schema);

  return app;
};
