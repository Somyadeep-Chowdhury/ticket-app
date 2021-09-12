import React, { Component } from 'react';
import { getAllIssueTypes, addIssue, deleteIssue } from '../actions/index';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Snackbar from '@material-ui/core/Snackbar';

class Addissue extends Component {
    state = {
        issueType: "",
        newCategory: '',
        newIssue: '',
        prevIssue: '',
        prevaddCategory: '',
        prevCategory: '',
        existCategory: '',
        allprevIssue: '',
        err: false,
        error: '',
        updateCategory: '',
        ticketType: '',
        existsubCategory: '',
        newsubCategory: '',
        newticketType: '',
        existticketType: '',
        ticket_type: [],
    }
    UNSAFE_componentWillMount() {
        this.props.actions.getAllIssueTypes()
    }
    componentDidUpdate(prevProps, prevState) {
        if (prevProps.issueTypes !== this.props.issueTypes) {
            if (this.props.issueTypes && this.props.issueTypes.length !== 0) {
                this.setState({ allprevIssue: this.props.issueTypes })
            }
        }
        if (prevState.issueType !== this.state.issueType) {
            this.setState({
                newCategory: '',
                newIssue: '',
                prevIssue: '',
                prevaddCategory: '',
                prevCategory: '',
                existCategory: '',
                updateCategory: '',
                ticketType: '',
                existsubCategory: '',
                newsubCategory: '',
                newticketType: '',
                existticketType: '',
                ticket_type: [],
            })
        }
    }
    error = () => {
        setTimeout(() => {
            this.setState({ err: false, error: '' })
        }, 3500);
    }
    handleChangeType(e) {
        var section;
        this.state.allprevIssue && this.state.allprevIssue.forEach(function (opt) {
            if (opt.name === e.target.value) {
                section = opt.section;
            }
        })
        this.setState({ prevIssue: e.target.value, prevCategory: section, existsubCategory: '', newsubCategory: '', existticketType: '', newticketType: '' })
    }
    handleSubCategory = (e) => {
        var ticket_type;
        this.state.allprevIssue && this.state.allprevIssue.forEach(function (opt) {
            for (var s = 0; s < opt.ticketType.length; s++) {
                if (opt.ticketType[s].section === e) {
                    ticket_type = opt.ticketType[s].type;
                }
            }
        })
        this.setState({ existsubCategory: e, ticket_type: ticket_type, existticketType: '', newticketType: '' })
    }
    handleAdd = (val) => {
        if (val === "Add") {
            if (this.state.newIssue === "" || this.state.newCategory === "" || this.state.ticketType === "") {
                this.setState({ error: "All fileds are mandatory", err: true, iconColor: "text-danger" });
                this.error();
            }
            else {
                this.curdOperations(this.state.newIssue, this.state.newCategory, this.state.ticketType, "Add")
            }
        }
        else if (val === "Add Sub-Category") {
            if (this.state.prevIssue === "" || this.state.prevaddCategory === "" || this.state.ticketType === "") {
                this.setState({ error: "All fileds are mandatory", err: true, iconColor: "text-danger" });
                this.error();
            }
            else {
                this.curdOperations(this.state.prevIssue, this.state.prevaddCategory, this.state.ticketType, "Add Sub-Category")
            }
        }
        else if (val === "Update Category") {
            if (this.state.prevIssue === "" || this.state.updateCategory === "") {
                this.setState({ error: "All fileds are mandatory", err: true, iconColor: "text-danger" });
                this.error();

            }
            else {
                this.curdOperations(this.state.prevIssue, this.state.updateCategory, "", "Update Category")
            }
        }
        else if (val === "Update Sub-Category") {
            if (this.state.prevIssue === "" || this.state.existsubCategory === "" || this.state.newsubCategory === "") {
                this.setState({ error: "All fileds are mandatory", err: true, iconColor: "text-danger" });
                this.error();

            }
            else {
                this.setState({ spinnerFlag: true })
                var obj = {}
                Object.assign(obj, {
                    cat: this.state.prevIssue,
                    sub_cat: this.state.existsubCategory,
                    new_sub_cat: this.state.newsubCategory,
                    val: "Update Sub-Category",
                    loggedinUser: this.props.user_details.username,
                    "email": this.props.user_details.userEmail,
                })
                this.updateIssues(obj)
            }
        }
        else if (val === "Update Ticket Type") {
            if (this.state.prevIssue === "" || this.state.existsubCategory === "" || this.state.existticketType === "" || this.state.newticketType === "") {
                this.setState({ error: "All fileds are mandatory", err: true, iconColor: "text-danger" });
                this.error();
            }
            else {
                this.setState({ spinnerFlag: true })
                var updateObj = {}
                Object.assign(updateObj, {
                    cat: this.state.prevIssue,
                    sub_cat: this.state.existsubCategory,
                    ticket_type: this.state.existticketType,
                    new_ticket_type: this.state.newticketType,
                    val: "Update Ticket Type",
                    loggedinUser: this.props.user_details.username,
                    "email": this.props.user_details.userEmail,
                })
                this.updateIssues(updateObj)
            }
        }
        else if (val === "Add Ticket Type") {
            if (this.state.prevIssue === "" || this.state.existCategory === "" || this.state.ticketType === "") {
                this.setState({ error: "All fileds are mandatory", err: true, iconColor: "text-danger" });
                this.error();
            }
            else {
                this.curdOperations(this.state.prevIssue, this.state.existCategory, this.state.ticketType, "Add Ticket Type")
            }
        }
    }
    updateIssues = (obj) => {
        this.props.actions.addIssue(obj)
        setTimeout(() => {
            if (this.props.addIssueData.status === 200) {
                this.setState({ error: this.props.addIssueData.data.message, err: true, iconColor: "text-success", spinnerFlag: false });
                this.error();
                this.Reset();
            }
            else {
                this.setState({ show: false, err: true, error: "Something Went wrong", iconColor: "text-danger", spinnerFlag: false })
                this.error();
            }
        }, 8000)
    }
    curdOperations = (category, subCategory, ticketType, key) => {
        this.setState({ spinnerFlag: true })
        var obj = {}
        Object.assign(obj, {
            issue: category,
            category: subCategory,
            ticketType: ticketType,
            val: key,
            "email": this.props.user_details.userEmail,
            loggedinUser: this.props.user_details.username
        })
        this.props.actions.addIssue(obj)
        setTimeout(() => {
            if (this.props.addIssueData.status === 200) {
                this.setState({ error: this.props.addIssueData.data.message, err: true, iconColor: "text-success", spinnerFlag: false });
                this.error();
                this.Reset();
            }
            else {
                this.setState({ show: false, err: true, error: "Something Went wrong", iconColor: "text-danger", spinnerFlag: false })
                this.error();
            }
        }, 8000)
    }
    Reset = () => {
        setTimeout(() => {
            this.handleReset()
        }, 1000)
    }
    handleReset = () => {
        this.setState({
            issueType: "",
            newCategory: '',
            newIssue: '',
            prevIssue: '',
            prevaddCategory: '',
            prevCategory: '',
            existCategory: '',
            updateCategory: '',
            ticketType: '',
            existsubCategory: '',
            newsubCategory: '',
            newticketType: '',
            existticketType: '',
            ticket_type: [],
        })
    }
    handleDelete = (val) => {
        if (val === "Delete Category") {
            if (this.state.prevIssue === "") {
                this.setState({ error: "Please selete Category", err: true, iconColor: "text-danger" });
                this.error();
            }
            else {
                this.Delete(this.state.prevIssue, "", 'issue')
            }
        }
        else if (val === "Delete Sub-Category") {
            if (this.state.prevIssue === "" || this.state.existCategory === "") {
                this.setState({ error: "All fileds are mandatory", err: true, iconColor: "text-danger" });
                this.error();
            }
            else {
                this.Delete(this.state.prevIssue, this.state.existCategory, '')
            }
        }

    }
    Delete = (issue, category, key) => {
        var obj = {};
        Object.assign(obj, {
            issue: issue,
            category: category,
            type: key,
            "email": this.props.user_details.userEmail,
            loggedinUser: this.props.user_details.username
        })
        this.props.actions.deleteIssue(obj)
        this.setState({ spinnerFlag: true })
        setTimeout(() => {
            if (this.props.deleteIssue.status === 200) {
                this.setState({ error: "Issue Deleted", err: true, iconColor: "text-success", spinnerFlag: false });
                this.error();
                this.Reset();
            }
            else {
                this.setState({ show: false, err: true, error: "Something Went wrong", iconColor: "text-danger", spinnerFlag: false })
                this.error();
            }
        }, 8000)
    }
    render() {
        return (
            <div className="container-fluid">
                <div className="card main-card">
                    <div className="card-header text-center createheader">Adding Issue</div>
                    <div className="card-body cardbody">
                        <div className="row">
                            {/* <div className="col-md-2"></div> */}
                            <div className="col-sm-12 col-md-12">
                                <div className="row">
                                    <div className="col-sm-6 col-md-1">
                                        <label className=""><strong>Issue</strong></label>
                                    </div>
                                    <div className="col-sm-6  col-md-11">
                                        <label className="radio pr-4">
                                            <input
                                                value="Add"
                                                checked={this.state.issueType === "Add"}
                                                type="radio"
                                                onChange={e => this.setState({ issueType: e.target.value })} />&nbsp;&nbsp;Add Category</label>
                                        <label className="radio  pr-4 issueType">
                                            <input type="radio" value="Add Sub-Category"
                                                checked={this.state.issueType === "Add Sub-Category"}
                                                onChange={e => this.setState({ issueType: e.target.value })} />&nbsp;&nbsp;Add Portals & Dashboard</label>
                                        <label className="radio  pr-4 issueType">
                                            <input type="radio" value="Add Ticket Type"
                                                checked={this.state.issueType === "Add Ticket Type"}
                                                onChange={e => this.setState({ issueType: e.target.value })} />&nbsp;&nbsp;Add Ticket Type</label>
                                        <label className="radio  pr-4 issueType">
                                            <input type="radio" value="Update Category"
                                                checked={this.state.issueType === "Update Category"}
                                                onChange={e => this.setState({ issueType: e.target.value })} />&nbsp;&nbsp;Update Category</label>
                                        <label className="radio  pr-4 issueType">
                                            <input type="radio" value="Update Sub-Category"
                                                checked={this.state.issueType === "Update Sub-Category"}
                                                onChange={e => this.setState({ issueType: e.target.value })} />&nbsp;&nbsp;Update Portals & Dashboard</label>
                                        <label className="radio  pr-4 issueType">
                                            <input type="radio" value="Update Ticket Type"
                                                checked={this.state.issueType === "Update Ticket Type"}
                                                onChange={e => this.setState({ issueType: e.target.value })} />&nbsp;&nbsp;Update Ticket Type</label>
                                        <label className="radio pr-4 issueType">
                                            <input
                                                value="Delete Category"
                                                checked={this.state.issueType === "Delete Category"}
                                                type="radio"
                                                onChange={e => this.setState({ issueType: e.target.value })} />&nbsp;&nbsp;Delete Category</label>
                                        <label className="radio">
                                            <input
                                                value="Delete Sub-Category"
                                                checked={this.state.issueType === "Delete Sub-Category"}
                                                type="radio"
                                                onChange={e => this.setState({ issueType: e.target.value })} />&nbsp;&nbsp;Delete Portals & Dashboard</label><br />
                                    </div>
                                </div>
                                {this.state.issueType === "Add" && <div>
                                    <div className="row pb-2">
                                        <div className="col-sm-6 col-md-1">
                                            <label className="pt-2"><strong>Category</strong></label>
                                        </div>
                                        <div className="col-sm-6 col-md-5">
                                            <input
                                                value={this.state.newIssue}
                                                className="form-control"
                                                onChange={e => this.setState({ newIssue: e.target.value })}></input>
                                        </div>
                                    </div>
                                    <div className="row pb-2">
                                        <div className="col-sm-6 col-md-1">
                                            <label className="pt-2"><strong>Portals & Dashboard</strong></label>
                                        </div>
                                        <div className="col-sm-6   col-md-5">
                                            <input
                                                value={this.state.newCategory}
                                                className="form-control"
                                                onChange={e => this.setState({ newCategory: e.target.value })}></input>
                                        </div>
                                    </div>
                                    <div className="row pb-2">
                                        <div className="col-sm-6 col-md-1">
                                            <label className="pt-2"><strong>Ticket Type</strong></label>
                                        </div>
                                        <div className="col-sm-6 col-md-5">
                                            <input
                                                value={this.state.ticketType}
                                                className="form-control"
                                                onChange={e => this.setState({ ticketType: e.target.value })}>
                                            </input>
                                        </div>
                                    </div>
                                </div>}
                                {this.state.issueType === "Add Sub-Category" && this.state.allprevIssue && this.state.allprevIssue.lenght !== 0 &&
                                    <div>
                                        <div className="row pb-2">
                                            <div className="col-sm-6 col-md-1">
                                                <label className="pt-2"><strong>Category</strong></label>
                                            </div>
                                            <div className="col-sm-6 col-md-5">
                                                <select
                                                    value={this.state.prevIssue}
                                                    className="form-control"
                                                    onChange={e => this.handleChangeType(e)}>
                                                    <option value="" disabled>Choose From Dropdown</option>
                                                    {this.state.allprevIssue && this.state.allprevIssue.map((opt) => {
                                                        return (
                                                            <option key={opt.name}>{opt.name}</option>
                                                        )
                                                    })}</select>
                                            </div>
                                        </div>
                                        <div className="row pb-2">
                                            <div className="col-sm-6 col-md-1">
                                                <label className="pt-2"><strong>Portals & Dashboard</strong></label>
                                            </div>
                                            <div className="col-sm-6   col-md-5">
                                                <input
                                                    value={this.state.prevaddCategory}
                                                    className="form-control"
                                                    onChange={e => this.setState({ prevaddCategory: e.target.value })}></input>
                                            </div>
                                        </div>
                                        <div className="row pb-2">
                                            <div className="col-sm-6 col-md-1">
                                                <label className="pt-2"><strong>Ticket Type</strong></label>
                                            </div>
                                            <div className="col-sm-6 col-md-5">
                                                <input
                                                    value={this.state.ticketType}
                                                    className="form-control"
                                                    onChange={e => this.setState({ ticketType: e.target.value })}>
                                                </input>
                                            </div>
                                        </div>
                                    </div>
                                }
                                {this.state.issueType === "Add Ticket Type" && this.state.allprevIssue && this.state.allprevIssue.lenght !== 0 &&
                                    <div>
                                        <div className="row pb-2">
                                            <div className="col-sm-6 col-md-1">
                                                <label className="pt-2"><strong>Category</strong></label>
                                            </div>
                                            <div className="col-sm-6 col-md-5">
                                                <select
                                                    value={this.state.prevIssue}
                                                    className="form-control"
                                                    onChange={e => this.handleChangeType(e)}>
                                                    <option value="" disabled>Choose From Dropdown</option>
                                                    {this.state.allprevIssue && this.state.allprevIssue.map((opt) => {
                                                        return (
                                                            <option key={opt.name}>{opt.name}</option>
                                                        )
                                                    })}</select>
                                            </div>
                                        </div>
                                        {this.state.prevCategory && this.state.prevCategory.length !== 0 &&
                                            <div className="row pb-2">
                                                <div className="col-sm-6 col-md-1">
                                                    <label className="pt-2"><strong>Portals & Dashboard</strong></label>
                                                </div>
                                                <div className="col-sm-6   col-md-5">
                                                    <select
                                                        value={this.state.existCategory}
                                                        className="form-control"
                                                        onChange={e => this.setState({ existCategory: e.target.value })}>
                                                        <option value="" disabled>Choose From Dropdown</option>
                                                        {this.state.prevCategory && this.state.prevCategory.map((opt) => {
                                                            return (
                                                                <option key={opt}>{opt}</option>
                                                            )
                                                        })}</select>
                                                </div>
                                            </div>}
                                        {this.state.existCategory && this.state.existCategory !== '' &&
                                            <div className="row pb-2">
                                                <div className="col-sm-6 col-md-1">
                                                    <label className="pt-2"><strong>Ticket Type</strong></label>
                                                </div>
                                                <div className="col-sm-6 col-md-5">
                                                    <input
                                                        value={this.state.ticketType}
                                                        className="form-control"
                                                        onChange={e => this.setState({ ticketType: e.target.value })}>
                                                    </input>
                                                </div>
                                            </div>}
                                    </div>
                                }
                                {this.state.issueType === "Update Category" && this.state.allprevIssue && this.state.allprevIssue.lenght !== 0 &&
                                    <div>
                                        <div className="row pb-2">
                                            <div className="col-sm-6 col-md-2">
                                                <label className="pt-2"><strong>Existing Category</strong></label>
                                            </div>
                                            <div className="col-sm-6 col-md-5">
                                                <select
                                                    value={this.state.prevIssue}
                                                    className="form-control"
                                                    onChange={e => this.handleChangeType(e)}>
                                                    <option value="" disabled>Choose From Dropdown</option>
                                                    {this.state.allprevIssue && this.state.allprevIssue.map((opt) => {
                                                        return (
                                                            <option key={opt.name}>{opt.name}</option>
                                                        )
                                                    })}</select>
                                            </div>
                                        </div>
                                        <div className="row pb-2">
                                            <div className="col-sm-6 col-md-2">
                                                <label className="pt-2"><strong>Category</strong></label>
                                            </div>
                                            <div className="col-sm-6   col-md-5">
                                                <input
                                                    value={this.state.updateCategory}
                                                    className="form-control"
                                                    onChange={e => this.setState({ updateCategory: e.target.value })}></input>
                                            </div>
                                        </div>
                                    </div>
                                }
                                {this.state.issueType === "Update Sub-Category" && this.state.allprevIssue && this.state.allprevIssue.lenght !== 0 &&
                                    <div>
                                        <div className="row pb-2">
                                            <div className="col-sm-6 col-md-2">
                                                <label className="pt-2"><strong>Category</strong></label>
                                            </div>
                                            <div className="col-sm-6 col-md-5">
                                                <select
                                                    value={this.state.prevIssue}
                                                    className="form-control"
                                                    onChange={e => this.handleChangeType(e)}>
                                                    <option value="" disabled>Choose From Dropdown</option>
                                                    {this.state.allprevIssue && this.state.allprevIssue.map((opt) => {
                                                        return (
                                                            <option key={opt.name}>{opt.name}</option>
                                                        )
                                                    })}</select>
                                            </div>
                                        </div>
                                        {this.state.prevCategory && this.state.prevCategory.length !== 0 &&
                                            <div className="row pb-2">
                                                <div className="col-sm-6 col-md-2">
                                                    <label className="pt-2"><strong>Portals & Dashboard</strong></label>
                                                </div>
                                                <div className="col-sm-6   col-md-5">
                                                    <select
                                                        value={this.state.existsubCategory}
                                                        className="form-control"
                                                        onChange={e => this.setState({ existsubCategory: e.target.value })}>
                                                        <option value="" disabled>Choose From Dropdown</option>
                                                        {this.state.prevCategory && this.state.prevCategory.map((opt) => {
                                                            return (
                                                                <option key={opt}>{opt}</option>
                                                            )
                                                        })}</select>
                                                </div>
                                            </div>
                                        }
                                        <div className="row pb-2">
                                            <div className="col-sm-6 col-md-2">
                                                <label className="pt-2"><strong>New Portals & Dashboard</strong></label>
                                            </div>
                                            <div className="col-sm-6  col-md-5">
                                                <input
                                                    value={this.state.newsubCategory}
                                                    className="form-control"
                                                    onChange={e => this.setState({ newsubCategory: e.target.value })}></input>
                                            </div>
                                        </div>
                                    </div>
                                }
                                {this.state.issueType === "Update Ticket Type" && this.state.allprevIssue && this.state.allprevIssue.lenght !== 0 &&
                                    <div>
                                        <div className="row pb-2">
                                            <div className="col-sm-6 col-md-2">
                                                <label className="pt-2"><strong>Category</strong></label>
                                            </div>
                                            <div className="col-sm-6 col-md-5">
                                                <select
                                                    value={this.state.prevIssue}
                                                    className="form-control"
                                                    onChange={e => this.handleChangeType(e)}>
                                                    <option value="" disabled>Choose From Dropdown</option>
                                                    {this.state.allprevIssue && this.state.allprevIssue.map((opt) => {
                                                        return (
                                                            <option key={opt.name}>{opt.name}</option>
                                                        )
                                                    })}</select>
                                            </div>
                                        </div>
                                        {this.state.prevCategory && this.state.prevCategory.length !== 0 &&
                                            <div className="row pb-2">
                                                <div className="col-sm-6 col-md-2">
                                                    <label className="pt-2"><strong>Portals & Dashboard</strong></label>
                                                </div>
                                                <div className="col-sm-6   col-md-5">
                                                    <select
                                                        value={this.state.existsubCategory}
                                                        className="form-control"
                                                        //onChange={e => this.setState({ existsubCategory: e.target.value })}
                                                        onChange={e => this.handleSubCategory(e.target.value)}
                                                    >
                                                        <option value="" disabled>Choose From Dropdown</option>
                                                        {this.state.prevCategory && this.state.prevCategory.map((opt) => {
                                                            return (
                                                                <option key={opt}>{opt}</option>
                                                            )
                                                        })}</select>
                                                </div>
                                            </div>
                                        }
                                        {this.state.ticket_type && this.state.ticket_type.lenght !== 0 &&
                                            <div className="row pb-2">
                                                <div className="col-sm-6 col-md-2">
                                                    <label className="pt-2"><strong>Existing Ticket Type</strong></label>
                                                </div>
                                                <div className="col-sm-6  col-md-5">
                                                    <select
                                                        value={this.state.existticketType}
                                                        className="form-control"
                                                        onChange={e => this.setState({ existticketType: e.target.value })}>
                                                        <option value="" disabled>Choose From Dropdown</option>
                                                        {this.state.ticket_type && this.state.ticket_type.map((opt) => {
                                                            return (
                                                                <option key={opt}>{opt}</option>
                                                            )
                                                        })}
                                                    </select>
                                                </div>
                                            </div>
                                        }
                                        <div className="row pb-2">
                                            <div className="col-sm-6 col-md-2">
                                                <label className="pt-2"><strong>New Ticket Type</strong></label>
                                            </div>
                                            <div className="col-sm-6  col-md-5">
                                                <input
                                                    value={this.state.newticketType}
                                                    className="form-control"
                                                    onChange={e => this.setState({ newticketType: e.target.value })}></input>
                                            </div>
                                        </div>
                                    </div>
                                }
                                {this.state.issueType === "Delete Category" && this.state.allprevIssue && this.state.allprevIssue.lenght !== 0 &&
                                    <div>
                                        <div className="row pb-2">
                                            <div className="col-sm-6 col-md-1">
                                                <label className="pt-2"><strong>Category</strong></label>
                                            </div>
                                            <div className="col-sm-6 col-md-5">
                                                <select
                                                    value={this.state.prevIssue}
                                                    className="form-control"
                                                    onChange={e => this.handleChangeType(e)}>
                                                    <option value="" disabled>Choose From Dropdown</option>
                                                    {this.state.allprevIssue && this.state.allprevIssue.map((opt) => {
                                                        return (
                                                            <option key={opt.name}>{opt.name}</option>
                                                        )
                                                    })}</select>
                                            </div>
                                        </div>
                                    </div>
                                }
                                {this.state.issueType === "Delete Sub-Category" && this.state.allprevIssue && this.state.allprevIssue.lenght !== 0 &&
                                    <div>
                                        <div className="row pb-2">
                                            <div className="col-sm-6 col-md-1">
                                                <label className="pt-2"><strong>Category</strong></label>
                                            </div>
                                            <div className="col-sm-6 col-md-5">
                                                <select
                                                    value={this.state.prevIssue}
                                                    className="form-control"
                                                    onChange={e => this.handleChangeType(e)}>
                                                    <option value="" disabled>Choose From Dropdown</option>
                                                    {this.state.allprevIssue && this.state.allprevIssue.map((opt) => {
                                                        return (
                                                            <option key={opt.name}>{opt.name}</option>
                                                        )
                                                    })}</select>
                                            </div>
                                        </div>
                                        {this.state.prevCategory && this.state.prevCategory.length !== 0 &&
                                            <div className="row pb-2">
                                                <div className="col-sm-6 col-md-1">
                                                    <label className="pt-2"><strong>Portals & Dashboard</strong></label>
                                                </div>
                                                <div className="col-sm-6   col-md-5">
                                                    <select
                                                        value={this.state.existCategory}
                                                        className="form-control"
                                                        onChange={e => this.setState({ existCategory: e.target.value })}>
                                                        <option value="" disabled>Choose From Dropdown</option>
                                                        {this.state.prevCategory && this.state.prevCategory.map((opt) => {
                                                            return (
                                                                <option key={opt}>{opt}</option>
                                                            )
                                                        })}</select>
                                                </div>
                                            </div>}
                                    </div>
                                }
                            </div>
                        </div>
                    </div>

                    {this.state.issueType === "Add" &&
                        <div className="card-footer createfooter">
                            <button className="btn btu-submit" onClick={e => this.handleAdd("Add")} >Add
                            {this.state.spinnerFlag === true &&
                                    <div className="spinner-border" role="status">
                                        <span className="sr-only">Loading...</span>
                                    </div>
                                }
                            </button>
                        </div>}
                    {this.state.issueType === "Update Category" &&
                        <div className="card-footer createfooter">
                            <button className="btn btu-submit" onClick={e => this.handleAdd("Update Category")} >Update
                            {this.state.spinnerFlag === true &&
                                    <div className="spinner-border" role="status">
                                        <span className="sr-only">Loading...</span>
                                    </div>
                                }
                            </button>
                        </div>}
                    {this.state.issueType === "Update Sub-Category" &&
                        <div className="card-footer createfooter">
                            <button className="btn btu-submit" onClick={e => this.handleAdd("Update Sub-Category")} >Update
                            {this.state.spinnerFlag === true &&
                                    <div className="spinner-border" role="status">
                                        <span className="sr-only">Loading...</span>
                                    </div>
                                }
                            </button>
                        </div>}
                    {this.state.issueType === "Update Ticket Type" &&
                        <div className="card-footer createfooter">
                            <button className="btn btu-submit" onClick={e => this.handleAdd("Update Ticket Type")} >Update
                            {this.state.spinnerFlag === true &&
                                    <div className="spinner-border" role="status">
                                        <span className="sr-only">Loading...</span>
                                    </div>
                                }
                            </button>
                        </div>}
                    {this.state.issueType === "Add Sub-Category" &&
                        <div className="card-footer createfooter">
                            <button className="btn btu-submit" onClick={e => this.handleAdd("Add Sub-Category")} >Add
                            {this.state.spinnerFlag === true &&
                                    <div className="spinner-border" role="status">
                                        <span className="sr-only">Loading...</span>
                                    </div>
                                }
                            </button>
                        </div>}
                    {this.state.issueType === "Add Ticket Type" &&
                        <div className="card-footer createfooter">
                            <button className="btn btu-submit" onClick={e => this.handleAdd("Add Ticket Type")} >Add
                            {this.state.spinnerFlag === true &&
                                    <div className="spinner-border" role="status">
                                        <span className="sr-only">Loading...</span>
                                    </div>
                                }
                            </button>
                        </div>}
                    {this.state.issueType === "Delete Category" &&
                        <div className="card-footer createfooter">
                            <button className="btn btu-submit" onClick={e => this.handleDelete("Delete Category")} >Delete
                            {this.state.spinnerFlag === true &&
                                    <div className="spinner-border" role="status">
                                        <span className="sr-only">Loading...</span>
                                    </div>}
                            </button>
                        </div>}
                    {this.state.issueType === "Delete Sub-Category" &&
                        <div className="card-footer createfooter">
                            <button className="btn btu-submit" onClick={e => this.handleDelete("Delete Sub-Category")} >Delete
                            {this.state.spinnerFlag === true &&
                                    <div className="spinner-border" role="status">
                                        <span className="sr-only">Loading...</span>
                                    </div>}
                            </button>
                        </div>}
                </div>
                {
                    <Snackbar
                        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                        open={this.state.err}
                        className='snacking'
                        message={this.state.error}
                    />
                }
            </div >
        )
    }
}

const mapStateToProps = state => ({
    issueTypes: state.page.issueTypes,
    addIssueData: state.page.addIssueData,
    deleteIssue: state.page.deleteIssue,
    user_details: state.user.user_details,
});

const mapDispatchToProps = dispatch => ({
    actions: bindActionCreators({ getAllIssueTypes, addIssue, deleteIssue }, dispatch)
});

export default connect(mapStateToProps, mapDispatchToProps)(Addissue);