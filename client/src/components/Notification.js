import React, { Component } from 'react';
import * as AllActions from '../actions/index';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import '../styles/notification.css';
import { Snackbar } from '@material-ui/core';
const Reason = ["Bug Fix", "Maintenance", "DB Downtime", "Application Downtime"]
const geo = ["America", "China", "Europe", "India", "Philippines", "All"]

const audience = ["SME", "Country Lead", "DPE", "Domain Lead", "Geo Lead", "Geo Practice Lead", "Global Delivery Lead", "Global Practice Lead", "PE", "Squad Lead", "Squad Member", "Super Admin", "Super User", "Tribe Lead"]
class Notification extends Component {
    state = {
        types: [],
        sections: [],
        category: '',
        subCategory: '',
        reason: '',
        description: '',
        err: false,
        errorMsg: '',
        iconColor: '',
        spinnerFlag: false,
        propsSec: [],
        audience: '',
        audienceArr: [],
        emailids: '',
        geography: "",
        sendAs: "email_slack",
        selectedFile: [],
        fileLoading: false
    }
    UNSAFE_componentWillMount() {
        this.inputRef = React.createRef();
        this.props.actions.getAllIssueTypes();
        // this.props.actions.getAllUsers();
        // var type;
        // var sec;
        // if (this.props.user_details.details && this.props.user_details.details.length !== 0) {
        //     if (this.props.user_details.role === "SME") {
        //         this.props.user_details.details && this.props.user_details.details.forEach((opt) => {
        //             type = (opt.ISSUE_TYPE).split(',');
        //             sec = (opt.ISSUE_CATEGORY).split(',')
        //         })
        //         this.setState({ types: type, propsSec: sec })
        //     }
        // }

        if (this.props.issueTypes.length > 0) {
            this.setState({ types: this.fetchCategory(this.props.issueTypes) })
        }
    }
    fetchRoleUsers = (users) => {
        let a = users.map((u) => u.ROLE).filter((value, index, self) => {
            return self.indexOf(value) === index;
        })
        return a
    }
    fetchCategory = (issues) => {
        var type = []
        if (this.props.user_details.role === "Super Admin" || this.props.user_details.role === "Super User") {
            type = issues.map((u) => u.name).filter((value, index, self) => {
                return self.indexOf(value) === index;
            })
        }
        // else if (this.props.user_details.role === "SME") {
        //     var sec = []
        //     this.props.user_details.details && this.props.user_details.details.forEach((opt) => {
        //         type = (opt.ISSUE_TYPE).split(',');
        //         sec = (opt.ISSUE_CATEGORY).split(',')
        //     })
        //     this.setState({ propsSec: sec })
        // }
        return type
    }
    componentDidUpdate(prevProps) {
        if (prevProps.issueTypes !== this.props.issueTypes) {
            this.setState({ types: this.fetchCategory(this.props.issueTypes) })
        }
    }
    handleChangeType = (e) => {
        var section = [];
        var final;
        section = this.props.issueTypes && this.props.issueTypes.filter(function (opt) {
            return opt.name === e.target.value
        }).map(d => d.section)

        if (this.props.user_details.role === "SME") {
            final = (section[0]).filter(value => (this.state.propsSec).includes(value))
            this.setState({ category: e.target.value, sections: final, subCategory: '' })
        } else {
            this.setState({ category: e.target.value, sections: section[0], subCategory: '', audience: '' })
        }
        if (e.target.value === "Insights 360") {
            this.setState({ audienceArr: audience })
        } else {
            this.setState({ audienceArr: [] })
        }
    }
    SubCategory = (e) => {
        var subcat = e.target.value;
        this.setState({ subCategory: subcat, audience: "" })
        // if (subcat === "AMP" || subcat === "AMP- Daily Tracker" || subcat === "AMP Dashboard") {
        //     this.props.actions.getUsers({ key: "AMP" })
        // }
        // else if (subcat === "e Sync" || subcat === "e Sync Dashboard") {
        //     this.props.actions.getUsers({ key: "e Sync" })
        // }
    }
    sendMail = () => {
        if (this.state.category === "" || this.state.reason === "" || this.state.audience === "" || this.state.description === "" || this.state.geography === "") {
            this.setState({ err: true, errorMsg: "Please fill all fields", iconColor: "text-danger" })
            this.error()
        }
        else if (this.state.category !== "Others" && this.state.subCategory === "") {
            this.setState({ err: true, errorMsg: "Please choose Sub-Category", iconColor: "text-danger" })
            this.error()
        }
        else if (this.state.audience === "Manual" && this.state.emailids === "") {
            this.setState({ err: true, errorMsg: "Please enter mail ids", iconColor: "text-danger" })
            this.error()
        }
        else if (this.state.audience === "Manual" && !this.state.emailids.includes('@')) {
            this.setState({ err: true, errorMsg: "Mail should includes '@'", iconColor: "text-danger" })
            this.error()
        }
        else if (this.state.audience === "Manual" && !this.state.emailids.includes('.ibm.com')) {
            this.setState({ err: true, errorMsg: "Mail should includes 'ibm.com'", iconColor: "text-danger" })
            this.error()
        }
        else {
            this.setState({ spinnerFlag: true })
            var userList = []
            let type = "";
            if (this.state.emailids !== "") {
                userList = (this.state.emailids).replace(/\s\s*/g, '').split(',');
                type = "in"
            } else {
                // Add userlist
                // if (this.state.audience === "SME") {
                //     let u = this.state.audience
                //     let category = this.state.category;
                //     let portal = this.state.subCategory;
                //     userList = this.props.allUsers.length > 0 ? this.props.allUsers.filter(el => el.ROLE === u).filter(y => y.ISSUE_TYPE === category).filter(z => z.ISSUE_CATEGORY.includes(portal)).map(x => x.EMP_EMAIL) : [];
                //     type = "in"
                // } else {
                //     type = "not_in"
                //     userList = [];
                // }
                type = "not_in"
                userList = []
            }
            // console.log(userList)
            let mailObj = Object.assign({}, {
                category: this.state.category,
                subCategory: this.state.subCategory,
                reason: this.state.reason,
                description: this.state.description.replace(/[,+()'"*<>{}]/g, '  '),
                geography: this.state.geography,
                userList: userList.length > 0 ? userList : [],
                audience: this.state.audience,
                user: this.props.user_details.userEmail,
                loggedinUser: this.props.user_details.username,
                loggedinEmail: this.props.user_details.userEmail,
                type: type,
                selectedFile: this.state.selectedFile
            })
            if (this.state.sendAs === "email") {
                this.props.actions.notificationMail(mailObj)
            } else if (this.state.sendAs === "slack") {
                this.props.actions.slackNotification(mailObj)
            } else if (this.state.sendAs === "email_slack") {
                this.props.actions.notificationMail(mailObj)
                this.props.actions.slackNotification(mailObj)
            }

            setTimeout(() => {
                if (this.props.notification && this.props.notification.status === 200 && this.props.notification.data.data === "send") {
                    this.setState({ err: true, errorMsg: "Notification sent successfully", iconColor: "text-success", spinnerFlag: false, emailids: '' })
                    this.error()
                    this.handleReset()
                }
                else {
                    this.setState({ err: true, errorMsg: "Something went wrong", iconColor: "text-danger", spinnerFlag: false, emailids: '' })
                    this.error()
                }
            }, 5000)
        }
    }
    handleReset = () => {
        this.setState({
            category: '',
            subCategory: '',
            reason: '',
            description: '',
            spinnerFlag: false,
            audience: '',
            emailids: '',
            sections: '',
            audienceArr: [],
            geography: "",
            sendAs: "email_slack",
            selectedFile: [],
            fileLoading: false
        })
        this.inputRef.current.value = '';
    }
    error = () => {
        setTimeout(() => {
            this.setState({ err: false, errorMsg: "", iconColor: "" })
        }, 3300)
    }
    handleAudience = (e) => {
        var aud = e;
        this.setState({ audience: aud, emailids: "" })
    }

    // handler function for file selection
    onFileChange = async (event) => {
        let files = Object.values(event.target.files)
        this.setState({ fileLoading: true })
        await files.forEach((file, i) => {
            this.convertFileToBase64(file, (base64) => {
                this.setState(prevState => ({
                    selectedFile: [...prevState.selectedFile, { filename: file.name, path: base64 }]
                }));
                if (i + 1 === files.length) {
                    this.setState({ fileLoading: false })
                }
            })
        })
    }

    // converting and returning base64 as callback
    convertFileToBase64 = (file, cb) => {
        let reader = new FileReader();
        reader.readAsDataURL(file);
        setTimeout(() => { cb(reader.result) }, 2000)
    }

    render() {
        return (
            <div className="container-fluid main-popUp">
                {this.state.types && this.state.types.length !== 0 ?
                    <div className="card main-card">
                        <div className="card-header text-center createheader">Notification</div>
                        <div className="card-body cardbody">
                            <div className="row">
                                <div className="col-md col-sm">
                                    <label><strong>Geography</strong></label>
                                    <select className="form-control"
                                        value={this.state.geography}
                                        onChange={(e) => this.setState({ geography: e.target.value })}>
                                        <option value="" disabled>Choose from dropdown</option>
                                        {geo && geo.map((opt) => {
                                            return (
                                                <option key={opt}>{opt}</option>
                                            )
                                        })}
                                    </select>
                                </div>
                                <div className="col-md col-sm">
                                    <label><strong>Category</strong></label>
                                    <select className="form-control"
                                        value={this.state.category}
                                        onChange={(e) => this.handleChangeType(e)}>
                                        <option value="" disabled>Choose from dropdown</option>
                                        {this.state.types && this.state.types.map((opt) => {
                                            return (
                                                <option key={opt}>{opt}</option>
                                            )
                                        })}
                                        <option>Others</option>
                                    </select>
                                </div>
                                {this.state.category !== "Others" &&
                                    <div className="col-md col-sm">
                                        <label><strong>Portals & Dashboard</strong></label>
                                        <select className="form-control"
                                            value={this.state.subCategory}
                                            onChange={(e) => this.SubCategory(e)}>
                                            <option value="" disabled>Choose from dropdown</option>
                                            {this.state.sections && this.state.sections.map((opt) => {
                                                return (
                                                    <option key={opt}>{opt}</option>
                                                )
                                            })}
                                        </select>
                                    </div>
                                }
                                <div className="col-md col-sm">
                                    <label><strong>Reason</strong></label>
                                    <select className="form-control"
                                        value={this.state.reason}
                                        onChange={(e) => this.setState({ reason: e.target.value })}>
                                        <option value="" disabled>Choose from dropdown</option>
                                        {Reason && Reason.map((opt) => {
                                            return (
                                                <option key={opt}>{opt}</option>
                                            )
                                        })}
                                        <option>Others</option>
                                    </select>
                                </div>

                                <div className="col-md col-sm">
                                    <label><strong>Audience</strong></label>
                                    <select className="form-control"
                                        value={this.state.audience}
                                        onChange={(e) => this.handleAudience(e.target.value)}
                                    >
                                        <option value="" disabled>Choose from dropdown</option>
                                        {this.state.audienceArr && this.state.audienceArr.map((opt) => {
                                            return (
                                                <option key={opt}>{opt}</option>
                                            )
                                        })}
                                        <option key={"manual"}>Manual</option>
                                    </select>
                                </div>
                            </div>
                            {this.state.audience === "Manual" &&
                                <div className="row mt-3">
                                    <div className="col-sm col-md">
                                        <label><strong>Enter Mail IDs</strong></label>
                                        <textarea
                                            className="form-control"
                                            placeholder="Enter email ids example:(jsmith@xx.ibm.com , jhon@in.ibm.com)"
                                            value={this.state.emailids}
                                            onChange={e => this.setState({ emailids: e.target.value })}
                                            type="text"
                                            rows="3"></textarea>
                                    </div>
                                </div>}
                            <div className="row mt-3">
                                <div className="col-sm col-md">
                                    <label><strong>Description</strong></label>
                                    <textarea
                                        className="form-control"
                                        placeholder="Description"
                                        value={this.state.description}
                                        onChange={e => this.setState({ description: e.target.value })}
                                        type="text"
                                        rows="6"></textarea>
                                </div>
                            </div>
                            {this.state.sendAs !== "slack" && <div className="row mt-3">
                                <div className="col-sm col-md">
                                    <label><strong>Attach Files</strong></label>
                                    <input 
                                    type="file" 
                                    id="input-file" 
                                    onClick={e => { e.target.value = null; this.setState({selectedFile: []}) }} 
                                    className="form-control-file"
                                    onChange={this.onFileChange} 
                                    multiple 
                                    ref={this.inputRef}/>
                                </div>
                            </div>}
                        </div>
                        <div className="card-footer createfooter">
                            <button className="btn btu-submit" onClick={e => this.sendMail()} disabled={this.state.fileLoading}>Send</button>
                            <div className="form-group row">
                                <label className="col-md-1 col-sm-1 sendvia-label"><strong>Send Via</strong></label>
                                <select className="form-control col-md-2 col-sm-2"
                                    value={this.state.sendAs}
                                    onChange={(e) => this.setState({ sendAs: e.target.value })}>
                                    <option value="" disabled>Choose from dropdown</option>
                                    <option value="email">Email</option>
                                    <option value="slack">Slack</option>
                                    <option value="email_slack">Email & Slack</option>

                                </select>
                            </div>
                            {this.state.spinnerFlag === true && <div className="text-center">
                                <div className="spinner-border" role="status">
                                    <span className="sr-only">Loading...</span>
                                </div>
                            </div>}
                        </div>
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
                    message={this.state.errorMsg}
                />
            </div>
        );
    }
}

const mapStateToProps = state => ({
    issueTypes: state.page.issueTypes,
    notification: state.page.notification,
    user_details: state.user.user_details
});

const mapDispatchToProps = dispatch => ({
    actions: bindActionCreators(AllActions, dispatch)
});

export default connect(mapStateToProps, mapDispatchToProps)(Notification);