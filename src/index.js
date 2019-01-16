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
import type {ApolloCache, ApolloClientOptions} from 'apollo-client';

import type {Context, FusionPlugin, Token} from 'fusion-core';

// Fixed By: https://github.com/benmosher/eslint-plugin-import/issues/975#issuecomment-348807796
// eslint-disable-next-line
import {InMemoryCache} from 'apollo-cache-inmemory';

import * as Cookies from 'js-cookie';

export const GetApolloClientCacheToken: Token<
  (ctx: Context) => ApolloCache<mixed>
> = createToken('GetApolloClientCacheToken');

export const ApolloClientCredentialsToken: Token<string> = createToken(
  'ApolloClientCredentialsToken'
);

export const ApolloClientEndpointToken: Token<string> = createToken(
  'ApolloClientEndpointToken'
);

export const ApolloClientDefaultOptionsToken: Token<
  $PropertyType<ApolloClientOptions<any>, 'defaultOptions'>
> = createToken('ApolloClientDefaultOptionsToken');

type ApolloLinkType = {request: (operation: any, forward: any) => any};

export const GetApolloClientLinksToken: Token<
  (Array<ApolloLinkType>, ctx: Context) => Array<ApolloLinkType>
> = createToken('GetApolloClientLinksToken');

export const ApolloClientAuthKeyToken: Token<string> = createToken(
  'ApolloClientAuthKeyToken'
);

type ApolloClientDepsType = {
  getCache: typeof GetApolloClientCacheToken.optional,
  endpoint: typeof ApolloClientEndpointToken.optional,
  fetch: typeof FetchToken,
  includeCredentials: typeof ApolloClientCredentialsToken.optional,
  authKey: typeof ApolloClientAuthKeyToken.optional,
  apolloContext: typeof ApolloContextToken.optional,
  getApolloLinks: typeof GetApolloClientLinksToken.optional,
  schema: typeof GraphQLSchemaToken.optional,
  defaultOptions: typeof ApolloClientDefaultOptionsToken.optional,
};

type InitApolloClientType = (
  ctx: Context,
  initialState: mixed
) => ApolloClient<mixed>;

function Container() {}

const ApolloClientPlugin: FusionPlugin<
  ApolloClientDepsType,
  InitApolloClientType
> = createPlugin({
  deps: {
    getCache: GetApolloClientCacheToken.optional,
    endpoint: ApolloClientEndpointToken.optional,
    fetch: FetchToken,
    includeCredentials: ApolloClientCredentialsToken.optional,
    authKey: ApolloClientAuthKeyToken.optional,
    apolloContext: ApolloContextToken.optional,
    getApolloLinks: GetApolloClientLinksToken.optional,
    schema: GraphQLSchemaToken.optional,
    defaultOptions: ApolloClientDefaultOptionsToken.optional,
  },
  provides({
    getCache = ctx => new InMemoryCache(),
    endpoint = '/graphql',
    fetch,
    authKey = 'token',
    includeCredentials = 'same-origin',
    apolloContext = ctx => ctx,
    getApolloLinks,
    schema,
    defaultOptions,
  }) {
    function getClient(ctx, initialState) {
      const cache = getCache(ctx);
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
      const links: Array<ApolloLinkType> = getApolloLinks
        ? getApolloLinks([authMiddleware, connectionLink], ctx)
        : [authMiddleware, connectionLink];

      const client = new ApolloClient({
        ssrMode: __NODE__,
        connectToDevTools: __BROWSER__ && __DEV__,
        link: apolloLinkFrom(links),
        cache: cache.restore(initialState),
        defaultOptions,
      });
      return client;
    }
    return (ctx: Context, initialState: mixed) => {
      if (ctx.memoized.has(Container)) {
        return ctx.memoized.get(Container);
      }
      const client = getClient(ctx, initialState);
      ctx.memoized.set(Container, client);
      return client;
    };
  },
});
export default ApolloClientPlugin;
