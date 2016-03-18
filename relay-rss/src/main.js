import "babel-polyfill";
import React from 'react';
import Relay from 'react-relay';
import ReactDOM from 'react-dom';
import RelayLocalSchema from 'relay-local-schema';

import {IndexRoute, Route, useRouterHistory} from 'react-router';
import {RelayRouter} from 'react-router-relay';
import {createHashHistory} from 'history';

import schema from './data/schema';
import queries from './queries/Queries';

import NewsListContainer from './NewsListContainer';
import NewsItemContainer from './NewsItemContainer';
import styles from './main.css';

const history = useRouterHistory(createHashHistory)({ queryKey: false });

Relay.injectNetworkLayer(
  new RelayLocalSchema.NetworkLayer({ schema })
);

const Root = React.createClass({
  render() {
    return <div className={'root'}>
      <RelayRouter history={history}>
        <Route path="/" >
          <IndexRoute component={NewsListContainer} queries={queries} queryParams={['types']} />
          <Route component={NewsItemContainer} queries={queries} path="news/:id" />
        </Route>
      </RelayRouter>
    </div>;
  }
});

function start() {
    const root = document.getElementById('root');
    ReactDOM.render(<Root />, root);
}

window.onload = start;
