import "babel-polyfill";

import React from 'react';
import ReactDOM from 'react-dom';

import Root from './Root';

function start() {
    const root = document.getElementById('root');
    ReactDOM.render(<Root />, root);
}

window.onload = start;
