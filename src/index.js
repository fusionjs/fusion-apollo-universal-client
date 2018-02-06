/** Copyright (c) 2018 Uber Technologies, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import {createPlugin, createToken} from 'fusion-core';
import {FetchToken} from 'fusion-tokens';

import {ApolloClient} from 'apollo-client';
import {HttpLink} from 'apollo-link-http';
import {ApolloLink, concat} from 'apollo-link';

// Fixed By: https://github.com/benmosher/eslint-plugin-import/issues/975#issuecomment-348807796
// eslint-disable-next-line
import {InMemoryCache} from 'apollo-cache-inmemory';

import * as Cookies from 'js-cookie';

export const ApolloClientEndpointToken = createToken(
  'ApolloClientEndpointToken'
);
export const ApolloClientAuthKeyToken = createToken('ApolloClientAuthKeyToken');

const ApolloClientPlugin = createPlugin({
  deps: {
    endpoint: ApolloClientEndpointToken,
    fetch: FetchToken,
    authKey: ApolloClientAuthKeyToken.optional,
  },
  provides({endpoint, fetch, authKey = 'token'}) {
    return (ctx, initialState) => {
      const getBrowserProps = () => {
        return Cookies.get(authKey);
      };

      const getServerProps = () => {
        return ctx && ctx.cookies.get(authKey);
      };

      const httpLink = new HttpLink({
        uri: endpoint,
        fetch,
      });

      const token = __BROWSER__ ? getBrowserProps() : getServerProps();
      const authMiddleware = new ApolloLink((operation, forward) => {
        if (token) {
          operation.setContext({
            headers: {
              authorization: `Bearer ${token}`,
            },
          });
        }

        return forward(operation);
      });

      const client = new ApolloClient({
        link: concat(authMiddleware, httpLink),
        cache: new InMemoryCache().restore(initialState),
      });
      return client;
    };
  },
});
export default ApolloClientPlugin;
