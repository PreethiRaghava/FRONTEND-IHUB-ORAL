import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';

axios.defaults.baseURL = process.env.REACT_APP_DEV === "true" ? process.env.REACT_APP_PROXY_DEV : process.env.REACT_APP_PROXY_DEPLOY
ReactDOM.render( <App /> , document.getElementById('root')
);
