import React, { Component } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { login } from '../actions/index';
import ibm from '../images/IBM_white.png';
import '../styles/Login.css';
import { Snackbar } from '@material-ui/core';
import { Link } from 'react-router-dom';
class Login extends Component {
  state = {
    email: '', passwords: '', error: '', err: false
  }
  error = () => {
    setTimeout(() => {
      this.setState({ err: false, error: '' })
    }, 1500);
  }
  validate(e) {
    e.preventDefault();
    let { email, passwords } = this.state;
    this.setState({ err: false })
    if (this.state.email === "" && this.state.passwords === "") {
      this.setState({ error: "Email Id and password should not be blank!", err: true, iconColor: "text-danger" });
      this.error()


    } else if (!this.state.email.includes("ibm.com")) {
      this.setState({ error: "Allowed IBM authorized user only!", err: true, iconColor: "text-danger" })
      this.error()

    } else if (this.state.passwords === "") {
      this.setState({ error: "Password should not be blank!", err: true, iconColor: "text-danger" })
      this.error()
    }
    else {
      this.doLogin(email, passwords)
    }

  }

  doLogin(email, passwords) {
    this.props.actions.login(email, passwords);
    this.setState({
      email: '',
      passwords: ''
    });
  }


  render() {

    let { isLoginPending, isLoginError } = this.props;

    return (
      <div className=".container-fluid backgroundClass">
        <div className="header">
          <img src={ibm} alt="ibm" className="ibm-image"></img>
        </div>
        <div className="headingClass">CPSD Self Service Ticketing Tool</div>
        {isLoginError && <div className="invalid">{isLoginError}</div>}
        <div className="loginDiv">
          <form onSubmit={this.validate.bind(this)}>
            <div className="form-group">
              <label htmlFor="exampleInputEmail1" className="labelClass" ><strong>Sign in with your w3id</strong></label><br />
              <input type="email" id="email" className="text-input form-control" aria-describedby="emailHelp" onChange={e => this.setState({ email: e.target.value })} value={this.state.email} />
            </div>
            <div className="form-group">
              <label htmlFor="exampleInputPassword1" className="labelClass"><strong>Password</strong></label><br />
              <input type="password" className="text-input form-control" id="password" onChange={e => this.setState({ passwords: e.target.value })} value={this.state.passwords} />
            </div>
            <button type="submit" className="btn btn-primary loginButtonClass" >Sign In</button>
          </form>
        </div>
        {isLoginError === null && isLoginPending && <div className="text-center">
          <div className="spinner-border spin" role="status">
            <span className="sr-only">Loading...</span>
          </div>
        </div>}
        <div>
          <Snackbar
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            open={this.state.err}
            className='snacking'
            message={this.state.error}
          />
        </div>
        {/* modal dispalys when we click on footer */}
        <div className="modal login-modal" id="login">
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h4 className="modal-title">Aditya Rao</h4>
              </div>
              <div className="modal-body">
                Transformation & Automation - CPS F&A Global Lead (Cognitive Process Services)
                Global Business Services<br /><br /><br />
                Email ID  :  adityarao@in.ibm.com<br />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-primary" data-dismiss="modal">OK</button>
              </div>
            </div>
          </div>
        </div>
        {/* footer */}
        <div className="footer">
          <button id="termsLink" className="ds-display-inline-block ds-mar-b-1 hp-footer-link text-footer but-foot" rel="noopener noreferrer" onClick={this.handleContact} data-toggle="modal" data-target="#login">Contact</button>
          <Link id="termsLink" to={{ pathname: "https://w3.ibm.com/w3/info_terms_of_use.html" }} rel="noopener noreferrer" target="_blank" className="ds-display-inline-block ds-mar-b-1 hp-footer-link text-footer">Terms of Use</Link>
          <Link id="privacyLink" to={{ pathname: "https://w3.ibm.com/w3-privacy-notice" }} target="_new" className="ds-display-inline-block ds-mar-b-1 hp-footer-link text-footer">Privacy Policy</Link>
          <Link id="accessibilityLink" rel="noopener noreferrer" to={{ pathname: "https://w3-connections.ibm.com/wikis/home?lang=en-us#!/wiki/Wf49a0f070e65_41de_bb0a_ff81f7eb3319/page/yourIBM%20Accessibility%20Features" }} target="_blank" className="ds-display-inline-block ds-mar-b-1 hp-footer-link text-footer">w3 Accessibility</Link>
          <Link id="conductLink" rel="noopener noreferrer" to={{ pathname: "https://w3.ibm.com/ibm/documents/corpdocweb.nsf/ContentDocsByTitle/Business+Conduct+Guidelines" }} className="ds-display-inline-block ds-mar-b-1 hp-footer-link text-footer" target="_blank">Business Conduct Guidelines</Link>
        </div>
      </div>
    )
  }

}


const mapStateToProps = state => ({
  isLoginPending: state.user.isLoginPending,
  isLoginSuccess: state.user.isLoginSuccess,
  isLoginError: state.user.isLoginError
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators({ login }, dispatch)
});

export default connect(mapStateToProps, mapDispatchToProps)(Login);


