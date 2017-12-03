import 'isomorphic-fetch';

import ApolloClient from 'apollo-client';
import {HttpLink} from 'apollo-link-http';
import {ApolloLink, concat} from 'apollo-link';
import {InMemoryCache} from 'apollo-cache-inmemory';

import * as Cookies from 'js-cookie';

const getClient = ({endpoint, fetch, authKey = 'token'}) => (
  ctx,
  initialState
) => {
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

export default getClient;
