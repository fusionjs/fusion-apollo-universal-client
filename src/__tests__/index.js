/** Copyright (c) 2018 Uber Technologies, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

import tape from 'tape-cup';

import App, {consumeSanitizedHTML, createPlugin} from 'fusion-core';
import type {FusionPlugin} from 'fusion-core';
import {getSimulator, getService} from 'fusion-test-utils';
import {ApolloClientToken} from 'fusion-apollo';
import {FetchToken} from 'fusion-tokens';
import {SchemaLink} from 'apollo-link-schema';

import ApolloClientPlugin, {
  ApolloClientEndpointToken,
  ApolloClientLinkEnhancerToken,
} from '../index.js';

tape.only('link enhancers - via app.register', async t => {
  /* Enhancer function */
  const app = new App('el', el => el);
  const mockLink = new SchemaLink({schema: ''});
  app.register(ApolloClientLinkEnhancerToken, mockLink);
  app.register(ApolloClientEndpointToken, '/graphql');
  app.register(ApolloClientToken, ApolloClientPlugin);
  app.register(FetchToken, () => {});

  const testPlugin = createPlugin({
    deps: {
      universalClient: ApolloClientToken,
    },
    middleware({universalClient}) {
      return async (ctx, next) => {
        const client = universalClient();
        console.log('got client?', client);
        return next();
      };
    },
  });
  app.register(testPlugin);

  const simulator = getSimulator(app);
  await simulator.render('/');

  t.end();
});
