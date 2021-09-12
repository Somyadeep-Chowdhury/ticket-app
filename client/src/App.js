import React, { Component } from 'react';

import { BrowserRouter as Router, Redirect, Route } from 'react-router-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import PropTypes from 'prop-types'
import Login from './components/Login';
import Header from './components/Header';
import * as AllActions from './actions'
import { login } from '../src/actions/index';
import SimpleBot from './components/SimpleBot';
// import CreateIncident from './components/CreateIncident';
// import Issue from './components/Issue';
// import Allincidents from './components/Allincidents';
// import Upload from './components/Upload';
// import Notification from './components/Notification';
// import AllNotification from './components/AllNotification';
// import Profiles from './components/Profiles';


class App extends Component {
  render() {
    const { user } = this.props;
    // if (user && user.isLoginSuccess === true) {
    //   return (
    //     <Router >
    //       <Route exact path='/' component={Header}></Route>
    //     </Router>
    //   )
    // }
    // return (
    //   <Router >
    //     <Route exact path='/' component={Login}></Route>
    //   </Router>
    // );

    // return (
    //   <div className='main-app'>
    //     <Router>
    //       <Switch>
    //         <Route exact path="/" render={() => (<Redirect to="/login" />)} />
    //         <Route exact path="/login" exact component={Login} />
    //         {/* <Route exact path="/new-ticket" exact component={CreateIncident} />
    //         <Route exact path="/my-tickets" exact component={Issue} />
    //         <Route exact path="/all-tickets" exact component={Allincidents} />
    //         <Route exact path="/profile" exact component={Profiles} />
    //         <Route exact path="/upload" exact component={Upload} />
    //         <Route exact path="/tools" exact component={Notification} />
    //         <Route exact path="/notification-log" exact component={AllNotification} /> */}
    //       </Switch>
    //     </Router>
    //   </div>
    // )

    if (user && user.isLoginSuccess === true) {
      return (
        <div>
          <Header />
          <SimpleBot />
          <Router >
            {/* <Switch> */}
            {/* <Route exact path="/new-ticket" exact component={CreateIncident} />
              <Route exact path="/my-tickets" exact component={Issue} />
              <Route exact path="/all-tickets" exact component={Allincidents} />
              <Route exact path="/profile" exact component={Profiles} />
              <Route exact path="/upload" exact component={Upload} />
              <Route exact path="/tools" exact component={Notification} />
              <Route exact path="/notification-log" exact component={AllNotification} /> */}
            {/* </Switch> */}
          </Router>
        </div>
      )
    } else {
      return (
        <Router >
          {/* <Route exact path="/" render={() => (<Redirect to="/login" />)} /> */}
          <Route exact path="/" component={Login} />
          <Route exact path="**" render={() => (<Redirect to="/" />)} />
        </Router>
      );
    }
  }
}

App.propTypes = {
  actions: PropTypes.object.isRequired,
  user: PropTypes.object.isRequired
}
const mapStateToProps = state => ({
  user: state.user,
  page: state.page,
  isLoginPending: state.user.isLoginPending,
  isLoginSuccess: state.user.isLoginSuccess,
  isLoginError: state.user.isLoginError,
  Success: state.page.Success,
})
const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators({ login }, AllActions, dispatch)
})

export default connect(mapStateToProps, mapDispatchToProps)(App);
