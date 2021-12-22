import React from 'react';
import { render } from 'react-dom';
import './index.scss';
import './css/bootstrap.min.css';
import './css/custom.css';
import './css/css2.css';
import './css/njt-styles.css';
import 'font-awesome/css/font-awesome.min.css';
import App from './App';
import { UserAgentProvider } from 'react-ua';
import './i18n';
import 'react-app-polyfill/ie11';
import 'react-app-polyfill/stable';
import "babel-polyfill";
import "core-js/stable";
import "regenerator-runtime/runtime";

render(<UserAgentProvider> <App /> </UserAgentProvider>,  document.getElementById('root'));
