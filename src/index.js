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
import {ApolloLink, from as apolloLinkFrom} from 'apollo-link';
import {SchemaLink} from 'apollo-link-schema';

import type {Token} from 'fusion-core';

// Fixed By: https://github.com/benmosher/eslint-plugin-import/issues/975#issuecomment-348807796
// eslint-disable-next-line
import {InMemoryCache} from 'apollo-cache-inmemory';

import * as Cookies from 'js-cookie';

export const ApolloClientEndpointToken: Token<string> = createToken(
  'ApolloClientEndpointToken'
);
export const ApolloClientCredentialsToken: Token<string> = createToken(
  'ApolloClientCredentialsToken'
);

export const ApolloClientLinkToken: Token<{any}> = createToken('ApolloClientLinkToken');

export const ApolloClientAuthKeyToken = createToken('ApolloClientAuthKeyToken');

const ApolloClientPlugin = createPlugin({
  deps: {
    endpoint: ApolloClientEndpointToken,
    fetch: FetchToken,
    includeCredentials: ApolloClientCredentialsToken.optional,
    authKey: ApolloClientAuthKeyToken.optional,
    apolloContext: ApolloContextToken.optional,
    apolloLink: ApolloClientLinkToken.optional,
    schema: GraphQLSchemaToken.optional,
  },
  provides({
    endpoint,
    fetch,
    authKey = 'token',
    includeCredentials = 'same-origin',
    apolloContext,
    apolloLink,
    schema,
  }) {
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
              context:
                typeof apolloContext === 'function'
                  ? apolloContext(ctx)
                  : apolloContext,
            })
          : new HttpLink({
              uri: endpoint,
              credentials: includeCredentials,
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
      const links = [authMiddleware];
      let terminalLink = connectionLink;
      if (apolloLink && typeof(apolloLink) === 'function') {
        links.push(apolloLink(terminalLink));
        terminalLink = links[links.length - 1];
      } else {
        links.push(connectionLink); 
        terminalLink = connectionLink;
      }
      const client = new ApolloClient({
        ssrMode: __NODE__ ? true : false,
        link: apolloLinkFrom(links),
        cache: new InMemoryCache().restore(initialState),
        defaultOptions: {
          watchQuery: {
            fetchPolicy: 'network-only',
          },
          query: {
            fetchPolicy: 'cache-and-network',
          },
        },
      });
      return client;
    };
  },
});
export default ApolloClientPlugin;
