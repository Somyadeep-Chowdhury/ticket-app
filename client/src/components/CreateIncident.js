import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import CircularProgress from '@material-ui/core/CircularProgress';
import '../styles/CreateIncident.css'
import { raiseIssue, getAllIssueTypes, mailToUser, mailToSME, getAllUsers, getPopNotification, changeMenu } from '../actions/index';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Slide from '@material-ui/core/Slide';
import Snackbar from '@material-ui/core/Snackbar';
import { Link, withRouter } from 'react-router-dom';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

class CreateIncident extends Component {

  state = {
    name: "",
    createdDate: '',
    description: '',
    practitioner: '',
    recordId: "",
    flag: false,
    radio: "",
    issuetype: '',
    ccomments: "",
    spinnerFlag: false,
    category: "",
    error: '',
    err: false,
    sections: [],
    section: '',
    types: [],
    createFor: '',
    ticketType: '',
    issueval: '',
    types_of_ticket: [],
    severity: '',
    verifyMessage: '',
    verify: false,
    type: '',
    sharedInfo: "",
  }
  UNSAFE_componentWillMount() {
    // this.props.actions.getAllUsers();
    if (this.props.user_details) {
      this.setState({ name: (this.props.user_details.userEmail).toLowerCase() })
    }
    this.props.actions.getAllIssueTypes()
  }
  componentDidUpdate(prevProps) {
    if (prevProps.issueTypes !== this.props.issueTypes) {
      // if (this.props.user_details.role === "Super Admin") {
      if (this.props.issueTypes && this.props.issueTypes.length !== 0) {
        this.setState({ types: this.props.issueTypes })
      }
      // } 
      // else if (this.props.user_details.role === "Super User") {
      //   if (this.props.issueTypes && this.props.issueTypes.length !== 0) {
      //     let usercategory = this.props.user_details.details[0]['ISSUE_TYPE'];
      //     let finalCategory = this.props.issueTypes.filter(x => usercategory.includes(x.name))
      //     this.setState({ types: finalCategory })
      //   }
      // }

    }
    if (this.props.verify !== prevProps.verify) {
      if (this.props.verify.length > 0) {
        let sec = this.state.section
        let a = this.props.verify.filter(x => x.ISSUE_CATEGORY === sec)
        if (a.length !== 0 && this.props.verify.length > 0) {
          let msg = a[0]['REASONS'] + " Alerts!\n"
            + a[0]['DESCRIPTION'] + " from " + a[0]['START_DATE'] + " " + a[0]['START_TIME'] + " to " + a[0]['END_DATE'] + " " + a[0]['END_TIME']
          this.setState({ verifyMessage: msg, verify: false })
        } else if (a.length === 0 && this.props.verify[0]['ISSUE_CATEGORY'] === "") {
          let msg = a[0]['REASONS'] + " Alerts!\n"
            + this.props.verify[0]['DESCRIPTION'] + " from " + this.props.verify[0]['START_DATE'] + " " + this.props.verify[0]['START_TIME'] + " to " + this.props.verify[0]['END_DATE'] + " " + this.props.verify[0]['END_TIME']
          this.setState({ verifyMessage: msg, verify: false })
        } else { this.setState({ verifyMessage: '', verify: true }) }
      } else {
        this.setState({ verifyMessage: '', verify: true })
      }
    }
  }

  handleReset = () => {
    this.setState({
      description: '',
      verifyMessage: '',
      verify: false,
      issuetype: '',
      practitioner: '',
      section: '',
      sections: [],
      severity: '',
      sharedInfo: '',
      spinnerFlag: false,
      err: false,
      error: "",
      flag: false,
      type: ''
    })
  }

