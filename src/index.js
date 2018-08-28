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

import { split } from 'apollo-link';

import { getMainDefinition } from 'apollo-utilities';
import { WebSocketLink } from "apollo-link-ws";
import { SubscriptionClient } from "subscriptions-transport-ws";
import { createUploadLink } from 'apollo-upload-client'
const isFile = value => (
  (typeof File !== 'undefined' && value instanceof File) ||
  (typeof Blob !== 'undefined' && value instanceof Blob)
);

const isUpload = ({ variables }) =>
  Object.values(variables).some(isFile);

const isSubscriptionOperation = ({ query }) => {
  const { kind, operation } = getMainDefinition(query);
  return kind === 'OperationDefinition' && operation === 'subscription';
};

export const ApolloClientEndpointToken: Token<string> = createToken(
  'ApolloClientEndpointToken'
);
export const ApolloClientCredentialsToken: Token<string> = createToken(
  'ApolloClientCredentialsToken'
);

export const ApolloClientWsEndpointToken: Token<string> = createToken(
  'ApolloClientWsEndpointToken'
);

export const ApolloClientLinkToken: Token<{
  request: (operation: any, forward: any) => any,
}> = createToken('ApolloClientLinkToken');

export const ApolloClientAuthKeyToken = createToken('ApolloClientAuthKeyToken');

const ApolloClientPlugin = createPlugin({
  deps: {
    endpoint: ApolloClientEndpointToken,
    wsEndpoint: ApolloClientWsEndpointToken,
    fetch: FetchToken,
    includeCredentials: ApolloClientCredentialsToken.optional,
    authKey: ApolloClientAuthKeyToken.optional,
    apolloContext: ApolloContextToken.optional,
    apolloLink: ApolloClientLinkToken.optional,
    schema: GraphQLSchemaToken.optional,
  },
  provides({
    endpoint,
    wsEndpoint,
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

      const context = typeof apolloContext === 'function'
        ? apolloContext(ctx)
        : apolloContext;

      const httpLink = new HttpLink({
        uri: endpoint,
        credentials: includeCredentials,
        fetch,
      });

      const connectionLink =
        schema && __NODE__
          ? new SchemaLink({
              schema,
              context,
            })
          : httpLink;

      const token = __BROWSER__ ? getBrowserProps() : getServerProps();

      const headers = token ? {
        authorization: `Bearer ${token}`,
      } : {}

      const authMiddleware = new ApolloLink((operation, forward) => {
        operation.setContext({headers});
        return forward(operation);
      });

      if (__BROWSER__) {
        const subscriptionClient = new SubscriptionClient(wsEndpoint, {
          reconnect: true,
          connectionParams: () => (headers)
        });
        const wsLink = new WebSocketLink(subscriptionClient);

        const uploadLink = createUploadLink({
          uri: endpoint,
          credentials: includeCredentials,
          headers: headers
        });

        const requestLink = split(isSubscriptionOperation, wsLink, httpLink);

        const terminalLink = split(isUpload, uploadLink, requestLink);

        const links = [authMiddleware, terminalLink];
        if (apolloLink) {
          links.unshift(apolloLink);
        }
        const client = new ApolloClient({
          ssrMode: false,
          link: apolloLinkFrom(links),
          cache: new InMemoryCache().restore(initialState),
        });
        return client;
      } else {
        const links = [authMiddleware, connectionLink];
        if (apolloLink) {
          links.unshift(apolloLink);
        }
        const client = new ApolloClient({
          ssrMode: true,
          link: apolloLinkFrom(links),
          cache: new InMemoryCache().restore(initialState),
        });
        return client;
      }
    };
  },
});
export default ApolloClientPlugin;