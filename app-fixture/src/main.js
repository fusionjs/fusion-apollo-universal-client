// @flow
import Router from 'fusion-plugin-react-router';

import App, {ApolloClientToken} from 'fusion-apollo';

import ApolloClientPlugin, {ApolloClientEndpointToken} from '../../src/index';

import root from './root.js';

export default () => {
  const app = new App(root);
  app.register(Router);
  app.register(ApolloClientToken, ApolloClientPlugin);
  app.register(ApolloClientEndpointToken, '/graphql');
  return app;
};
