// @flow
import React from 'react';
import {Route, Switch} from 'fusion-plugin-react-router';

import Home from './pages/home.js';

const root = (
  <Switch>
    <Route exact path="/" component={Home} />
  </Switch>
);

export default root;
