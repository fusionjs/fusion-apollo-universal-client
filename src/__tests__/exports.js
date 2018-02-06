import test from 'tape-cup';
import ApolloClientPlugin, {
  ApolloClientEndpointToken,
  ApolloClientAuthKeyToken,
} from '../index.js';

test('exports', t => {
  t.ok(ApolloClientPlugin, 'exports ApolloClientPlugin');
  t.ok(ApolloClientEndpointToken, 'exports ApolloClientEndpointToken');
  t.ok(ApolloClientAuthKeyToken, 'exports ApolloClientAuthKeyToken');
  t.end();
});