  error = () => {
    setTimeout(() => {
      this.setState({ err: false, error: '' })
    }, 3500);
  }
  handleSubmit = () => {
    if (this.state.type === "" || this.state.issuetype === "" || this.state.issuetype === undefined || this.state.severity === "" || this.state.severity === undefined || this.state.practitioner === "" || this.state.description === "" || this.state.section === undefined || this.state.section === "" || this.state.description.length === 0 || this.state.ticketType === '') {
      this.setState({ error: "All Fields Are Mandatory", err: true, iconColor: "text-danger" });
      this.error()
    }
    else if (this.state.description.length > 1000) {
      this.setState({ error: "Description should not exceed 1000 characters", err: true, iconColor: "text-danger" });
      this.error()
    }
    else {
      this.handleComment();
    }
  }
  handleComment = () => {
    var min = 100000;
    var max = 999999;
    var random = Math.floor(Math.random() * (max - min + 1)) + min;
    var dt = new Date();
    var date = dt.getDate();
    if (date <= 9) {
      date = '0' + date;
    }
    var month = dt.getMonth() + 1;
    if (month <= 9) {
      month = '0' + month;
    }
    var hour = dt.getHours()
    if (hour <= 9) {
      hour = '0' + hour;
    }
    var mins = dt.getMinutes()
    if (mins <= 9) {
      mins = '0' + mins;
    }

    var data = this.state;
    delete data.err
    delete data.error
    var incidentObj = {};
    Object.assign(incidentObj, {
      type: this.state.type,
      issuetype: this.state.issuetype,
      name: this.state.name,
      practitioner: this.state.practitioner,
      category: this.state.category,
      description: this.state.description.replace(/[,+()'"*<>{}]/g, ' '),
      severity: this.state.severity,
      createdDate: date + "-" + month + "-" + dt.getFullYear() + " " + hour + ":" + mins,
      recordId: random,
      section: this.state.section,
      sharedInfo: this.state.sharedInfo,
      createFor: this.state.createFor,
      ticketType: this.state.ticketType,
      loggedinUser: this.props.user_details.username,
      loggedinEmail: this.props.user_details.userEmail
    })

    this.setState({ spinnerFlag: true })
    this.props.actions.raiseIssue(incidentObj);
    setTimeout(() => {
      if (this.props.result.length === 1) {
        this.setState({ error: "Ticket Successfully Submitted", err: true, iconColor: "text-success", spinnerFlag: false, issueval: "Success" });
        this.error();
        // this.props.actions.mailToUser(incidentObj)
        // this.props.actions.mailToSME(incidentObj)
        this.props.actions.changeMenu('All Ticket Logs')
        this.Reset();
      }
      else {
        this.setState({ show: false, err: true, error: "Something Went wrong", iconColor: "text-danger", spinnerFlag: false })
        this.error();
      }
    }, 8000)
  }
  Reset() {
    setTimeout(() => {
      this.handleReset()
    }, 500)
  }
  handleChangeType(e) {
    var section;
    this.state.types && this.state.types.forEach(function (opt) {
      if (opt.name === e.target.value) {
        section = opt.section;
      }
    })
    if (section.length === 0) {
      this.setState({ issuetype: e.target.value, sections: [], types_of_ticket: [], section: '', ticketType: '' })
    } else
      this.setState({ issuetype: e.target.value, sections: section, section: '', ticketType: '', types_of_ticket: [] })
  }
  handleSubcategory = (e) => {
    var ttype;
    var issue = this.state.issuetype
    this.state.types && this.state.types.forEach(function (opt) {
      if (opt.name === issue) {
        opt.ticketType && opt.ticketType.forEach((type) => {
          if (type.section === e) {
            ttype = type.type
          }
        })
      }
    })
    this.setState({ section: e, types_of_ticket: ttype, ticketType: '', verify: false, verifyMessage: "" })
    this.props.actions.getPopNotification(this.state.issuetype)
  }

  // handleVerify = () => {
  //   this.props.actions.getPopNotification(this.state.issuetype)
  // }
  render() {
    return (
      <div className="container-fluid">
        {this.state.types && this.state.types.length !== 0 ?
          <div className="card main-card">
            <div className="card-header text-center createheader">Raise New Ticket</div>
            <div className="card-body cardbody">
              <div className="row">
                <div className="col-sm-6 col-md-6">
                  <div className="row">
                    <div className="col-sm-6 col-md-3">
                      <label className="mb-3  pr-5"><strong>Request For </strong><span className='required-aster'>*</span></label>
                    </div>
                    <div className="col-sm-6 col-md-6">
                      <label className="radio-inline pr-3">
                        <input
                          value="Self"
                          checked={this.state.type === "Self"}
                          type="radio" name="Self"
                          onChange={e => this.setState({ type: e.target.value, practitioner: (this.props.user_details.userEmail).toLowerCase(), severity: "Low (less than 5 Employees)" })} />&nbsp;&nbsp;Self</label>
                      <label className="radio-inline">
                        <input type="radio" name="Others" value="Others"
                          checked={this.state.type === "Others"}
                          onChange={e => this.setState({ type: e.target.value, practitioner: "", severity: "" })} />&nbsp;&nbsp;For Others</label>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-sm-6 col-md-3 pb-2 pt-2">
                      <label><strong>Issue Raised By</strong></label><span className='required-aster'>*</span></div>
                    <div className="col-sm-6 col-md-8">
                      <input
                        readOnly
                        className="form-control"
                        value={this.state.name}
                        type="text"></input>
                    </div>
                  </div>
                  {this.state.type === "Others" &&
                    <div className="row">
                      <div className="col-sm-6 col-md-3 pb-2 pt-2">
                        <label><strong>Issue Raised For</strong></label><span className='required-aster'>*</span></div>
                      <div className="col-sm-6 col-md-8">
                        <input
                          className="form-control"
                          placeholder="User email ID"
                          value={this.state.practitioner}
                          onChange={e => this.setState({ practitioner: e.target.value })}
                          type="text"></input>
                      </div>
                    </div>}
                  <div className="row">
                    {this.state.type === "Self" ?
                      <div className="col-sm-6 col-md-3 pb-2 pt-2">
                        <label><strong>Impact Category</strong><span className='required-aster'>*</span></label>
                      </div> :
                      <div className="col-sm-6 col-md-3 pb-2 pt-2">
                        <label><strong>Priority Category</strong><span className='required-aster'>*</span></label>
                      </div>}
                    <div className="col-sm-6 col-md-8">
                      <select
                        className="form-control"
                        value={this.state.severity}
                        disabled={this.state.type === "Self"}
                        onChange={e => this.setState({ severity: e.target.value })}>
                        <option value="" disabled>Choose From Dropdown</option>
                        <option key="high">High {"(greater than 21 Employees)"} </option>
                        <option key="medium">Medium {"(greater than 6 - less than 20 Employees)"}</option>
                        <option key="low">Low {"(less than 5 Employees)"}</option>
                      </select>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-sm-6 col-md-3 pb-2 pt-2">
                      <label><strong>Share Ticket Info</strong></label>
                    </div>
                    <div className="col-sm-6 col-md-8">
                      <input
                        className="form-control"
                        placeholder="Email ID Details (Optional)"
                        value={this.state.sharedInfo}
                        onChange={e => this.setState({ sharedInfo: e.target.value })}>
                      </input>
                    </div>
                  </div>
                </div>
                <div className="col-sm-6 col-md-6">
                  <div className="row">
                    <div className="col-sm-6 col-md-3">
                      <label className=" pt-2 pl-3"><strong>Category</strong><span className='required-aster'>*</span></label>
                    </div>
                    <div className="col-sm-6 col-md-8">
                      <select className="form-control mb-2" value={this.state.issuetype}
                        onChange={(e) => this.handleChangeType(e)}>
                        <option value="" disabled>Choose from dropdown</option>
                        {this.state.types && this.state.types.map((opt) => {
                          return (
                            <option key={opt.name}>{opt.name}</option>
                          )
                        })}
                      </select>
                    </div>
                  </div>
                  {this.state.sections && this.state.sections.length !== 0 &&
                    <div> <div className="row">
                      <div className="col-sm-6 col-md-3">
                        <label className="pt-2 pl-3"><strong>Portals & Dashboard</strong><span className='required-aster'>*</span></label>
                      </div>
                      <div className="col-sm-6 col-md-8">
                        <select className="form-control mb-2" value={this.state.section}
                          onChange={e => this.handleSubcategory(e.target.value)}
                        >
                          <option value="" disabled>Choose from dropdown</option>
                          {this.state.sections && this.state.sections.map((opt) => {
                            return (
                              <option key={opt}>{opt}</option>
                            )
                          })}
                        </select>
                      </div>
                      {/* {this.state.section !== "" &&
                        <div>
                          {this.state.verify === false ?
                            <span className='verify' onClick={(e) => this.handleVerify()}><strong>Verify</strong></span>
                            :
                            <span className='verify text-success' disabled><strong>Proceed</strong></span>
                          }
                        </div>
                      } */}
                    </div>
                      <div className="row">
                        <div className="col-sm-6 col-md-3">
                          {this.state.types_of_ticket.length > 0 && this.state.verify === true && <label className="pt-2 pl-3"><strong>Ticket Type</strong><span className='required-aster'>*</span></label>}
                        </div>
                        {this.state.types_of_ticket.length > 0 && this.state.verify === true &&
                          <div className="col-sm-6 col-md-8">
                            <select className="form-control mb-2" value={this.state.ticketType}
                              onChange={e => this.setState({ ticketType: e.target.value })}>
                              <option value="" disabled>Choose from dropdown</option>
                              {this.state.types_of_ticket && this.state.types_of_ticket.map((opt) => {
                                return (
                                  <option key={opt}>{opt}</option>
                                )
                              })}
                            </select>
                          </div>}
                        {/* } */}
                      </div></div>}
                </div>
              </div>
              <div className="row mt-2">
                <div className="col-sm-12 col-md-12">
                  <label><strong>Description Of The Issue</strong><span className='required-aster'>*</span></label>
                  <textarea
                    className="form-control"
                    placeholder="Describe your concern here"
                    value={this.state.description}
                    onChange={e => this.setState({ description: e.target.value })}
                    type="text"
                    rows="6"></textarea>
                </div>
              </div>
            </div>
            <div className="card-footer createfooter">
              <button component={Link}
                to="/all-tickets"
                className="btn btu-submit"
                onClick={this.handleSubmit}
                disabled={!this.state.verify}>Create</button>
            </div>
            {
              this.state.spinnerFlag === true && <div className="spinnerClass text-center">
                <CircularProgress />

              </div>
            }
          </div>
          :
          <div className="text-center">
            <div className="spinner-border" role="status">
              <span className="sr-only">Loading...</span>
            </div>
          </div>
        }
        <Snackbar
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          open={this.state.err}
          className='snacking'
          message={this.state.error}
        />

        {/* Dialog for displaying notification */}
        <Dialog
          open={this.state.verifyMessage !== "" && this.state.verify === false}
          TransitionComponent={Transition}
          keepMounted
          onClose={this.handleReset}
          aria-labelledby="alert-dialog-slide-title"
          aria-describedby="alert-dialog-slide-description"
        >
          <DialogTitle id="alert-dialog-slide-title">{"Notification"}</DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-slide-description">
              {this.state.verifyMessage !== "" ? this.state.verifyMessage : "Sorry, Network Error. Please Try Later"}
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => this.setState({ verify: true })} color="primary">
              Create Ticket
          </Button>
            <Button
              onClick={() => {
                this.handleReset();
                this.props.actions.changeMenu('All Ticket Logs')
              }}
              color="primary">
              Close
          </Button>
          </DialogActions>
        </Dialog>
      </div >
    )
  }

}


const mapStateToProps = state => ({
  allUsers: state.page.allUsers,
  user_details: state.user.user_details,
  result: state.page.result,
  issueTypes: state.page.issueTypes,
  verify: state.page.verify,
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators({ raiseIssue, getAllIssueTypes, mailToUser, mailToSME, getAllUsers, getPopNotification, changeMenu }, dispatch)
});

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(CreateIncident));


