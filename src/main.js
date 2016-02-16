import "babel-polyfill";
import React from 'react';
import ReactDOM from 'react-dom';
import ResizeWrapperDemo from './resizer/ResizeWrapperDemo';

const Root = React.createClass({
  render: function() {
    return <ResizeWrapperDemo></ResizeWrapperDemo>;
  }
});

function start() {
    const root = document.getElementById('root');
    ReactDOM.render(<Root />, root);
}

window.onload = start;
