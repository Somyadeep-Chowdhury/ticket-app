import React, { Component } from 'react';
import MUIDataTable from "mui-datatables";
import '../styles/Issue.css';
import { Modal } from 'react-bootstrap';
import Color from '../components/Color.js';
import { getAllIssues, updateIssue, getUpdatedRecord, getAllIssueTypes, editTicket, withdrawTicket, replyMail, mailToUser, mailToSME, getAllUsers, withdrawTicketMail } from '../actions/index';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { CircularProgress, Snackbar } from '@material-ui/core';
import WorkingDays from './WorkingDays';
import Tat from './Tat';
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
class Issue extends Component {
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
        reply: false,
        view_response: false,
        issueList: [],
        name: "",
        createdDate: '',
        clientComments: '',
        description: '',
        practitioner: '',
        impact: '',
        recordId: "",
        radio: "",
        issuetype: '',
        ccomments: false,
        homeloc: '',
        Pin: '',
        ibmComments: '',
        location: "",
        building: '',
        floor: "",
        desk: '',
        starttime: '',
        endtime: "",
        accountreporting: '',
        category: "",
        worktype: '',
        tat: '',
        impacts: ['Financial', 'Non Financial'],
        spinnerFlag: false,
        mainspinnerFlag: false,
        flag: false,
        message: '',
        openIssues: [],
        responseflag: true,
        planned_close_date: "",
        userResponse: '',
        ticketStatus: '',
        ticketType: '',
        btnval: "",
        types: [],
        sections: [],
        section: '',
        types_of_ticket: '',
        title: "My Tickets Log"
    }
    UNSAFE_componentWillMount() {
        this.props.actions.getAllIssues({ "email": this.props.user_details.userEmail, "role": this.props.user_details.role, data: "mylog" });
        this.setState({ mainspinnerFlag: true })
        this.props.actions.getAllIssueTypes()
    }
    componentDidUpdate(prevProps) {
        if (prevProps.allIssues !== this.props.allIssues) {
            if (this.props.allIssues) {
                // this.props.allIssues.sort(this.sortBy("CREATED_DATE"));
                var today = new Date()
                var wipCount = 0, closedCount = 0, openCount = 0;
                this.props.allIssues.sort(function (a, b) {
                    var adt = new Date((b.CREATED_DATE).substring(6, 10) + "-" + (b.CREATED_DATE).substring(3, 6) + (b.CREATED_DATE).substring(0, 2) + " " + (b.CREATED_DATE).substring(11, 17))
                    var bdt = new Date((a.CREATED_DATE).substring(6, 10) + "-" + (a.CREATED_DATE).substring(3, 6) + (a.CREATED_DATE).substring(0, 2) + " " + (a.CREATED_DATE).substring(11, 17))
                    return adt - bdt;
                });
                this.props.allIssues && this.props.allIssues.forEach((opt) => {
                    if (opt.TAT) {
                        // var ddt = (opt.CLOSE_DATE).substring(3, 6) + (opt.CLOSE_DATE).substring(0, 3) + (opt.CLOSE_DATE).substring(6)
                        var ddt = (opt.CLOSE_DATE).substring(6, 10) + "-" + (opt.CLOSE_DATE).substring(3, 6) + (opt.CLOSE_DATE).substring(0, 2)
                        var cdt = new Date(ddt)
                        if (opt.STATUS === "Closed") {
                            closedCount = closedCount + 1;
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
                                //tatdate = tatdate
                            }
                            Object.assign(opt, { "TAT": tatdate })
                        }
                    }
                })
                this.setState({ issueList: this.props.allIssues, responseflag: true, mainspinnerFlag: false, wipCount: wipCount, openCount: openCount, closedCount: closedCount })
            }
            else {
                this.setState({ issueList: [], responseflag: true, mainspinnerFlag: false })
            }
        }
        if (prevProps.updateRecord !== this.props.updateRecord) {
            if (this.props.updateRecord.length !== 0) {
                for (var i = 0; i < this.props.updateRecord.length; i++) {
                    this.setState({ ticketStatus: this.props.updateRecord[0].STATUS })
                }
                this.setState({ flag: true, openIssues: this.props.updateRecord })
            }
            else if (this.props.updateRecord.length === 0) {
                this.setState({ flag: true, message: "No Response" })
            }
        }
        if (prevProps.issueTypes !== this.props.issueTypes) {
            // if (this.props.user_details.role === "Super Admin") {
            if (this.props.issueTypes && this.props.issueTypes.length !== 0) {
                this.setState({ types: this.props.issueTypes })
            }
            // } 
            // else if (this.props.user_details.role === "Super User") {
            //     if (this.props.issueTypes && this.props.issueTypes.length !== 0) {
            //         let usercategory = this.props.user_details.details[0]['ISSUE_TYPE'];
            //         let finalCategory = this.props.issueTypes.filter(x => usercategory.includes(x.name))
            //         this.setState({ types: finalCategory })
            //     }
            // }
        }

    }
    // sortBy(prop) {
    //     return function (a, b) {
    //         console.log(a[prop], b[prop], "datesss")
    //         if (a[prop] < b[prop]) {
    //             return 1;
    //         } else if (a[prop] > b[prop]) {
    //             return -1;
    //         }
    //         return 0;
    //     }
    // }
    handleClose = () => {
        this.setState({ show: false, reply: false, buttons: false, openIssues: [], userResponse: "" })
        this.handleReset()
    }
    handleReply = () => {
        var today = new Date();
        if (this.state.userResponse === "") {
            this.setState({ error: "Please Reply", err: true, iconColor: "text-danger" });
        }
        else {
            var obj = {};
            Object.assign(obj, {
                current_date: today,
                ownership: this.props.user_details.userEmail,
                recordId: this.state.recordId,
                status: "Open",
                userResponse: this.state.userResponse.replace(/[,+()'"*<>{}]/g, ' '),
                "email": this.props.user_details.userEmail, role: this.props.user_details.role,
                planned_close_date: this.state.planned_close_date,
                tat: this.state.planned_tat,
                update: "user",
                stagename: this.props.user_details.details[0]['STAGE_NAME'] !== null ? this.props.user_details.details[0]['STAGE_NAME'] : "",
                owner: this.state.owner,
                createdDate: this.state.createdDate,
                sharedInfo: this.state.sharedInfo,
                name: this.state.name,
                issuetype: this.state.issuetype,
                worktype: this.state.worktype,
                severity: this.state.severity,
                section: this.state.section,
                practitioner: this.state.practitioner,
                data: "mylog",
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
            }, 5000)
        }
    }
    error = () => {
        setTimeout(() => {
            this.setState({ err: false, error: '' })
        }, 3500);
    }
    Reset = () => {
        setTimeout(() => {
            this.handleReset()
        }, 1000)
    }
    handleReset = () => {
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
            reply: false,
            view_response: false,
            //issueList: [],
            name: "",
            createdDate: '',
            clientComments: '',
            description: '',
            practitioner: '',
            impact: '',
            recordId: "",
            radio: "",
            issuetype: '',
            ccomments: false,
            homeloc: '',
            Pin: '',
            ibmComments: '',
            location: "",
            building: '',
            floor: "",
            desk: '',
            starttime: '',
            endtime: "",
            accountreporting: '',
            category: "",
            worktype: '',
            tat: '',
            impacts: ['Financial', 'Non Financial'],
            spinnerFlag: false,
            mainspinnerFlag: false,
            flag: false,
            message: '',
            openIssues: [],
            responseflag: true,
            planned_close_date: "",
            userResponse: '',
            ticketStatus: '',
            ticketType: "",
            btnval: "",
            // types: '',
            sections: [],
            types_of_ticket: '',
            section: '',
        })
    }
    handleChangeType = (e) => {
        var section;
        this.state.types && this.state.types.forEach(function (opt) {
            if (opt.name === e.target.value) {
                section = opt.section;
            }
        })
        this.setState({ issuetype: e.target.value, sections: section, accountreporting: "", section: '', ticketType: '' })

    }
    handleEdit = () => {
        var issueTyp = this.state.issuetype
        var ss = this.state.section
        var ttype;
        var section;
        this.state.types && this.state.types.forEach(function (opt) {
            if (opt.name === issueTyp) {
                section = opt.section;
                opt.ticketType && opt.ticketType.forEach((type) => {
                    if (type.section === ss) {
                        ttype = type.type
                    }
                })
            }
        })
        this.setState({ btnval: "Edit", issuetype: issueTyp, sections: section, types_of_ticket: ttype })
    }
    handleSubmit = () => {
        this.setState({ spinnerFlag: true })
        this.props.actions.editTicket(this.incidentObj());
        setTimeout(() => {
            if (this.props.editResponse && this.props.editResponse.status === 200 && this.props.editResponse.data.message === "Edited") {
                this.setState({ error: "Ticket Updated", err: true, iconColor: "text-success", spinnerFlag: false, issueval: "Success" });
                this.error();
                this.props.actions.mailToUser(this.incidentObj())
                this.props.actions.mailToSME(this.incidentObj())
                this.Reset();
            }
            else {
                this.setState({ show: false, err: true, error: "Something Went wrong", iconColor: "text-danger", spinnerFlag: false })
                this.error();
            }
        }, 5000)
    }
    incidentObj = () => {
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
        var min = dt.getMinutes()
        if (min <= 9) {
            min = '0' + min;
        }
        var type;
        if (this.state.name !== this.state.practitioner) {
            type = "Others"
        }
        else {
            type = "Self"
        }
        var data = this.state;
        delete data.err
        delete data.error
        var incidentObj = {};
        return Object.assign(incidentObj, {
            type: type,
            issuetype: this.state.issuetype,
            name: this.state.name,
            practitioner: this.state.practitioner,
            category: this.state.category,
            description: this.state.description.replace(/[,+()'"*<>{}]/g, ' '),
            severity: this.state.severity,
            createdDate: date + "-" + month + "-" + dt.getFullYear() + " " + hour + ":" + min,
            // editDate: date + "-" + month + "-" + dt.getFullYear() + " " + hour + ":" + min + ":" + sec,
            recordId: this.state.recordId,
            section: this.state.section,
            sharedInfo: this.state.sharedInfo,
            createFor: this.state.createFor,
            ticketType: this.state.ticketType,
            "email": this.props.user_details.userEmail,
            role: this.props.user_details.role,
            key: "Update",
            loggedinUser: this.props.user_details.username,
            loggedinEmail: this.props.user_details.userEmail,
        })
    }
    handleWithdraw = (recordId) => {
        this.props.actions.withdrawTicket({ "recordId": recordId, "email": this.props.user_details.userEmail, role: this.props.user_details.role, loggedinUser: this.props.user_details.username })
        this.setState({ spinnerFlag: true })
        setTimeout(() => {
            if (this.props.withdrawResponse && this.props.withdrawResponse.status === 200 && this.props.withdrawResponse.data.message === "Withdraw") {
                this.setState({ error: "Ticket Withdrawn Successfully", err: true, iconColor: "text-success", spinnerFlag: false, });
                this.error();
                this.Reset();
                this.props.actions.withdrawTicketMail(this.incidentObj())
            }
            else {
                this.setState({ show: false, err: true, error: "Something Went wrong", iconColor: "text-danger", spinnerFlag: false })
                this.error();
            }
        }, 5000)
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
        this.setState({ section: e, types_of_ticket: ttype, ticketType: "" })
    }
    render() {
        // console.log(this.state)
        // console.log(this.props)
        const options = {
            responsive: 'scrollMaxHeight',
            selectableRows: false,
            onRowClick: (_, { dataIndex }) => {
                var selected_data = this.state.issueList[dataIndex]
                this.props.actions.getUpdatedRecord({ "ticket": selected_data.TICKET_NO })
                this.setState({
                    show: true,
                    flag: false,
                    name: selected_data.NAME,
                    practitioner: selected_data.PRACTIONER,
                    issuetype: selected_data.ISSUE_TYPE,
                    createdDate: selected_data.CREATED_DATE,
                    description: selected_data.DESCRIPTION,
                    recordId: selected_data.TICKET_NO,
                    severity: selected_data.SEVERITY,
                    category: selected_data.CATEGORY,
                    section: selected_data.SECTION,
                    planned_close_date: selected_data.CLOSE_DATE,
                    planned_tat: selected_data.TAT,
                    sharedInfo: selected_data.SHARED_TICKET,
                    ticketType: selected_data.TICKET_TYPE,
                    owner: selected_data.OWNER,
                    createFor: selected_data.CREATED_FOR,
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
                <div className="row rowClass">
                    <div className="col-sm-2 col-md-2 colText">Total Records : {this.state.issueList && this.state.issueList.length > 0 ? this.state.issueList.length : 0}</div>
                    <div className=" col-sm-2 col-md-2 text-new colText">New :
                    {this.state.issueList && this.state.issueList.length > 0 ? parseInt(this.state.issueList.length) - (parseInt(this.state.openCount) + parseInt(this.state.wipCount) + parseInt(this.state.closedCount)) : 0}
                    </div>
                    <div className=" col-sm-2 col-md-2 text-open colText">Open : {this.state.issueList && this.state.issueList.length > 0 ? this.state.openCount : 0}
                    </div>
                    <div className=" col-sm-2 col-md-2 text-wip colText">WIP : {this.state.issueList && this.state.issueList.length > 0 ? this.state.wipCount : 0}
                    </div>
                    <div className=" col-sm-2 col-md-2 text-closed colText">Closed : {this.state.issueList && this.state.issueList.length > 0 ? this.state.closedCount : 0}
                    </div>
                </div>

                { this.state.mainspinnerFlag === false && this.state.responseflag === true ?
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
                        <Modal.Title className="modal-title"><span>Created Date & Time : {this.state.createdDate}</span><span className="modal-secondtit">Ticket No : {this.state.recordId}</span></Modal.Title>

                    </Modal.Header>
                    <Modal.Body className='modal_body'>
                        {this.state.btnval !== "Edit" ?
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
                                        {this.state.sharedInfo !== undefined &&
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
                                                </div>
                                                :
                                                <div className="col-sm-6 col-md-3 pb-2 pt-2">
                                                    <label><strong>Impact Category</strong></label>
                                                </div>}
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
                            :
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
                                                    onChange={e => this.setState({ name: e.target.value })}
                                                    type="text"></input>
                                            </div>
                                        </div>
                                        {(this.state.name !== this.state.practitioner) &&
                                            <div className="row">
                                                <div className="col-sm-6 col-md-3 pb-2 pt-2">
                                                    <label><strong>Issue Raised For</strong></label></div>
                                                <div className="col-sm-6 col-md-8">
                                                    <input
                                                        readOnly
                                                        className="form-control"
                                                        value={this.state.practitioner}
                                                        onChange={e => this.setState({ practitioner: e.target.value })}
                                                        type="text"></input>
                                                </div>
                                            </div>}
                                        {this.state.sharedInfo !== undefined &&
                                            <div className="row">
                                                <div className="col-sm-6 col-md-3 pb-2 pt-2">
                                                    <label><strong>Share Ticket Info</strong></label>
                                                </div>
                                                <div className="col-sm-6 col-md-8">
                                                    <input
                                                        className="form-control"
                                                        value={this.state.sharedInfo}
                                                        onChange={e => this.setState({ sharedInfo: e.target.value })}
                                                    >
                                                    </input>
                                                </div>
                                            </div>}
                                        <div className="row">
                                            {this.state.name !== this.state.practitioner ?
                                                <div className="col-sm-6 col-md-3 pb-2 pt-2">
                                                    <label><strong>Priority Category</strong></label>
                                                </div>
                                                :
                                                <div className="col-sm-6 col-md-3 pb-2 pt-2">
                                                    <label><strong>Impact Category</strong></label>
                                                </div>}
                                            <div className="col-sm-6 col-md-8">
                                                <select
                                                    className="form-control"
                                                    value={this.state.severity}
                                                    onChange={e => this.setState({ severity: e.target.value })}>
                                                    <option></option>
                                                    <option>High {"(greater than 21 Employees)"} </option>
                                                    <option>Medium {"(greater than 6 - less than 20 Employees)"}</option>
                                                    <option>Low {"(less than 5 Employees)"}</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-sm-6 col-md-6">
                                        <div className="row">
                                            <div className="col-sm-6 col-md-3">
                                                <label className="pt-2 pl-3"><strong>Category</strong></label>
                                            </div>
                                            <div className="col-sm-6 col-md-8">
                                                <select className="form-control mb-2" value={this.state.issuetype}
                                                    onChange={e => this.handleChangeType(e)}>
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
                                            <div>
                                                <div className="row">
                                                    <div className="col-sm-6 col-md-3">
                                                        <label className="pt-2 pl-3"><strong>Portals & Dashboard</strong></label>
                                                    </div>
                                                    <div className="col-sm-6 col-md-8">
                                                        <select className="form-control mb-2" value={this.state.section}
                                                            onChange={e => this.handleSubcategory(e.target.value)}
                                                        >
                                                            <option value="" disabled>Choose from dropdown</option>
                                                            {this.state.sections && this.state.sections.map((opt, index) => {
                                                                return (
                                                                    <option key={index}>{opt}</option>
                                                                )
                                                            })}
                                                        </select>
                                                    </div>
                                                </div>
                                                <div className="row">
                                                    <div className="col-sm-6 col-md-3">
                                                        <label className="pt-2 pl-3"><strong>Ticket Type</strong></label>
                                                    </div>
                                                    <div className="col-sm-6 col-md-8">
                                                        <select className="form-control mb-2" value={this.state.ticketType}
                                                            onChange={e => this.setState({ ticketType: e.target.value })}>
                                                            <option value="" disabled>Choose from dropdown</option>
                                                            {this.state.types_of_ticket && this.state.types_of_ticket.map((opt, index) => {
                                                                return (
                                                                    <option key={index}>{opt}</option>
                                                                )
                                                            })}
                                                        </select>
                                                    </div>
                                                </div>
                                            </div>}
                                    </div>
                                </div>
                                <div className="row mt-2">
                                    <div className="col-sm-12 col-md-12">
                                        <label><strong>Description</strong></label>
                                        <textarea
                                            className="form-control"
                                            value={this.state.description}
                                            onChange={e => this.setState({ description: e.target.value })}
                                            type="text"
                                            rows="6"></textarea>
                                    </div></div>
                            </div>}
                        {(this.props.updateRecord.length === 0 && this.state.flag === true && this.state.btnval === "") &&
                            <div className="buttons-submit">
                                <button type="button" className="btn m-3 issue-btu" style={{ backgroundColor: '#0c5bac', color: '#fff' }}
                                    onClick={e => this.handleEdit()}
                                >Edit</button>
                                <button type="button" className="btn m-3 issue-btu" style={{ backgroundColor: '#0c5bac', color: '#fff' }}
                                    onClick={e => this.handleWithdraw(this.state.recordId)}
                                >Delete</button>
                                {this.state.spinnerFlag === true &&
                                    <div className="spinner-border" role="status">
                                        <span className="sr-only">Loading...</span>
                                    </div>}
                            </div>
                        }

                        {(this.state.btnval !== "Edit") && <h6 className="text-center m-3">TICKET TRAIL</h6>}
                        {/* Displaying accordions when issue is open */}
                        {(this.state.openIssues && this.state.openIssues.length !== 0 && this.state.flag === true) &&
                            <div>
                                <div className="row rowheader">
                                    <div className="col-sm col-md tableheader text-center">Responded Date & Time</div>
                                    <div className="col-sm col-md tableheader text-center">Stage Name</div>
                                    <div className="col-sm col-md tableheader text-center">Status</div>
                                </div>
                                <div id="accordion">
                                    {this.state.openIssues.length !== 0 && this.state.openIssues.map((opt, index) => {
                                        var collapasehref = "#collapse-" + index;
                                        var collapaseid = "collapse-" + index;
                                        return (
                                            <div className="card issue-accordion">
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
                                                                    {this.state.accountreporting === "Incident" ?
                                                                        <div className="col-sm-5 col-md-12">
                                                                            <div className="row mb-2">
                                                                                <div className="col-sm-6 col-md-5">
                                                                                    <label><strong> IBM Comments/Action </strong></label>
                                                                                </div>
                                                                                <div className="col-sm-6 col-md-7">
                                                                                    <textarea className="form-control mb-2"
                                                                                        value={opt.ACTION}
                                                                                        readOnly
                                                                                        type="text"
                                                                                        rows="4"></textarea>
                                                                                </div>
                                                                            </div>
                                                                            <div className="row mb-2">
                                                                                <div className="col-sm-6 col-md-5">
                                                                                    <label><strong>IBM Comments/PreventionPlan</strong></label>
                                                                                </div>
                                                                                <div className="col-sm-4 col-md-7">
                                                                                    <textarea className="form-control mb-2" value={opt.PLAN}
                                                                                        type="text"
                                                                                        readOnly
                                                                                        rows="4"></textarea>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                        :
                                                                        <div className="col-sm-5 col-md-12">
                                                                            <label><strong>Response </strong></label>
                                                                            <textarea className="form-control"
                                                                                value={opt.RESPONSE}
                                                                                readOnly
                                                                                type="text"
                                                                                rows="6"></textarea>
                                                                        </div>}</div> :
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
                                                                            <label ><strong>Planned Closure Date</strong></label>
                                                                        </div>
                                                                        <div className="col-sm-6 col-md-7">
                                                                            <input className="form-control mb-2" value={opt.CLOSE_DATE.split(" ", 1)}
                                                                                readOnly
                                                                                type="text"></input>
                                                                        </div>
                                                                    </div>
                                                                    {(opt.ACTUAL_CLOSE_DATE !== "undefined" && opt.ACTUAL_CLOSE_DATE !== null) &&
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
                                                                    }
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                                {this.state.reply === false && this.state.ticketStatus !== "Closed" &&
                                    <div className="buttons-submit">
                                        <button className="btn issue-btu m-3" onClick={e => this.setState({ reply: true })}>Reply</button>
                                        <button className="btn issue-btu m-3" onClick={e => this.handleWithdraw(this.state.recordId)}>Withdraw&nbsp;
                                        {this.state.spinnerFlag === true &&
                                                <div className="spinner-border" role="status">
                                                    <span className="sr-only">Loading...</span>
                                                </div>}
                                        </button>
                                    </div>}
                                {this.state.reply === true &&
                                    <div className="row">
                                        <div className="col-sm-12 col-md-12 mt-2">
                                            <label><strong>Reply</strong></label>
                                            <textarea
                                                className="form-control"
                                                value={this.state.userResponse}
                                                rows="4"
                                                onChange={e => this.setState({ userResponse: e.target.value })}></textarea>
                                        </div></div>}
                            </div>
                        }
                        {this.state.flag === false &&
                            <div className="text-center">
                                <div className="spinner-border" role="status">
                                    <span className="sr-only">Loading...</span>
                                </div>
                            </div>}
                        {(this.props.updateRecord.length === 0 && this.state.flag === true && this.state.btnval !== "Edit") &&
                            <h6 className="text-center">{this.state.message}</h6>}
                    </Modal.Body>
                    {
                        this.state.reply === true &&
                        <Modal.Footer>
                            <button type="button" className="btn" style={{ backgroundColor: '#0c5bac', color: '#fff' }} onClick={e => this.handleReply()}>Reply</button>
                            {this.state.spinnerFlag === true && <div className="spinnerClass text-center">
                                <CircularProgress />
                            </div>}
                        </Modal.Footer>
                    }
                    {this.state.btnval === "Edit" &&
                        <Modal.Footer>
                            {/* <div className="buttons-submit"> */}
                            <button type="button" className="btn m-3 issue-btu" style={{ backgroundColor: '#0c5bac', color: '#fff' }} onClick={e => this.handleSubmit()}>Submit
                                {this.state.spinnerFlag === true &&
                                    <div className="spinner-border" role="status">
                                        <span className="sr-only">Loading...</span>
                                    </div>}
                            </button>
                            <button type="button" className="btn m-3 issue-btu" style={{ backgroundColor: '#0c5bac', color: '#fff' }} onClick={e => this.setState({ btnval: "" })}>Back</button>
                            {/* </div> */}
                        </Modal.Footer>
                    }
                </Modal>
                <Snackbar
                    anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                    open={this.state.err}
                    className='snacking'
                    message={this.state.error}
                />
            </div >

        );
    }
}

const mapStateToProps = state => ({
    allIssues: state.page.allIssues,
    updateResult: state.page.updateResult,
    user_details: state.user.user_details,
    updateRecord: state.page.updateRecord,
    issueTypes: state.page.issueTypes,
    editResponse: state.page.editResponse,
    withdrawResponse: state.page.withdrawResponse,
    allUsers: state.page.allUsers,
});

const mapDispatchToProps = dispatch => ({
    actions: bindActionCreators({ getAllIssues, updateIssue, getUpdatedRecord, getAllIssueTypes, editTicket, withdrawTicket, replyMail, mailToUser, mailToSME, getAllUsers, withdrawTicketMail }, dispatch)
});

export default connect(mapStateToProps, mapDispatchToProps)(Issue);