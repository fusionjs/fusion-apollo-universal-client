// @flow
import React from 'react';
import gql from 'graphql-tag';
import {Query} from 'react-apollo';

const TEST_QUERY = gql`
  query Test {
    getHello {
      name
    }
  }
`;

const Home = () => (
  <div>
    Hello. Query results:
    <Query query={TEST_QUERY}>
      {({loading, error, data}) => {
        if (loading) return 'Loading...';
        if (error) return `Error! ${error.message}`;

        return (
          <div>
            Data is:
            {JSON.stringify(data)}
          </div>
        );
      }}
    </Query>
  </div>
);

export default Home;
