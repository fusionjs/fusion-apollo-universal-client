# fusion-apollo-universal-client

[![Build status](https://badge.buildkite.com/107d4baa53a894926a5da4e9552291e6e1b8133d6f665729cc.svg?branch=master)](https://buildkite.com/uberopensource/fusion-apollo-universal-client)

A simple universal client for GraphQL apps using fusion-apollo.

## Usage

```js
import createApolloClient from 'fusion-apollo-universal-client';
export default () => {
  const clientConfig = {
    endpoint: 'http://...',
    // You can provide your own fetch implementation
    fetch: global.fetch || window.fetch,
  };
  const app = new App(root, createApolloClient(clientConfig));
  return app;
}

```

## Authorization

Authorization will work with hosted GraphQL services such as scaphold and graph.cool. This works by passing a stored authentication token inside of the authorization header. This token is currently assumed to stored in localStorage and cookies by the value provided in config.authKey (defaults to "token").
