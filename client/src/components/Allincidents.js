import React, { Component } from 'react';
import MUIDataTable from "mui-datatables";
import '../styles/Issue.css';
import { Modal } from 'react-bootstrap';
import Color from '../components/Color.js';
import { getAllIssues, updateIssue, getUpdatedRecord, trasferTicket, getAllUsers, replyMail } from '../actions/index';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import CircularProgress from '@material-ui/core/CircularProgress';
import Snackbar from '@material-ui/core/Snackbar';
import WorkingDays from './WorkingDays';
import Tat from './Tat';
import { TextField } from '@material-ui/core';

const columns = [
    {
        name: "CREATED_DATE",
        label: "Created Date & Time",
        options: {
            filter: true,
            sort: true,
        }
    },
    {
        name: "TICKET_NO",
        label: "Ticket No.",
        options: {
            filter: true,
            sort: true,
        }
    },
    {
        name: "NAME",
        label: "Issue Raised By",
        options: {
            filter: true,
            sort: true,
        }
    }, {
        name: "ISSUE_TYPE",
        label: "Category",
        options: {
            filter: true,
            sort: true,
        }
    },
    {
        name: "SECTION",
        label: "Portals & Dashboard",
        options: {
            filter: true,
            sort: true,
        }
    },
    {
        name: "TICKET_TYPE",
        label: "Ticket Type",
        options: {
            filter: true,
            sort: true,
        }
    },
    // {
    //     name: "OWNER",
    //     label: "SME",
    //     options: {
    //         filter: true,
    //         sort: true,
    //     }
    // },
    {
        name: "CLOSE_DATE",
        label: "Planned Closure Date",
        options: {
            filter: true,
            sort: true,
        }
    },
    {
        name: "TAT",
        label: "TAT",
        options: {
            filter: true,
            sort: true,
            customBodyRender: (value, tableMeta, updateValue) => {
                return (
                    <Tat
                        value={value}
                        index={tableMeta.rowIndex}
                        change={event => updateValue(event)}
                    />
                )
            }
        }
    },
    {
        name: "STATUS",
        label: "Status",
        options: {
            filter: true,
            sort: true,
            customBodyRender: (value, tableMeta, updateValue) => {
                return (
                    <Color
                        value={value}
                        index={tableMeta.columnIndex}
                        change={event => updateValue(event)}
                    />
                )
            }
        }
    },
]
class Allincidents extends Component {
    state = {
        buttons: false,
        data: "",
        show: false,
        preventionplan: "",
        action: "",
        date: "",
        status: "",
        issueimpact: '',
        ownership: '',
        owner: '',
        response: false,
        view_response: false,
        issueList: [],
        name: "",
        createdDate: '',
        description: '',
        practitioner: '',
        recordId: "",
        radio: "",
        issuetype: '',
        ccomments: false,
        category: "",
        tat: '',
        spinnerFlag: false,
        flag: false,
        message: '',
        newdate: "",
        newtat: "",
        responseflag: false,
        btnval: "",
        userResponse: "",
        close_tat: "",
        close_date: '',
        title: "",
        ticketStatus: "",
        internalComments: "",
        transferTo: '',
        justification: "",
        userList: '',
        person: false,
        issueTagging: '',
        resDate: '',
        ticketType: "",
        wipCount: 0,
        openCount: 0,
        closedCount: 0
    }
    UNSAFE_componentWillMount() {
        this.setState({ ownership: this.props.user_details.userEmail, spinnerFlag: true })
        if (this.props.user_details.role === 'Super Admin') {
            this.props.actions.getAllIssues({ "email": this.props.user_details.userEmail, "role": this.props.user_details.role, "data": "getall" });
            this.setState({ title: "All Ticket Logs" })
        }
        else if (this.props.user_details.role === 'Super User') {
            this.props.actions.getAllIssues({ "email": this.props.user_details.userEmail, "role": this.props.user_details.role, "data": "superuserissue", category: this.props.user_details.details[0]['ISSUE_TYPE'] });
            this.setState({ title: "All Ticket Logs" })
        }
        else {
            this.props.actions.getAllIssues({ "email": this.props.user_details.userEmail, "role": this.props.user_details.role, "data": "allissues", category: this.props.user_details.section });
            this.setState({ title: "My Queue" })
            this.props.actions.getAllUsers()
        }
    }
    componentDidUpdate(prevProps) {
        if (prevProps.allIssues !== this.props.allIssues) {
            if (this.props.allIssues && this.props.allIssues.length !== 0) {
                // this.props.allIssues.sort(this.sortBy("CREATED_DATE"));
                this.props.allIssues.sort(function (a, b) {
                    var adt = new Date((b.CREATED_DATE).substring(6, 10) + "-" + (b.CREATED_DATE).substring(3, 6) + (b.CREATED_DATE).substring(0, 2) + " " + (b.CREATED_DATE).substring(11, 17))
                    var bdt = new Date((a.CREATED_DATE).substring(6, 10) + "-" + (a.CREATED_DATE).substring(3, 6) + (a.CREATED_DATE).substring(0, 2) + " " + (a.CREATED_DATE).substring(11, 17))
                    return adt - bdt;
                });
                var today = new Date()
                var wipCount = 0, closedCount = 0, openCount = 0;
                this.props.allIssues && this.props.allIssues.forEach((opt) => {
                    if (opt.STATUS === "Closed") {
                        closedCount = closedCount + 1;
                    }
                    if (opt.TAT) {
                        // var ddt = (opt.CLOSE_DATE).substring(3, 6) + (opt.CLOSE_DATE).substring(0, 3) + (opt.CLOSE_DATE).substring(6)
                        var ddt = (opt.CLOSE_DATE).substring(6, 10) + "-" + (opt.CLOSE_DATE).substring(3, 6) + (opt.CLOSE_DATE).substring(0, 2)//year-month-date
                        var cdt = new Date(ddt)
                        if (opt.STATUS === "Closed") {
                            // closedCount = closedCount + 1;
                            Object.assign(opt, { "TAT": opt.TAT })
                        }
                        else {
                            if (opt.STATUS === "Open") {
                                openCount = openCount + 1
                            }
                            else if (opt.STATUS === "WIP") {
                                wipCount = wipCount + 1
                            }
                            var tatdate = WorkingDays(today, cdt)
                            if (today > cdt) {
                                tatdate = "+" + tatdate
                            }
                            else {
                                return tatdate
                            }
                            Object.assign(opt, { "TAT": tatdate })
                        }
                    }
                })
                this.setState({ issueList: this.props.allIssues, responseflag: true, spinnerFlag: false, wipCount: wipCount, openCount: openCount, closedCount: closedCount })
            }
            else {
                this.setState({ issueList: [], responseflag: true, spinnerFlag: false })
            }
        }
        if (prevProps.updateRecord !== this.props.updateRecord) {
            if (this.props.updateRecord && this.props.updateRecord.length !== 0) {
                for (var i = 0; i < this.props.updateRecord.length; i++) {
                    this.setState({ close_date: this.props.updateRecord[0].CLOSE_DATE, close_tat: this.props.updateRecord[0].TAT, ticketStatus: this.props.updateRecord[0].STATUS, resDate: this.props.updateRecord[this.props.updateRecord.length - 1].RESPONSE_DATE })
                }
                this.setState({ flag: true })
            }
            else if (this.props.updateRecord && this.props.updateRecord.length === 0) {
                this.setState({ flag: true, message: "No Response" })
            }
        }
        if (prevProps.allUsers !== this.props.allUsers) {
            var arr = [];
            this.props.allUsers && this.props.allUsers.forEach((opt) => {
                if (opt.ROLE === "SME") {
                    arr.push(opt)
                }
            })
            this.setState({ userList: arr })
        }
    }
    sortBy(prop) {
        return function (a, b) {
            if (a[prop] < b[prop]) {
                return 1;
            } else if (a[prop] > b[prop]) {
                return -1;
            }
            return 0;
        }
    }
    handleClose = () => {
        this.setState({ show: false, response: false, buttons: false, flag: false })
        this.handleReset()
    }
    handleReset() {
        this.setState({
            buttons: false,
            data: "",
            show: false,
            preventionplan: "",
            action: "",
            date: "",
            status: "",
            issueimpact: '',
            ownership: '',
            owner: '',
            response: false,
            view_response: false,
            name: "",
            createdDate: '',
            description: '',
            practitioner: '',
            recordId: "",
            radio: "",
            issuetype: '',
            ccomments: false,
            category: "",
            tat: '',
            flag: false,
            message: '',
            newdate: "",
            newtat: "",
            btnval: "",
            userResponse: "",
            ticketStatus: "",
            internalComments: "",
            issueTagging: '',
            transferTo: '',
            justification: "",
            spinnerFlag: false,
            userList: '',
            person: false,
            ticketType: '',

        })
    }
    error = () => {
        setTimeout(() => {
            this.setState({ err: false, error: '' })
        }, 3500);
    }
    handleSend = (status, btnval) => {
        if (btnval === "reply") {
            this.setState({ btnval: "reply" })
            if (this.state.ticketStatus === "") {
                if (this.state.userResponse === '' || this.state.date === "") {
                    this.setState({ error: "Please Fill All Fields", err: true, iconColor: "text-danger" });
                    this.error()
                }
                else {
                    this.handleSubmit(status, btnval)
                }
            }
            else {
                if (this.state.userResponse === '') {
                    this.setState({ error: "Please Fill All Fields", err: true, iconColor: "text-danger" });
                    this.error()
                }
                else {
                    this.handleSubmit(status, btnval)
                }
            }
            // }
        }
        else if (btnval === "reply&close") {
            if (this.state.ticketStatus === "") {
                if (this.state.date === "" || this.state.newdate === "" || this.state.userResponse === '' || this.state.internalComments === "" || this.state.issueTagging === "") {
                    this.setState({ error: "Please Fill All Fields", err: true, iconColor: "text-danger" });
                    this.error()
                }
                else {
                    this.handleSubmit(status, btnval)
                }
            }
            else {
                if (this.state.newdate === "" || this.state.userResponse === '' || this.state.internalComments === "" || this.state.issueTagging === "") {
                    this.setState({ error: "Please Fill All Fields", err: true, iconColor: "text-danger" });
                    this.error()
                }
                else {
                    this.handleSubmit(status, btnval)
                }
            }
            // }
        }
    }
    handleSubmit = (status, btnval) => {
        var finaldate;
        if (btnval === "reply&close") {
            if (this.state.ticketStatus === "") {
                var dts = new Date()
                var dat = dts.getDate();
                if (dat <= 9) {
                    dat = '0' + dat;
                }
                var months = dts.getMonth() + 1;
                if (months <= 9) {
                    months = '0' + months;
                }
                finaldate = dat + "-" + months + "-" + dts.getFullYear() + " " + dts.getHours() + ":" + dts.getMinutes()
            }
            else {
                finaldate = this.state.close_date
            }
            if (this.state.newdate !== "") {
                var dt = new Date(this.state.newdate)
                var date = dt.getDate();
                if (date <= 9) {
                    date = '0' + date;
                }
                var month = dt.getMonth() + 1;
                if (month <= 9) {
                    month = '0' + month;
                }
                var actualdt = date + "-" + month + "-" + dt.getFullYear() + " " + dt.getHours() + ":" + dt.getMinutes()
            }
        }
        else if (this.state.ticketStatus === "Open" || this.state.ticketStatus === "WIP") {
            finaldate = this.state.close_date
        }
        else {
            finaldate = this.state.date
        }
        var today = new Date();
        var obj = {};
        Object.assign(obj, {
            recordId: this.state.recordId,
            date: finaldate,
            btnval: this.state.btnval,
            //date: this.state.date,
            preventionplan: this.state.preventionplan,
            status: status,
            ownership: this.props.user_details.userEmail,
            issueimpact: this.state.issueimpact,
            action: this.state.action,
            current_date: today,
            tat: this.state.tat,
            newtat: this.state.newtat,
            newdate: actualdt,
            userResponse: this.state.userResponse.replace(/[,+()'"*<>{}]/g, ' '),
            ticketStatus: this.state.ticketStatus,
            internalComments: this.state.internalComments.replace(/[,+()'"*<>{}]/g, ' '),
            issueTagging: this.state.issueTagging,
            "email": this.props.user_details.userEmail, role: this.props.user_details.role, "data": "allissues",
            update: "sme",
            category: this.props.user_details.section,
            stagename: this.props.user_details.stagename,
            owner: this.state.name,
            createdDate: this.state.createdDate,
            sharedInfo: this.state.sharedInfo,
            name: this.state.name,
            issuetype: this.state.issuetype,
            severity: this.state.severity,
            section: this.state.section,
            practitioner: this.state.practitioner,
            loggedinUser: this.props.user_details.username,
            loggedinEmail: this.props.user_details.userEmail,
        })
        this.setState({ spinnerFlag: true })
        this.props.actions.updateIssue(obj);
        setTimeout(() => {
            if (this.props.updateResult && this.props.updateResult.status === 200 && this.props.updateResult.data.message === "Update response") {
                this.setState({ error: "You have responded to the incident successfully", err: true, iconColor: "text-success", spinnerFlag: false });
                this.error();
                this.props.actions.replyMail(obj)
                this.Reset();
            }
            else {
                this.setState({ show: true, err: true, error: "Something Went wrong", iconColor: "text-danger", spinnerFlag: false })
                this.error();
            }
        }, 7000)
    }
    Reset = () => {
        setTimeout(() => {
            this.handleReset()
        }, 1000)
    }
    handleDateChangeDate = (e) => {
        var today = new Date()
        var tat = WorkingDays(today, new Date(e))
        this.setState({ date: e, tat: tat })
    }
    handleChangeTATDate = (e, btnval, createDt, status) => {
        var ddt;
        var cdt;
        if (status !== "") {
            ddt = createDt.substring(6, 10) + "-" + createDt.substring(3, 6) + createDt.substring(0, 2)
            cdt = new Date(ddt)
        }
        else {
            cdt = createDt
        }
        var tat = WorkingDays(cdt, new Date(e))
        this.setState({ newdate: e, newtat: tat })
    }
    handleTransfer = (btnval) => {
        if (this.state.transferTo === "" || this.state.justification === "") {
            this.setState({ error: "Please Fill All Fields", err: true, iconColor: "text-danger" });
            this.error()
        }
        else if (!this.state.transferTo.includes("@")) {
            this.setState({ error: "Please Enter Valid Email", err: true, iconColor: "text-danger" });
            this.error()
        }
        else if (!this.state.transferTo.includes(".ibm.com")) {
            this.setState({ error: "Email contain .ibm.com", err: true, iconColor: "text-danger" });
            this.error()
        }
        else {
            var obj = {};
            Object.assign(obj, {
                recordId: this.state.recordId,
                transferTo: this.state.transferTo,
                justification: this.state.justification,
                btnval: btnval,
                "email": this.props.user_details.userEmail,
                role: this.props.user_details.role,
                "data": "allissues",
                category: this.props.user_details.section,
                loggedinUser: this.props.user_details.username
            })
            this.setState({ spinnerFlag: true })
            this.props.actions.trasferTicket(obj)
            setTimeout(() => {
                if (this.props.transferTicket.status === 200) {
                    this.setState({ error: "You have transfered ticket successfully", err: true, iconColor: "text-success", spinnerFlag: false });
                    this.error();
                    this.Reset();
                }
                else {
                    this.setState({ show: false, err: true, error: "Something Went wrong", iconColor: "text-danger", spinnerFlag: false })
                    this.error();
                }
            }, 7000)
        }
    }
    handlePerson = (e) => {
        this.setState({ transferTo: e.target.value })
        var val = e.target.value
        if (val === "Others") {
            this.setState({ person: true })
        }
    }
    render() {
        // console.log(this.props, "hello")
        // console.log(this.state)
        const options = {
            responsive: "scrollMaxHeight",
            selectableRows: false,
            onRowClick: (_, { dataIndex }) => {
                var selected_data = this.state.issueList[dataIndex]
                this.props.actions.getUpdatedRecord({ "ticket": selected_data.TICKET_NO })
                this.props.actions.getAllUsers();
                this.setState({
                    show: true,
                    name: selected_data.NAME,
                    practitioner: selected_data.PRACTIONER,
                    createdDate: selected_data.CREATED_DATE,
                    description: selected_data.DESCRIPTION,
                    recordId: selected_data.TICKET_NO,
                    severity: selected_data.SEVERITY,
                    issuetype: selected_data.ISSUE_TYPE,
                    category: selected_data.CATEGORY,
                    section: selected_data.SECTION,
                    tat: selected_data.TAT,
                    sharedInfo: selected_data.SHARED_TICKET,
                    ticketType: selected_data.TICKET_TYPE,
                    owner: selected_data.OWNER
                })
            },
            textLabels: {
                body: {
                    noMatch: "Sorry, no matching records found",
                    toolTip: "Sort",
                    columnHeaderTooltip: column => `Sort for ${column.label}`
                },
                pagination: {
                    next: "Next Page",
                    previous: "Previous Page",
                    rowsPerPage: "Rows per page:",
                    displayRows: "of",
                },
                toolbar: {
                    search: "Search",
                    downloadCsv: "Download CSV",
                    print: "Print",
                    viewColumns: "View Columns",
                    filterTable: "Filter Table",
                },
                filter: {
                    all: "All",
                    title: "FILTERS",
                    reset: "RESET",
                },
                viewColumns: {
                    title: "Show Columns",
                    titleAria: "Show/Hide Table Columns",
                },
                selectedRows: {
                    text: "row(s) selected",
                    delete: "Delete",
                    deleteAria: "Delete Selected Rows",
                },
            }
        }
        return (
            <div className="container-fluid Table">
                {/* {this.state.issueList && this.state.issueList.length !== 0 && */}
                <div className="row rowClass">
                    <div className="col-sm-2 col-md-2 colText">Total Records : {this.state.issueList && this.state.issueList.length > 0 ? this.state.issueList.length : 0}</div>
                    <div className=" col-sm-2 col-md-2 text-new colText" >New : {this.state.issueList && this.state.issueList.length > 0 ? parseInt(this.state.issueList.length) - (parseInt(this.state.openCount) + parseInt(this.state.wipCount) + parseInt(this.state.closedCount)) : 0}
                    </div>
                    <div className=" col-sm-2 col-md-2 text-open colText">Open : {this.state.issueList && this.state.issueList.length > 0 ? this.state.openCount : 0}
                    </div>
                    <div className=" col-sm-2 col-md-2 text-wip colText">WIP : {this.state.issueList && this.state.issueList.length > 0 ? this.state.wipCount : 0}
                    </div>
                    <div className=" col-sm-2 col-md-2 text-closed colText ">Closed : {this.state.issueList && this.state.issueList.length > 0 ? this.state.closedCount : 0}
                    </div>
                </div>
                {/* } */}
                { this.state.spinnerFlag === false && this.state.responseflag === true ?
                    <MUIDataTable
                        title={this.state.title}
                        data={this.state.issueList}
                        columns={columns}
                        options={options}
                    />
                    :
                    <div className="text-center">
                        <div className="spinner-border" role="status">
                            <span className="sr-only">Loading...</span>
                        </div>
                    </div>}
                <Modal show={this.state.show} onHide={e => this.handleClose()} dialogClassName="modal-record" size="lg">
                    <Modal.Header style={{ borderBottom: '5px #0c5bac solid', color: '#0c5bac' }} closeButton>
                        <Modal.Title className="modal-title"><span>Created Date & Time: {this.state.createdDate}</span><span className="modal-secondtit">Ticket No : {this.state.recordId}</span></Modal.Title>
                    </Modal.Header>
                    <Modal.Body className='modal_body'>
                        <div className="card-body cardbody">
                            <div className="row">
                                <div className="col-sm-6 col-md-6">
                                    <div className="row">
                                        <div className="col-sm-6 col-md-3 pb-2 pt-2">
                                            <label><strong>Issue Raised By</strong></label></div>
                                        <div className="col-sm-6 col-md-8">
                                            <input
                                                readOnly
                                                className="form-control"
                                                value={this.state.name}
                                                type="text"></input>
                                        </div>
                                    </div>
                                    {(this.state.name !== this.state.practitioner) &&
                                        <div className="row">
                                            <div className="col-sm-6 col-md-3 pb-2 pt-2">
                                                <label><strong>Issue Raised For</strong></label></div>
                                            <div className="col-sm-6 col-md-8">
                                                <input
                                                    className="form-control"
                                                    value={this.state.practitioner}
                                                    readOnly
                                                    type="text"></input>
                                            </div>
                                        </div>}
                                    {this.state.sharedInfo !== "" &&
                                        <div className="row">
                                            <div className="col-sm-6 col-md-3 pb-2 pt-2">
                                                <label><strong>Share Ticket Info</strong></label>
                                            </div>
                                            <div className="col-sm-6 col-md-8">
                                                <input
                                                    className="form-control"
                                                    readOnly
                                                    value={this.state.sharedInfo}>
                                                </input>
                                            </div>
                                        </div>}
                                    <div className="row">
                                        {this.state.name !== this.state.practitioner ?
                                            <div className="col-sm-6 col-md-3 pb-2 pt-2">
                                                <label><strong>Priority Category</strong></label>
                                            </div> :
                                            <div className="col-sm-6 col-md-3 pb-2 pt-2">
                                                <label><strong>Impact Category</strong></label>
                                            </div>
                                        }
                                        <div className="col-sm-6 col-md-8">
                                            <input
                                                className="form-control"
                                                value={this.state.severity} readOnly>
                                            </input>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-sm-6 col-md-6">
                                    <div className="row">
                                        <div className="col-sm-6 col-md-3">
                                            <label className="pt-2 pl-3"><strong>Category</strong></label>
                                        </div>
                                        <div className="col-sm-6 col-md-8">
                                            <input className="form-control mb-2" value={this.state.issuetype} readOnly>
                                            </input>
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-sm-6 col-md-3">
                                            <label className="pt-2 pl-3"><strong>Portals & Dashboard</strong></label>
                                        </div>
                                        <div className="col-sm-6 col-md-8">
                                            <input className="form-control mb-2" value={this.state.section} readOnly>
                                            </input>
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-sm-6 col-md-3">
                                            <label className="pt-2 pl-3"><strong>Ticket Type</strong></label>
                                        </div>
                                        <div className="col-sm-6 col-md-8">
                                            <input className="form-control mb-2" value={this.state.ticketType} readOnly>
                                            </input>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="row mt-2">
                                <div className="col-sm-12 col-md-12">
                                    <label><strong>Description Of The Issue</strong></label>
                                    <textarea
                                        className="form-control"
                                        value={this.state.description}
                                        readOnly
                                        type="text"
                                        rows="6"></textarea>
                                </div></div>
                        </div>
                        <h6 className="text-center m-3">TICKET TRAIL</h6>
                        {/* Displaying accordions when issue is open */}
                        {(this.props.updateRecord && this.props.updateRecord.length !== 0 && this.state.flag === true) &&
                            <div>
                                <div className="row rowheader">
                                    <div className="col-sm col-md tableheader text-center">Responded Date & Time</div>
                                    <div className="col-sm col-md tableheader text-center">Stage Name</div>
                                    <div className="col-sm col-md tableheader text-center">Status</div>
                                </div>
                                <div id="accordion">
                                    {this.props.updateRecord.length !== 0 && this.props.updateRecord.map((opt, index) => {
                                        var collapasehref = "#collapse-" + index;
                                        var collapaseid = "collapse-" + index;
                                        return (
                                            <div className="card issue-accordion" key={opt.RESPONSE_DATE}>
                                                <div className="card-header" id="heading-1" data-toggle="collapse" data-target={collapasehref} aria-expanded="true" aria-controls={collapaseid}>
                                                    <div className="row cardhead">
                                                        <div className="col-sm col-md text-center">{opt.RESPONSE_DATE}</div>
                                                        <div className="col-sm col-md text-center">{opt.STAGE_NAME} </div>
                                                        <div className="col-sm col-md text-center"><span style={{ color: (opt.STATUS === "Open") ? "#FF8533" : (opt.STATUS === "Closed") ? "green" : (opt.STATUS === "New") ? "#D74D4D" : (opt.STATUS === "WIP") ? "#004D99" : 'white' }}>{opt.STATUS}</span> </div>
                                                    </div>
                                                </div>
                                                <div id={collapaseid} className="collapse" data-parent="#accordion" aria-labelledby="heading-1">
                                                    <div id="accordion-1">
                                                        <div className="card-body  table-responsive" id="heading-1-1">
                                                            <div className="row mt-4">
                                                                {opt.STAGE_NAME !== "User" ? <div className="col-sm-5 col-md-6">
                                                                    <div className="col-sm-5 col-md-12">
                                                                        <label><strong>Response </strong></label>
                                                                        <textarea className="form-control"
                                                                            value={opt.RESPONSE}
                                                                            readOnly
                                                                            type="text"
                                                                            rows="6"></textarea>
                                                                    </div>
                                                                </div> :
                                                                    <div className="col-sm-5 col-md-6">
                                                                        <label><strong>Response </strong></label>
                                                                        <textarea className="form-control"
                                                                            value={opt.RESPONSE}
                                                                            readOnly
                                                                            type="text"
                                                                            rows="6"></textarea>
                                                                    </div>}

                                                                <div className="col-sm-5 col-md-5">
                                                                    <div className="row mb-2">
                                                                        <div className="col-sm-6 col-md-5 mt-2">
                                                                            <label><strong>Planned Closure Date</strong></label>
                                                                        </div>
                                                                        <div className="col-sm-6 col-md-7">
                                                                            <input className="form-control mb-2" value={opt.CLOSE_DATE.split(" ", 1)}
                                                                                readOnly
                                                                                type="text"></input>
                                                                        </div>
                                                                    </div>
                                                                    <div className="row mb-2">
                                                                        <div className="col-sm-6 col-md-5 mt-2">
                                                                            <label><strong>Planned TAT</strong></label>
                                                                        </div>
                                                                        <div className="col-sm-6 col-md-7">
                                                                            <input className="form-control mb-2" value={opt.TAT}
                                                                                readOnly
                                                                                type="text"></input>
                                                                        </div>
                                                                    </div>
                                                                    {(opt.ACTUAL_CLOSE_DATE !== "undefined" && opt.ACTUAL_CLOSE_DATE !== null) &&
                                                                        <div>
                                                                            <div className="row mb-2">
                                                                                <div className="col-sm-6 col-md-5 mt-2">
                                                                                    <label><strong>Actual Closure Date</strong></label>
                                                                                </div>
                                                                                <div className="col-sm-6 col-md-7">
                                                                                    <input className="form-control mb-2" value={opt.ACTUAL_CLOSE_DATE}
                                                                                        readOnly
                                                                                        type="text"></input>
                                                                                </div>
                                                                            </div>
                                                                            <div className="row mb-2">
                                                                                <div className="col-sm-6 col-md-5 mt-2">
                                                                                    <label><strong>Actual TAT</strong></label>
                                                                                </div>
                                                                                <div className="col-sm-6 col-md-7">
                                                                                    <input className="form-control mb-2" value={opt.ACTUAL_TAT}
                                                                                        readOnly
                                                                                        type="text"></input>
                                                                                </div>
                                                                            </div>
                                                                        </div>}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        }
                        {this.state.flag === false &&
                            <div className="text-center">
                                <div className="spinner-border" role="status">
                                    <span className="sr-only">Loading...</span>
                                </div>
                            </div>}
                        {(this.props.updateRecord && this.props.updateRecord.length === 0 && this.state.flag === true && this.state.response === false) &&
                            <h6 className="text-center">{this.state.message}</h6>}
                        {this.state.buttons === false && this.props.user_details && this.props.user_details.role === "SME" &&
                            <div className="buttons-submit">
                                {this.state.ticketStatus !== "Closed" && this.props.updateRecord &&

                                    <button className="btn m-3 issue-btu" onClick={e => this.setState({ buttons: true })}>Action
                                    </button>
                                }
                            </div>
                        }

                        {(this.state.buttons === true && this.state.response === false) &&
                            <div className="buttons-submit">
                                <button className="btn m-3 issue-btu" onClick={e => this.setState({ response: true, btnval: "transfer" })}>Transfer</button>
                                <button className="btn m-3 issue-btu" onClick={e => this.setState({ response: true, btnval: "reply" })}>Reply</button>
                                <button className="btn m-3 issue-btu" onClick={e => this.setState({ response: true, btnval: "reply&close" })}>Reply & Close</button><br />
                            </div>
                        }
                        {/* For tech-user response to issue */}
                        {(this.props.user_details && this.props.user_details.role === "SME" && this.state.response === true && this.state.btnval !== "transfer") &&
                            <div >
                                <div className="row mt-4">
                                    <div className="col-sm-5 col-md-6">
                                        <div className="row">
                                            <div className="col-sm-12 col-md-12">
                                                <label><strong>Response </strong></label>
                                                <textarea className="form-control mb-2"
                                                    value={this.state.userResponse}
                                                    onChange={e => this.setState({ userResponse: e.target.value })}
                                                    type="text"
                                                    rows="6"></textarea>
                                            </div>
                                        </div>
                                        {this.state.btnval === "reply&close" &&
                                            <div className="row">
                                                <div className="col-sm-5 col-md-12">
                                                    <label><strong>Internal Comments</strong></label>
                                                    <textarea className="form-control mb-2"
                                                        value={this.state.internalComments}
                                                        onChange={e => this.setState({ internalComments: e.target.value })}
                                                        type="text"
                                                        rows="6"></textarea>
                                                </div>
                                            </div>}
                                    </div>
                                    <div className="col-sm-5 col-md-5">
                                        {(this.state.btnval === "reply" && (this.state.ticketStatus === "Open" || this.state.ticketStatus === "WIP")) ?
                                            <div>
                                                <div className="row mb-2">
                                                    <div className="col-sm-6 col-md-5">
                                                        <label className="pt-2"><strong>Planned Closure Date</strong></label>
                                                    </div>
                                                    <div className="col-sm-6 col-md-7">
                                                        <input
                                                            value={this.state.close_date.split(" ", 1)}
                                                            className="form-control"
                                                            readOnly></input>
                                                    </div>
                                                </div>
                                                <div className="row mb-2">
                                                    <div className="col-sm-6 col-md-5">
                                                        <label className="pt-2"><strong>Planned TAT</strong></label>
                                                    </div>
                                                    <div className="col-sm-6 col-md-7">
                                                        <input
                                                            value={this.state.close_tat}
                                                            readOnly
                                                            className="form-control"></input>
                                                    </div> </div>
                                            </div>
                                            : <div>
                                                {this.state.btnval === "reply" &&
                                                    <div>
                                                        <div className="row mb-2">
                                                            <div className="col-sm-6 col-md-5">
                                                                <label className="pt-2"><strong>Planned Closure Date</strong></label>
                                                            </div>
                                                            <div className="col-sm-6 col-md-7">
                                                                <TextField
                                                                    id="date"
                                                                    type="date"
                                                                    className="form-control date-field"
                                                                    value={this.state.date}
                                                                    onChange={e => this.handleDateChangeDate(e.target.value)}
                                                                    inputProps={{ min: new Date().toISOString().slice(0, 10) }}
                                                                    InputLabelProps={{
                                                                        shrink: true,
                                                                    }}
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="row mb-2">
                                                            <div className="col-sm-6 col-md-5">
                                                                <label className="pt-2"><strong>Planned TAT</strong></label>
                                                            </div>
                                                            <div className="col-sm-6 col-md-7">
                                                                <input
                                                                    value={this.state.tat}
                                                                    readOnly
                                                                    className="form-control"></input>
                                                            </div> </div>
                                                    </div>}
                                            </div>}
                                        {this.state.btnval === "reply&close" && this.state.ticketStatus !== "" &&
                                            <div>
                                                <div className="row mb-2">
                                                    <div className="col-sm-6 col-md-5">
                                                        <label className="pt-3"><strong>Planned Closure Date</strong></label>
                                                    </div>
                                                    <div className="col-sm-6 col-md-7">
                                                        <input
                                                            value={this.state.close_date.split(" ", 1)}
                                                            className="form-control"
                                                            readOnly></input>
                                                    </div>
                                                </div>
                                                <div className="row mb-2">
                                                    <div className="col-sm-6 col-md-5">
                                                        <label className="pt-3"><strong>Planned TAT</strong></label>
                                                    </div>
                                                    <div className="col-sm-6 col-md-7">
                                                        <input
                                                            value={this.state.close_tat}
                                                            readOnly
                                                            className="form-control"></input>
                                                    </div>
                                                </div>
                                                <div className="row mb-2">
                                                    <div className="col-sm-6 col-md-5">
                                                        <label className="pt-3"><strong>Actual Closure Date</strong></label>
                                                    </div>
                                                    <div className="col-sm-6 col-md-7">
                                                        <TextField
                                                            id="date-actual-close"
                                                            type="date"
                                                            className="form-control date-field"
                                                            value={this.state.newdate}
                                                            onChange={e => this.handleChangeTATDate(e.target.value, this.state.btnval, this.state.resDate, this.state.ticketStatus)}
                                                            inputProps={{ min: new Date().toISOString().slice(0, 10) }}
                                                            InputLabelProps={{
                                                                shrink: true,
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="row mb-2">
                                                    <div className="col-sm-6 col-md-5">
                                                        <label className="pt-3"><strong>Actual TAT</strong></label>
                                                    </div>
                                                    <div className="col-sm-6 col-md-7">
                                                        <input
                                                            value={this.state.newtat}
                                                            readOnly
                                                            className="form-control"></input>
                                                    </div>
                                                </div>
                                                <div className="row mb-2">
                                                    <div className="col-sm-6 col-md-5">
                                                        <label className="pt-3"><strong>Issue Tagging</strong></label>
                                                    </div>
                                                    <div className="col-sm-6 col-md-7">
                                                        <select
                                                            value={this.state.issueTagging}
                                                            onChange={e => this.setState({ issueTagging: e.target.value })}
                                                            className="form-control">
                                                            <option value="" disabled>Choose From Dropdown</option>
                                                            <option>Actual Issue</option>
                                                            <option>Non Proper Usage</option>
                                                        </select>
                                                    </div>
                                                </div>
                                            </div>}
                                        {this.state.btnval === "reply&close" && this.state.ticketStatus === "" &&
                                            <div>
                                                <div className="row mb-2">
                                                    <div className="col-sm-6 col-md-5">
                                                        <label className="pt-3"><strong>Planned Closure Date</strong></label>
                                                    </div>
                                                    <div className="col-sm-6 col-md-7">
                                                        <TextField
                                                            id="date-close"
                                                            type="date"
                                                            className="form-control date-field"
                                                            value={this.state.date}
                                                            onChange={e => this.handleDateChangeDate(e.target.value)}
                                                            inputProps={{ min: new Date().toISOString().slice(0, 10) }}
                                                            InputLabelProps={{
                                                                shrink: true,
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="row mb-2">
                                                    <div className="col-sm-6 col-md-5">
                                                        <label className="pt-3"><strong>Planned TAT</strong></label>
                                                    </div>
                                                    <div className="col-sm-6 col-md-7">
                                                        <input
                                                            value={this.state.tat}
                                                            readOnly
                                                            className="form-control"></input>
                                                    </div>
                                                </div>
                                                <div className="row mb-2">
                                                    <div className="col-sm-6 col-md-5">
                                                        <label className="pt-3"><strong>Actual Closure Date</strong></label>
                                                    </div>
                                                    <div className="col-sm-6 col-md-7">
                                                        <TextField
                                                            id="date-actual-close"
                                                            type="date"
                                                            className="form-control date-field"
                                                            value={this.state.newdate}
                                                            onChange={e => this.handleChangeTATDate(e.target.value, this.state.btnval, new Date(), this.state.ticketStatus)}
                                                            inputProps={{ min: new Date().toISOString().slice(0, 10) }}
                                                            InputLabelProps={{
                                                                shrink: true,
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="row mb-2">
                                                    <div className="col-sm-6 col-md-5">
                                                        <label className="pt-3"><strong>Actual TAT</strong></label>
                                                    </div>
                                                    <div className="col-sm-6 col-md-7">
                                                        <input
                                                            value={this.state.newtat}
                                                            readOnly
                                                            className="form-control"></input>
                                                    </div>
                                                </div>
                                                <div className="row mb-2">
                                                    <div className="col-sm-6 col-md-5">
                                                        <label className="pt-3"><strong>Issue Tagging</strong></label>
                                                    </div>
                                                    <div className="col-sm-6 col-md-7">
                                                        <select
                                                            value={this.state.issueTagging}
                                                            onChange={e => this.setState({ issueTagging: e.target.value })}
                                                            className="form-control">
                                                            <option value="" disabled>Choose From Dropdown</option>
                                                            <option>Actual Issue</option>
                                                            <option>Non Proper Usage</option>
                                                        </select>
                                                    </div>
                                                </div>
                                            </div>}
                                    </div>
                                </div>
                            </div>}
                        {/* For transfer the ticket */}
                        {this.state.btnval === "transfer" && this.state.response === true &&
                            <div className="row">
                                <div className="col-sm-12 col-md-6 mt-2">
                                    <label><strong>Transfer to</strong></label>
                                    <select
                                        type="email"
                                        className="form-control"
                                        value={this.state.transferTo}
                                        onChange={e => this.handlePerson(e)}>
                                        <option value="" disabled>Choose From Dropdown</option>
                                        {this.state.userList && this.state.userList.map((opt) => {
                                            return (
                                                <option>{opt.EMP_EMAIL}</option>
                                            )
                                        })}
                                        <option>Others</option>
                                    </select>
                                </div>
                                {this.state.person === true &&
                                    <div className="col-sm-12 col-md-6 mt-2">
                                        <label><strong>Transfer to</strong></label>
                                        <input
                                            type="email"
                                            className="form-control"
                                            value={this.state.otherPerson}
                                            onChange={e => this.setState({ otherPerson: e.target.value })}></input>
                                    </div>}
                                <div className="col-sm-12 col-md-12 mt-2">
                                    <label><strong>Justification</strong></label>
                                    <textarea
                                        className="form-control"
                                        rows="4"
                                        value={this.state.justification}
                                        onChange={e => this.setState({ justification: e.target.value })}></textarea>
                                </div>
                            </div>}
                    </Modal.Body>
                    {(this.state.response === true && this.state.btnval === "reply") &&
                        <Modal.Footer>
                            <button type="button" className="btn " style={{ backgroundColor: '#0c5bac', color: '#fff' }} onClick={e => this.handleSend("WIP", "reply")}>Reply</button>
                            <button className="btn m-3 issue-btu" onClick={e => this.setState({ response: false, buttons: false, userResponse: '', date: "", tat: '' })}>Exit</button>
                            {this.state.spinnerFlag === true && <div className="spinnerClass text-center">
                                <CircularProgress />
                            </div>}
                        </Modal.Footer>}
                    {(this.state.response === true && this.state.btnval === "reply&close") &&
                        <Modal.Footer>
                            <button type="button" className="btn " style={{ backgroundColor: '#0c5bac', color: '#fff' }} onClick={e => this.handleSend("Closed", "reply&close")}>Reply & Close</button>
                            <button className="btn m-3 issue-btu" onClick={e => this.setState({ response: false, buttons: false, internalComments: '', issueTagging: '', preventionplan: "", newdate: '', newtat: "", userResponse: '' })}>Exit</button>
                            {this.state.spinnerFlag === true && <div className="spinnerClass text-center">
                                <CircularProgress />
                            </div>}
                        </Modal.Footer>}
                    {(this.state.response === true && this.state.btnval === "transfer") &&
                        <Modal.Footer>
                            <button type="button" className="btn " style={{ backgroundColor: '#0c5bac', color: '#fff' }} onClick={e => this.handleTransfer("transfer")}>Transfer</button>
                            <button className="btn m-3 issue-btu" onClick={e => this.setState({ response: false, buttons: false, transferTo: '', otherPerson: "", justification: "" })}>Exit</button>
                            {this.state.spinnerFlag === true && <div className="spinnerClass text-center">
                                <CircularProgress />
                            </div>}
                        </Modal.Footer>}
                </Modal>
                <Snackbar
                    anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                    open={this.state.err}
                    className='snacking'
                    message={this.state.error}
                />
            </div>

        );
    }
}

const mapStateToProps = state => ({
    allIssues: state.page.allIssues,
    updateResult: state.page.updateResult,
    user_details: state.user.user_details,
    updateRecord: state.page.updateRecord,
    transferTicket: state.page.transferTicket,
    allUsers: state.page.allUsers,
});

const mapDispatchToProps = dispatch => ({
    actions: bindActionCreators({ getAllIssues, updateIssue, getUpdatedRecord, trasferTicket, getAllUsers, replyMail }, dispatch)
});

export default connect(mapStateToProps, mapDispatchToProps)(Allincidents);