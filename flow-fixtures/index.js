// @flow

import React from 'react';
import App, {ApolloClientToken} from 'fusion-apollo';
import ApolloClientPlugin, {ApolloClientEndpointToken} from '../src/index.js';

export default () => {
  const app = new App(React.createElement('div'));
  app.register(ApolloClientToken, ApolloClientPlugin);
  app.register(ApolloClientEndpointToken, 'some-value');

  return app;
};
