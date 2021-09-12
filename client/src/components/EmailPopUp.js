import { Snackbar } from '@material-ui/core';
import React, { Component } from 'react'
import '../styles/notification.css';
import * as AllActions from '../actions/index';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const Reason = ["Bug Fix", "Maintenance", "DB Downtime", "Application Downtime"]
const geo = ["America", "China", "Europe", "India", "Philippines", "All"]
const audience = ["SME", "Country Lead", "DPE", "Domain Lead", "Geo Lead", "Geo Practice Lead", "Global Delivery Lead", "Global Practice Lead", "PE", "Squad Lead", "Squad Member", "Super Admin", "Super User", "Tribe Lead"]

class EmailPopUp extends Component {
    constructor(props) {
        super(props)
        this.state = {
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
            displayStart: new Date(),
            displayEnd: new Date(),
            selectedFile: [],
            fileLoading: false,
        }
    }


    UNSAFE_componentWillMount() {
        this.props.actions.getAllIssueTypes();

        if (this.props.issueTypes.length > 0) {
            this.setState({ types: this.fetchCategory(this.props.issueTypes) })
        }
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
            final = (section[0]).filter(value => (this.state.propsSec).includes(value));
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
    }

    handleReset = () => {
        this.setState({
            category: "",
            subCategory: "",
            reason: "",
            geography: "",
            audience: "",
            start: "",
            end: "",
            description: "",
            audienceArr: [],
            sendAs: "email_slack",
            displayStart: new Date(),
            displayEnd: new Date(),
            selectedFile: [],
            fileLoading: false
        })
    }

    saveInfo = () => {
        if (this.state.category === "" || this.state.reason === "" || this.state.audience === "" || this.state.subCategory === "" || this.state.geography === "") {
            this.setState({ err: true, errorMsg: "Please fill all fields", iconColor: "text-danger" })
            this.error()
        }
        else if (this.state.reason === "Maintenance" && this.state.start === "") {
            this.setState({ err: true, errorMsg: "Please enter start date", iconColor: "text-danger" })
            this.error()
        }
        else if (this.state.reason === "Maintenance" && this.state.end === "") {
            this.setState({ err: true, errorMsg: "Please enter end date", iconColor: "text-danger" })
            this.error()
        }
        else if (this.state.reason === "Maintenance" && this.state.description === "") {
            this.setState({ err: true, errorMsg: "Please enter description", iconColor: "text-danger" })
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
                type = "not_in"
                userList = []
            }
            // console.log(userList)
            let obj = Object.assign({}, {
                category: this.state.category,
                subCategory: this.state.subCategory,
                reason: this.state.reason,
                geography: this.state.geography,
                audience: this.state.audience,
                start: this.state.start,
                end: this.state.end,
                description: this.state.description,
                userList: userList.length > 0 ? userList : [],
                user: this.props.user_details.userEmail,
                loggedinUser: this.props.user_details.username,
                loggedinEmail: this.props.user_details.userEmail,
                type: type,
                selectedFile: this.state.selectedFile
            })
            if (this.state.sendAs === "email") {
                this.props.actions.notificationMail(obj)
            } else if (this.state.sendAs === "slack") {
                this.props.actions.slackNotification(obj)
            } else if (this.state.sendAs === "email_slack") {
                this.props.actions.notificationMail(obj)
                this.props.actions.slackNotification(obj)
            }
            this.props.actions.postNotification(obj)
            setTimeout(() => {
                if (this.props.notification && this.props.notification.status === 200) {
                    this.setState({ err: true, errorMsg: "Notification Added Successfully", iconColor: "text-success", spinnerFlag: false, emailids: '' })
                    this.error()
                    this.handleReset()
                }
                else {
                    this.setState({ err: true, errorMsg: "Something went wrong", iconColor: "text-danger", spinnerFlag: false })
                    this.error()
                }
            }, 5000)
        }
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
    handleInputDate = (dt) => {
        return dt.toISOString();
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
        // console.log(this.state)
        return (
            <div className="container-fluid main-popUp">
                <div className='main-popUp'>
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
                                        placeholder="Enter email ids ex:(jsmith@xx.ibm.com , jhon@in.ibm.com)"
                                        value={this.state.emailids}
                                        onChange={e => this.setState({ emailids: e.target.value })}
                                        type="text"
                                        rows="3"></textarea>
                                </div>
                            </div>}
                    </div>
                    <br />
                    {this.state.reason !== "" &&
                        <div className="card main-card">
                            <div className="card-header text-center createheader">Notification</div>
                            <div className="card-body cardbody">

                                <div className="row mt-3">
                                    <div className="col-md col-sm">
                                        <label><strong>Start Date and Time</strong></label>
                                        <DatePicker
                                            selected={this.state.displayStart}
                                            className="form-control"
                                            onChange={date => {
                                                this.setState({ displayStart: date })
                                                this.setState({ start: this.handleInputDate(date) })
                                            }}
                                            locale="en"
                                            showTimeSelect
                                            timeFormat="p"
                                            timeIntervals={1}
                                            dateFormat="Pp"
                                        />
                                    </div>
                                    <div className="col-md col-sm">
                                        <label><strong>End Date and Time</strong></label>
                                        <DatePicker
                                            selected={this.state.displayEnd}
                                            className="form-control"
                                            onChange={date => {
                                                this.setState({ displayEnd: date })
                                                this.setState({ end: this.handleInputDate(date) })
                                            }}
                                            locale="en"
                                            showTimeSelect
                                            timeFormat="p"
                                            timeIntervals={1}
                                            dateFormat="Pp"
                                            minDate={this.state.displayStart}
                                        />
                                    </div>
                                </div>
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
                                            id="input-file2"
                                            onClick={e => { e.target.value = null; this.setState({ selectedFile: [] }) }}
                                            className="form-control-file"
                                            onChange={this.onFileChange}
                                            multiple />
                                    </div>
                                </div>}
                            </div>

                            <div className="card-footer createfooter">
                                <button className="btn btu-submit"
                                    onClick={e => this.saveInfo()}
                                    disabled={this.state.fileLoading}>Send</button>
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
                    }
                </div>
                <Snackbar
                    anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                    open={this.state.err}
                    className='snacking'
                    message={this.state.errorMsg}
                />
            </div>

        )
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

export default connect(mapStateToProps, mapDispatchToProps)(EmailPopUp);