/** Copyright (c) 2018 Uber Technologies, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

import {createPlugin, createToken} from 'fusion-core';
import {FetchToken} from 'fusion-tokens';
import {GraphQLSchemaToken, ApolloContextToken} from 'fusion-apollo';
import {ApolloClient} from 'apollo-client';
import {HttpLink} from 'apollo-link-http';
import {ApolloLink, concat} from 'apollo-link';
import {SchemaLink} from 'apollo-link-schema';

import type {Token} from 'fusion-core';

// Fixed By: https://github.com/benmosher/eslint-plugin-import/issues/975#issuecomment-348807796
// eslint-disable-next-line
import {InMemoryCache} from 'apollo-cache-inmemory';

import * as Cookies from 'js-cookie';

export const ApolloClientEndpointToken: Token<string> = createToken(
  'ApolloClientEndpointToken'
);
export const ApolloClientAuthKeyToken = createToken('ApolloClientAuthKeyToken');

const ApolloClientPlugin = createPlugin({
  deps: {
    endpoint: ApolloClientEndpointToken,
    fetch: FetchToken,
    authKey: ApolloClientAuthKeyToken.optional,
    schema: GraphQLSchemaToken.optional,
    context: ApolloContextToken.optional,
  },
  provides({endpoint, fetch, authKey = 'token', context, schema}) {
    return (ctx, initialState) => {
      const getBrowserProps = () => {
        return Cookies.get(authKey);
      };

      const getServerProps = () => {
        return ctx && ctx.cookies.get(authKey);
      };

      const connectionLink =
        schema && __NODE__
          ? new SchemaLink({
            schema,
            apolloContext: typeof context === 'function' ? context(ctx) : context,
          })
          : new HttpLink({
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
        ssrMode: true,
        link: concat(authMiddleware, connectionLink),
        cache: new InMemoryCache().restore(initialState),
      });
      return client;
    };
  },
});
export default ApolloClientPlugin;
