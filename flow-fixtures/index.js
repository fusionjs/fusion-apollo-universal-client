// @flow

import React from 'react';
import App from 'fusion-react';
import {RenderToken} from 'fusion-core';
import ApolloRender, {ApolloClientToken} from 'fusion-plugin-apollo';
import ApolloClientPlugin from '../src/index.js';

export default () => {
  const app = new App(React.createElement('div'));
  app.register(RenderToken, ApolloRender);
  app.register(ApolloClientToken, ApolloClientPlugin);
  return app;
};
