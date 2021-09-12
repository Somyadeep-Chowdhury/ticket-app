import React from 'react';
import ReactDOM from 'react-dom';
// import '@fortawesome/fontawesome-free/css/all.min.css';
// import 'bootstrap-css-only/css/bootstrap.min.css';
// import 'mdbreact/dist/css/mdb.css';
// import { render } from 'react-dom';
// import { HashRouter } from 'react-router-dom';

// import { HashRouter } from 'react-router-dom';
import { BrowserRouter } from 'react-router-dom';

//Redux dependencies...
import { Provider } from 'react-redux';
import configureStore from './store/index';

//Loaded default css and app files...
import './index.css';
import App from './App';

import * as serviceWorker from './serviceWorker';


//History and store for redux data retrieved...
import { createBrowserHistory } from 'history'
export const history = createBrowserHistory();
const store = configureStore();
/*React render the app with router-redux via */
//ReactDOM.render(<HashRouter><App /></HashRouter>, document.getElementById('root'));
ReactDOM.render(
  <Provider history={history} store={store}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </Provider>, document.getElementById('root'));

// export const history = createBrowserHistory();
// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
// serviceWorker.unregister();
serviceWorker.unregister();
