import "babel-polyfill";
import React from 'react';
import ReactDOM from 'react-dom';
import {Tabs, Tab} from 'react-bootstrap';

import {IndexRoute, Route, useRouterHistory, Router} from 'react-router';
import Relay from 'react-relay';
import {RelayRouter} from 'react-router-relay';
import {createHashHistory} from 'history';

import RelayLocalSchema from 'relay-local-schema';

import mockApi from './relay-rss/data/mockApi';
import schema from './relay-rss/data/schema';

import RelayRssFeedDemo from './relay-rss/RelayRssFeedDemo';
import ResizeWrapperDemo from './resizer/ResizeWrapperDemo';


const history = useRouterHistory(createHashHistory)({ queryKey: false });

//const schema = createSchema(mockApi);

Relay.injectNetworkLayer(
  new RelayLocalSchema.NetworkLayer({ schema })
);


const RootTabs = React.createClass({
  render() {
    const activeKey = this.props.route.activeKey || 'relay';
    const onSelect = (key) => {
      this.props.history.push('/' + key);
    };

    return <Tabs activeKey={activeKey} onSelect={onSelect}>
      <Tab eventKey={'relay'} title="Relay">
        <RelayRssRouter />
      </Tab>
      <Tab eventKey={'resizer'} title="ResizeWrapper">
        <ResizeWrapperDemo />
      </Tab>
    </Tabs>;
  }
});


const Root = React.createClass({
  render() {
    return <RelayRouter history={history}>
      <Route path="/" >
        <IndexRoute component={RootTabs}  activeKey={'relay'} queries={RelayRssFeedDemo.Queries} />
        <Route path="relay" component={RootTabs}  activeKey={'relay'} queries={RelayRssFeedDemo.Queries} />
        <Route path="resizer" component={RootTabs} activeKey={'resizer'} />
      </Route>
    </RelayRouter>;
  }
});

function start() {
    const root = document.getElementById('root');
    ReactDOM.render(<Root />, root);
}

window.onload = start;
