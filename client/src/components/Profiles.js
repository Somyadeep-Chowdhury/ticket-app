import React, { Component } from 'react';
import MUIDataTable from "mui-datatables";
import '../styles/Issue.css';
import IconButton from "@material-ui/core/IconButton";
import Tooltip from "@material-ui/core/Tooltip";
import AddIcon from "@material-ui/icons/Add";
import { Modal } from 'react-bootstrap';
import { getAllUsers, addUser, deleteUser, getAllIssueTypes, updateUser } from '../actions/index';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { MenuItem, Select, Checkbox, ListItemText, Input, Snackbar } from '@material-ui/core';
import axios from 'axios';

// const serverUrl = 'http://localhost:8181'
const serverUrl = ''
const roles = ["Super Admin", "Admin", "Backend Support", "SME", "User", "Super User"]
const geo = ["America", "China", "Europe", "India", "Philippines", "All"]
const columns = [
    // {
    //     name: "EMP_ID",
    //     label: "Employee ID",
    //     options: {
    //         filter: true,
    //         sort: true,
    //     }
    // },
    {
        name: "EMP_NAME",
        label: "Name",
        options: {
            filter: true,
            sort: true,
        }
    },
    {
        name: "STAGE_NAME",
        label: "Stage Name",
        options: {
            filter: true,
            sort: true,
        }
    },
    {
        name: "EMP_EMAIL",
        label: "Email-Id",
        options: {
            filter: true,
            sort: true,
        }
    },
    {
        name: "ROLE",
        label: "Role",
        options: {
            filter: true,
            sort: true,
        }
    },
    {
        name: "ISSUE_TYPE",
        label: "Category",
        options: {
            filter: true,
            sort: true,
        }
    },
    {
        name: "ISSUE_CATEGORY",
        label: "Portals & Dashboard",
        options: {
            filter: true,
            sort: true,
        }
    },
    // {
    //     name: "GEOGRAPHY",
    //     label: "Geography",
    //     options: {
    //         filter: true,
    //         sort: true,
    //     }
    // }
]
class Access extends Component {
    state = {
        show: false,
        username: '',
        userEmail: '',
        UID: '',
        role: '',
        empId: "",
        error: '',
        err: false,
        spinnerFlag: false,
        stagename: '',
        categoryType: [],
        issueType: [],
        sections: [],
        flag: false,
        array: [],
        update: "",
        types: [],
        geography: "",
        issueTypes: []
    }
    UNSAFE_componentWillMount() {
        this.props.actions.getAllUsers()
        this.props.actions.getAllIssueTypes()
    }
    componentDidUpdate(prevProps) {
        if (prevProps.issueTypes !== this.props.issueTypes) {
            var type = []
            if (this.props.user_details.role === "Super Admin" && this.props.issueTypes && this.props.issueTypes.length !== 0) {

                this.props.issueTypes.forEach((opt) => {
                    type.push(opt.name)
                })
                this.setState({ types: type })

            } else if (this.props.user_details.role === "Super User" && this.props.issueTypes && this.props.issueTypes.length !== 0) {

                type = this.props.issueTypes.filter(x => this.props.user_details.details[0]['ISSUE_TYPE'].includes(x.name)).map(y => y.name)
                this.setState({ types: type })

            }
        }
    }
    handleAdduser = () => {
        this.setState({ show: true })
    }
    error = () => {
        setTimeout(() => {
            this.setState({ err: false, error: '' })
        }, 3500);
    }
    handleAdd = () => {
        if (this.state.userEmail === "" || this.state.role === "") {
            this.setState({ error: "All Fields Are Mandatory", err: true, iconColor: "text-danger" });
            this.error()
        }
        else if (!this.state.userEmail.includes("@")) {
            this.setState({ error: "Mail Should Include @", err: true, iconColor: "text-danger" });
            this.error()
        } else if (!this.state.userEmail.includes(".ibm.com")) {
            this.setState({ error: "Mail Should Include .ibm.com", err: true, iconColor: "text-danger" });
            this.error()
        }
        else if (this.state.role === "SME") {
            if (this.state.stagename === "") {
                this.setState({ error: "Stage name sholud not be empty", err: true, iconColor: "text-danger" });
                this.error()
            }
            else if (this.state.issueType.length === 0) {
                this.setState({ error: "Please Choose Category", err: true, iconColor: "text-danger" });
                this.error()
            }
            else if (this.state.categoryType.length === 0) {
                this.setState({ error: "Please Choose Sub-Category", err: true, iconColor: "text-danger" });
                this.error()
            }
            else {
                this.check()
            }
        }
        else if (this.state.role === "Super User") {
            if (this.state.stagename === "") {
                this.setState({ error: "Stage name sholud not be empty", err: true, iconColor: "text-danger" });
                this.error()
            }
            else if (this.state.issueType.length === 0) {
                this.setState({ error: "Please Choose Category", err: true, iconColor: "text-danger" });
                this.error()
            }
            else {
                this.check()
            }
        }
        else {
            this.check()
        }
    }
    handleClose = () => {
        this.setState({ show: false })
        this.handleReset()
    }
    getUserName = (email) => {
        axios.post(serverUrl + '/api/v1/getUserName', { email })
            .then((response) => {
                // console.log(response)
                if (response.status === 200 && response.data.status === true) {
                    this.setState({ username: response.data.name })
                }
                else {
                    this.setState({ username: '' })
                }
            }).catch(err => {
                this.setState({ username: '' })
            })
    }
    check() {
        var array = [];
        this.setState({ spinnerFlag: true })
        var details = {
            UID: Math.floor(Math.random() * 10000) + 1000,
            EMP_ID: this.state.empId,
            EMP_NAME: this.state.username,
            ROLE: this.state.role,
            EMP_EMAIL: this.state.userEmail.toLowerCase(),
            STAGE_NAME: this.state.stagename,
            ISSUE_TYPE: this.state.issueType.join(','),
            ISSUE_CATEGORY: this.state.categoryType.join(','),
            loggedinUser: this.props.user_details.username,
            loggedinEmail: this.props.user_details.userEmail,
        }
        for (var i = 0; i < this.props.allUsers.length; i++) {
            if (this.props.allUsers[i].EMP_EMAIL === this.state.userEmail) {
                this.setState({ err: true, error: "User already exists", iconColor: "text-danger", spinnerFlag: false })
                this.error();
            }
            else {
                array.push(i);
                if (this.props.allUsers.length === array.length) {
                    this.props.actions.addUser(details)
                    setTimeout(() => {
                        if (this.props.userRes.status === 200) {
                            this.setState({
                                show: false, spinnerFlag: false, err: true, error: "Record Submitted", username: '', userEmail: '', empId: "", role: "",
                                categoryType: [], issueType: [], iconColor: "text-success"
                            })
                            this.error();
                        }
                        else {
                            this.setState({ show: false, spinnerFlag: false, err: true, error: "Please Try Again, or Contact System Adminstrator!", iconColor: "text-danger" })
                            this.error();
                        }
                    }, 5000)
                }
            }
        }
    }
    checkForUpdate() {
        this.setState({ spinnerFlag: true })
        //var array = [];
        var final = (this.state.sections).filter(value => (this.state.categoryType).includes(value))
        var details = {};
        Object.assign(details, {
            UID: this.state.UID,
            EMP_ID: this.state.empId,
            EMP_NAME: this.state.username,
            ROLE: this.state.role,
            EMP_EMAIL: this.state.userEmail.toLowerCase(),
            STAGE_NAME: this.state.stagename,
            ISSUE_TYPE: this.state.issueType.join(','),
            ISSUE_CATEGORY: final.join(','),
            // ISSUE_CATEGORY: this.state.categoryType
            loggedinUser: this.props.user_details.username,
            loggedinEmail: this.props.user_details.userEmail,
        })
        this.props.actions.updateUser(details)
        setTimeout(() => {
            if (this.props.updateuserRes.status === 200) {
                this.setState({
                    show: false, spinnerFlag: false, err: true, error: "User Record Updated", username: '', userEmail: '', empId: "", role: "",
                    categoryType: [], issueType: [], iconColor: "text-success"
                })
                this.error();
                this.Reset()
            }
            else {
                this.setState({ spinnerFlag: false, show: false, err: true, error: "Please Try Again, or Contact System Adminstrator!", iconColor: "text-danger" })
                this.error();
            }
        }, 5000)
    }
    handleReset = () => {
        this.setState({
            show: false,
            username: '',
            userEmail: '',
            UID: '',
            role: '',
            empId: "",
            error: '', err: false,
            spinnerFlag: false,
            stagename: '',
            categoryType: [],
            issueType: [],
            sections: [],
            flag: false,
            update: ""
        })
    }
    handleChangeType(e) {
        var section = [];
        var issue = e.target.value
        if (this.state.role !== "Super User") {
            this.props.issueTypes && this.props.issueTypes.forEach(function (opt) {
                for (var n = 0; n < issue.length; n++) {
                    if (opt.name === issue[n]) {
                        var sec = opt.section
                        sec && sec.forEach((sect) => {
                            section.push(sect)
                        })
                    }
                }
            })
        }

        this.setState({ issueType: e.target.value, sections: section })
    }
    handleRole = (e) => {
        this.setState({ role: e.target.value })
        if (e.target.value !== "SME") {
            this.setState({ stagename: '', issueType: [], categoryType: [] })
        }
        else {
            var stagename = this.state.userEmail.split('@', 1);
            this.setState({ stagename: stagename })
        }
    }
    handleUpdate = () => {
        if (this.state.username === "" || this.state.userEmail === "" || this.state.role === "") {
            this.setState({ error: "All Fields Are Mandatory", err: true, iconColor: "text-danger" });
            this.error()
        }
        else if (!this.state.userEmail.includes("@")) {
            this.setState({ error: "Mail Should Include @", err: true, iconColor: "text-danger" });
            this.error()
        } else if (!this.state.userEmail.includes(".ibm.com")) {
            this.setState({ error: "Mail Should Include .ibm.com", err: true, iconColor: "text-danger" });
            this.error()
        }
        else if (this.state.role === "SME") {
            if (this.state.issueType.length === 0 || this.state.stagename === "") {
                this.setState({ error: "All Fields Are Mandatory", err: true, iconColor: "text-danger" });
                this.error()
            }
            else if (this.state.categoryType.length === 0) {
                this.setState({ error: "Please Choose Sub-Category", err: true, iconColor: "text-danger" });
                this.error()
            }
            else {
                this.checkForUpdate()
            }
        }
        else {
            this.checkForUpdate()
        }
    }
    Reset = () => {
        setTimeout(() => {
            this.handleReset()
        }, 1000)
    }
    render() {
        // console.log(this.props)
        // console.log(this.state)
        const options = {
            responsive: "scroll",
            selectableRows: 'Single',
            customToolbar: () => {
                return (<Tooltip title={"Add User"}>
                    <IconButton className='addicon' onClick={e => this.handleAdduser()}>
                        <AddIcon /></IconButton></Tooltip>)
            },
            onRowClick: (_, { dataIndex }) => {
                var selected_data = this.props.allUsers[dataIndex]
                this.setState({
                    show: true,
                    flag: true,
                    UID: selected_data.UID,
                    username: selected_data.EMP_NAME,
                    userEmail: selected_data.EMP_EMAIL,
                    role: selected_data.ROLE,
                    empId: selected_data.EMP_ID,
                    stagename: selected_data.STAGE_NAME,
                    update: "update"
                })
                console.log(selected_data)
                var issueTyp = selected_data.ISSUE_TYPE !== null && selected_data.ISSUE_TYPE.length > 0 ? (selected_data.ISSUE_TYPE).split(',') : []

                var section = [];
                var subCat;
                this.props.issueTypes && this.props.issueTypes.forEach(function (opt) {
                    for (var n = 0; n < issueTyp.length; n++) {
                        if (opt.name === issueTyp[n]) {
                            var sec = opt.section
                            sec && sec.forEach((sect) => {
                                section.push(sect)
                            })
                            subCat = selected_data.ISSUE_CATEGORY !== null ? (selected_data.ISSUE_CATEGORY).split(',') : []
                        }
                    }
                    if (subCat === undefined) {
                        subCat = []
                    }
                })
                this.setState({ issueType: issueTyp, sections: section, categoryType: subCat })
            },
            onRowsDelete: (rowsDeleted) => {
                var data = this.props.allUsers[rowsDeleted.data[0].dataIndex].UID
                this.props.actions.deleteUser({
                    "mail": data,
                    loggedinUser: this.props.user_details.username,
                    loggedinEmail: this.props.user_details.userEmail,
                    id: this.props.allUsers[rowsDeleted.data[0].dataIndex].EMP_EMAIL
                })
                setTimeout(() => {
                    if (this.props.deleteRes.status === 200) {
                        this.setState({ show: false, spinnerFlag: false, err: true, error: "Record Deleted", iconColor: "text-success" })
                        this.error();
                    }
                    else {
                        this.setState({ show: false, err: true, error: "Please Try Again, or Contact System Adminstrator!", iconColor: "text-danger" })
                        this.error();
                    }
                }, 4000)
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
                {(this.props.allUsers && this.props.allUsers.lenght !== 0) ?
                    <MUIDataTable
                        title={"Users List"}
                        data={this.props.allUsers}
                        columns={columns}
                        options={options}
                    /> :
                    <div className="text-center">
                        <div className="spinner-border" role="status">
                            <span className="sr-only">Loading...</span>
                        </div>
                    </div>}
                <Modal show={this.state.show} onHide={e => this.handleClose()} dialogClassName="modal-user" size="lg">
                    <Modal.Header style={{ borderBottom: '5px #0c5bac solid', color: '#0c5bac' }} closeButton>
                        <Modal.Title >{this.state.flag === false ? "Add User" : "Update User"}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <div className="row">
                            <div className="col-sm-1 col-md-1"></div>
                            <div className="col-sm-11 col-md-10 text-center">
                                <div className="row m-2">
                                    <div className="col-sm-12 col-md-4 pt-2">
                                        <label><strong>Employee Mail ID:</strong></label>
                                    </div>
                                    {this.state.update === "update" ?
                                        <div className="col-sm-12 col-md-7">
                                            <input
                                                type="email"
                                                className="form-control"
                                                aria-describedby="emailHelp"
                                                value={this.state.userEmail}
                                                readOnly
                                            ></input>
                                        </div> :
                                        <div className="col-sm-12 col-md-7">
                                            <input
                                                type="email"
                                                className="form-control"
                                                aria-describedby="emailHelp"
                                                value={this.state.userEmail}
                                                onChange={e => {
                                                    this.setState({ userEmail: e.target.value });
                                                    setTimeout(() => { this.getUserName(this.state.userEmail) }, 3000)
                                                }}
                                            ></input>
                                        </div>}
                                </div>
                                {this.state.username !== "" && <div className="row m-2">
                                    <div className="col-sm-12 col-md-4 pt-2">
                                        <label><strong>Employee Name:</strong></label>
                                    </div>
                                    <div className="col-sm-12 col-md-7">
                                        <input
                                            className="form-control"
                                            value={this.state.username}
                                            disabled
                                        ></input>
                                    </div>
                                </div>}
                                <div className="row m-2">
                                    <div className="col-sm-12 col-md-4 pt-2">
                                        <label><strong>Role:</strong></label>
                                    </div>
                                    <div className="col-sm-12 col-md-7">
                                        <select
                                            className="form-control"
                                            value={this.state.role}
                                            onChange={e => this.handleRole(e)}>
                                            <option></option>
                                            {roles && roles.map((opt) => {
                                                return (
                                                    <option key={opt}>{opt}</option>
                                                )
                                            })}</select>
                                    </div>
                                </div>
                                {/* Geography */}
                                <div className="row m-2">
                                    <div className="col-sm-12 col-md-4 pt-2">
                                        <label><strong>Geography:</strong></label>
                                    </div>
                                    <div className="col-sm-12 col-md-7">
                                        <select
                                            className="form-control"
                                            value={this.state.geography}
                                            onChange={e => this.setState({ geography: e.target.value })}>
                                            <option></option>
                                            {geo && geo.sort().map((opt) => {
                                                return (
                                                    <option key={opt}>{opt}</option>
                                                )
                                            })}</select>
                                    </div>
                                </div>
                                {(this.state.role === "SME" || this.state.role === "Super User") &&
                                    <div className="row m-2">
                                        <div className="col-sm-12 col-md-4 pt-2">
                                            <label><strong>Stage Name:</strong></label>
                                        </div>
                                        <div className="col-sm-12 col-md-7">
                                            <input
                                                className="form-control"
                                                value={this.state.stagename}
                                                onChange={e => this.setState({ stagename: e.target.value })}></input>
                                        </div>
                                    </div>}
                                {this.state.role === "SME" && this.state.types && this.state.types.length !== 0 &&
                                    <div>
                                        <div className="row m-2">
                                            <div className="col-sm-12 col-md-4 pt-2">
                                                <label><strong>Category:</strong></label>
                                            </div>
                                            <div className="col-sm-12 col-md-7">
                                                <Select
                                                    multiple
                                                    className="form-control"
                                                    name="acc_name"
                                                    value={this.state.issueType}
                                                    onChange={e => this.handleChangeType(e)}
                                                    input={<Input disableUnderline />}
                                                    renderValue={selected => selected.join(', ')}

                                                >
                                                    {(this.state.types) && this.state.types.map(name => (
                                                        <MenuItem key={name} value={name}>
                                                            <Checkbox checked={this.state.issueType.indexOf(name) > -1} />
                                                            <ListItemText primary={name} />
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                            </div>
                                        </div>
                                        {this.state.sections && this.state.sections.length !== 0 &&
                                            <div className="row m-2">
                                                <div className="col-sm-12 col-md-4 pt-2">
                                                    <label><strong>Portals & Dashboard:</strong></label>
                                                </div>
                                                <div className="col-sm-12 col-md-7">
                                                    <Select
                                                        multiple
                                                        className="form-control"
                                                        name="acc_name"
                                                        value={this.state.categoryType}
                                                        onChange={e => this.setState({ categoryType: e.target.value })}
                                                        input={<Input disableUnderline />}
                                                        renderValue={selected => selected.join(', ')}

                                                    >
                                                        {(this.state.sections) && this.state.sections.map(name => (
                                                            <MenuItem key={name} value={name}>
                                                                <Checkbox checked={this.state.categoryType.indexOf(name) > -1} />
                                                                <ListItemText primary={name} />
                                                            </MenuItem>
                                                        ))}
                                                    </Select>
                                                </div>
                                            </div>}
                                    </div>}
                                {this.state.role === "Super User" && this.state.types && this.state.types.length !== 0 &&
                                    <div>
                                        <div className="row m-2">
                                            <div className="col-sm-12 col-md-4 pt-2">
                                                <label><strong>Category:</strong></label>
                                            </div>
                                            <div className="col-sm-12 col-md-7">
                                                <Select
                                                    multiple
                                                    className="form-control"
                                                    name="acc_name"
                                                    value={this.state.issueType}
                                                    onChange={e => this.handleChangeType(e)}
                                                    input={<Input disableUnderline />}
                                                    renderValue={selected => selected.join(', ')}

                                                >
                                                    {(this.state.types) && this.state.types.map(name => (
                                                        <MenuItem key={name} value={name}>
                                                            <Checkbox checked={this.state.issueType.indexOf(name) > -1} />
                                                            <ListItemText primary={name} />
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                            </div>
                                        </div>
                                    </div>}
                            </div>
                        </div>
                    </Modal.Body>
                    {this.state.flag === false ?
                        <Modal.Footer>
                            <button type="button" className="btn " style={{ backgroundColor: '#0c5bac', color: '#fff' }} onClick={e => this.handleAdd()}>Add</button>
                            {this.state.spinnerFlag === true && <div className="text-center">
                                <div className="spinner-border" role="status">
                                    <span className="sr-only">Loading...</span>
                                </div>
                            </div>}
                        </Modal.Footer>
                        :
                        <Modal.Footer>
                            <button type="button" className="btn " style={{ backgroundColor: '#0c5bac', color: '#fff' }} onClick={e => this.handleUpdate()}>Update</button>
                            {this.state.spinnerFlag === true && <div className="text-center">
                                <div className="spinner-border" role="status">
                                    <span className="sr-only">Loading...</span>
                                </div>
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
    allUsers: state.page.allUsers,
    userRes: state.page.userRes,
    deleteRes: state.page.deleteRes,
    user_details: state.user.user_details,
    issueTypes: state.page.issueTypes,
    updateuserRes: state.page.updateuserRes,
});

const mapDispatchToProps = dispatch => ({
    actions: bindActionCreators({ getAllUsers, addUser, deleteUser, getAllIssueTypes, updateUser }, dispatch)
});

export default connect(mapStateToProps, mapDispatchToProps)(Access);