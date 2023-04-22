import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';

axios.defaults.baseURL = process.env.REACT_APP_PROXY
ReactDOM.render(<App />, document.getElementById('root')
);
