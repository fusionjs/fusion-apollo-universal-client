# fusion-apollo-universal-client

[![Build status](https://badge.buildkite.com/107d4baa53a894926a5da4e9552291e6e1b8133d6f665729cc.svg?branch=master)](https://buildkite.com/uberopensource/fusion-apollo-universal-client)

A simple universal client for GraphQL apps using fusion-apollo.

The Apollo Client is the entrypoint for most Apollo applications. This plugin provides a client with the minimum amount of configuration necessary to create a universally rendered Apollo application.

---

# Table of contents

- [Installation](#installation)
- [Usage](#usage)
  - [Usage with fusion-apollo](#usage-with-fusion-apollo)
  - [Authorization](#authorization)
- [API](#api)
  - [Registration API](#registration-api)
    - [`ApolloClientEndpointToken`](#apolloclientendpointtoken)
  - [Dependencies](#dependencies)
    - [`FetchToken`](#fetchtoken)
    - [`ApolloClientAuthKeyToken`](#apolloclientauthkeytoken)
    - [`GetApolloClientCacheToken`](#GetApolloClientCacheToken)
    - [`ApolloClientCredentialsToken`](#apolloclientcredentialstoken)
    - [`GetApolloClientLinksToken`](#getapolloclientlinkstoken)
- [Examples](#examples)

---

### Installation

```sh
yarn add fusion-apollo-universal-client
```

---

## Usage

### Usage with fusion-apollo

```js
import App, {ApolloClientToken} from 'fusion-apollo';
import GetApolloClient, {
  ApolloClientEndpointToken,
} from 'fusion-apollo-universal-client';
import unfetch from 'unfetch';

export default () => {
  const app = new App(root);
  app.register(ApolloClientToken, GetApolloClient);
  app.register(ApolloClientEndpointToken, '...');
  __NODE__ && app.register(FetchToken, unfetch);
  return app;
};
```

### Usage with local server

If your app hosts the Apollo server a schema must be provided.
The schema can be provided using the `GraphQLSchemaToken` from `fusion-apollo`.

```js
import App, {ApolloClientToken, GraphQLSchemaToken} from 'fusion-apollo';
import {makeExecutableSchema} from 'graphql-tools';
import GetApolloClient, {ApolloClientEndpointToken} from 'fusion-apollo-universal-client';
import unfetch from 'unfetch';

export default () => {
  const app = new App(root);
  app.register(ApolloClientToken, GetApolloClient);
  app.register(ApolloClientEndpointToken, '...');
  app.register(GraphQLSchemaToken, makeExecutableSchema(...));
  __NODE__ && app.register(FetchToken, unfetch);
  return app;
};
```

See the [Apollo Documentation](https://www.apollographql.com/docs/graphql-tools/generate-schema.html) for how to generate a schema.

### Authorization

Authorization will work with hosted GraphQL services such as scaphold and graph.cool. This works by passing a stored authentication token inside of the authorization header. This token is currently assumed to stored in a cookie and cookies by the value provided in `ApolloClientAuthKeyToken` (defaults to "token").

---

### API

#### Registration API

##### ApolloClientEndpointToken

```js
import {ApolloClientEndpointToken} from 'fusion-apollo';
```

A token with the GraphQL endpoint which the Apollo HttpLink client communicates with. This can be an absolute path to a local GraphQL server, or a remote hosted GraphQL server.

###### Type

- `string` - Required. The URI to make GraphQL requests from.

#### Dependencies

##### `FetchToken`

```js
import {FetchToken} from 'fusion-tokens';
```

A [`fetch`](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) implementation. Browser-only.

###### Type

```js
type Fetch = (url: string, options: Object) => Promise<Response>;
```

- `url: string` - Required. Path or URL to the resource you wish to fetch.
- `options: Object` - Optional. You may optionally pass an `init` options object as the second argument. See [Request](https://developer.mozilla.org/en-US/docs/Web/API/Request) for more details.
- `[return]: Promise<Request>` - Return value from fetch. See [Response](A function that loads appropriate translations and locale information given an HTTP request context) for more details.

###### Default value

If no fetch implementation is provided, [`window.fetch`](https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch) is used.

##### `ApolloClientAuthKeyToken`

```js
import {ApolloClientAuthKeyToken} from 'fusion-apollo-universal-client';
```

(Optional) A configuration value that provides the value of an authentication token to use from the document cookies. If provided, this token is used in the Apollo auth middleware as an authorization header.

###### Type

- `string` - Required. Name of the cookie which contains the authorization token.

###### Default value

If no token name is provided, authorization headers are not sent.

##### `GetApolloClientCacheToken`

```js
import {GetApolloClientCacheToken} from 'fusion-apollo-universal-client';
```

(Optional) A function that returns an Apollo [cache implementation](https://www.apollographql.com/docs/react/advanced/caching.html).

###### Type

- `(ctx: Context) => ApolloCache` - Optional.

###### Default value

The default cache implementation uses [InMemoryCache](https://github.com/apollographql/apollo-client/tree/master/packages/apollo-cache-inmemory).

##### `ApolloClientCredentialsToken`

```js
import {ApolloClientCredentialsToken} from 'fusion-apollo-universal-client';
```

(Optional) A configuration value that provides the value of credentials value passed directly into the [fetch implementation](https://github.com/github/fetch).

###### Type

- `string` - Optional.

###### Default value

The default value is `same-origin`.

##### `GetApolloClientLinksToken`

```js
import {GetApolloClientLinksToken} from 'fusion-apollo-universal-client';
```

(Optional) A configuration value that provides a array of [ApolloLinks](https://www.apollographql.com/docs/link/composition.html). The default links are provided as an argument to the provided function.

###### Type

- `(Array<ApolloLinkType>) => Array<ApolloLinkType>` - Optional.

---
