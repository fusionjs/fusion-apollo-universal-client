/** Copyright (c) 2018 Uber Technologies, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

import tape from 'tape-cup';

import App, {createPlugin} from 'fusion-core';
import {getSimulator} from 'fusion-test-utils';
import {ApolloClientToken} from 'fusion-apollo';
import {ApolloLink} from 'apollo-link';
import {FetchToken} from 'fusion-tokens';
import unfetch from 'unfetch';

import ApolloClientPlugin, {
  ApolloClientEndpointToken,
  ApolloClientLinkEnhancerToken,
} from '../index.js';

tape('link enhancers - via app.register', async t => {
  /* Enhancer function */
  const app = new App('el', el => el);
  app.register(ApolloClientLinkEnhancerToken, new ApolloLink());
  app.register(ApolloClientEndpointToken, '/graphql');
  app.register(ApolloClientToken, ApolloClientPlugin);
  app.register(FetchToken, unfetch);

  const testPlugin = createPlugin({
    deps: {
      universalClient: ApolloClientToken,
    },
    middleware({universalClient}) {
      return async (ctx, next) => {
        // $FlowFixMe
        const client = universalClient();
        // $FlowFixMe
        t.ok(client.link);
        t.end();
        return next();
      };
    },
  });
  app.register(testPlugin);

  const simulator = getSimulator(app);
  await simulator.render('/');
});
