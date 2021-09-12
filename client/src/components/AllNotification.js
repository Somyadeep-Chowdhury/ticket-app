import React, { Component } from 'react'
import { connect } from 'react-redux'
import { getAllNotification } from '../actions/index';
import { bindActionCreators } from 'redux';
import MUIDataTable from "mui-datatables";
import { Modal } from 'react-bootstrap';
import '../styles/Issue.css';

const columns = [
    // {
    //     name: "AUDIENCE",
    //     label: "Audience",
    //     options: {
    //         filter: true,
    //         sort: true,
    //     }
    // },
    {
        name: "DATE_TIME",
        label: "Date & Time",
        options: {
            filter: true,
            sort: true,
        }
    },
    {
        name: "DESCRIPTION",
        label: "Description",
        options: {
            filter: true,
            sort: true,
        }
    }, {
        name: "GEOGRAPHY",
        label: "Geography",
        options: {
            filter: true,
            sort: true,
        }
    },
    {
        name: "ISSUE_CATEGORY",
        label: "Issue Category",
        options: {
            filter: true,
            sort: true,
        }
    },
    {
        name: "ISSUE_TYPE",
        label: "Issue Type",
        options: {
            filter: true,
            sort: true,
        }
    },
    {
        name: "REASONS",
        label: "Reasons",
        options: {
            filter: true,
            sort: true,
        }
    },
    {
        name: "USER",
        label: "Users",
        options: {
            filter: true,
            sort: true,
        }
    },
]

class AllNotification extends Component {
    state = {
        tableData: [],
        show: false
    }
    UNSAFE_componentWillMount() {
        this.props.actions.getAllNotification()
    }
    componentDidUpdate(prevProps) {
        if (prevProps.allNotification !== this.props.allNotification) {
            if (this.props.allNotification && this.props.allNotification.length !== 0) {
                this.setState({ tableData: this.props.allNotification })
            }
        }
    }
    handleClose = () => {
        this.setState({ show: false })
    }
    render() {
        const options = {
            print: false,
            search: true,
            download: false,
            filter: false,
            viewColumns: false,
            filterType: "dropdown",
            selectableRows: false,
            pagination: {
                next: "Next Page",
                previous: "Previous Page",
                rowsPerPage: 10,
                displayRows: "of",
            },
            onRowClick: (_, { dataIndex }) => {
                var selected_data = this.state.tableData[dataIndex]
                this.setState({
                    show: true,
                    dateTime: selected_data.DATE_TIME,
                    description: selected_data.DESCRIPTION,
                    geography: selected_data.GEOGRAPHY,
                    issueCategory: selected_data.ISSUE_CATEGORY,
                    issueType: selected_data.ISSUE_TYPE,
                    reasons: selected_data.REASONS,
                    users: selected_data.USER
                })
            },
        };
        return (
            <div className="container-fluid NotificationTable">
                <MUIDataTable
                    title={"Notifications Log"}
                    data={this.state.tableData}
                    columns={columns}
                    options={options}
                />
                <Modal show={this.state.show} onHide={e => this.handleClose()} dialogClassName="modal-record" size="lg">
                    <Modal.Header style={{ borderBottom: '5px #0c5bac solid', color: '#0c5bac' }} closeButton>
                        <Modal.Title >{this.state.reasons !== "" && this.state.issueCategory !== "" ? this.state.reasons + " - " + this.state.issueCategory : "Log"}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body className='modal_body'>
                        <div className="card-body cardbody">
                            <div className="row">
                                <div className="col-sm-6 col-md-6">
                                    <label><strong>Date & Time</strong></label>
                                    <input
                                        readOnly
                                        className="form-control"
                                        value={this.state.dateTime}
                                        type="text"></input>
                                </div>
                                <div className="col-sm-6 col-md-6">
                                    <label><strong>Geography</strong></label>
                                    <input
                                        readOnly
                                        className="form-control"
                                        value={this.state.geography}
                                        type="text"></input>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-sm-6 col-md-6">
                                    <label><strong>Issue Category</strong></label>
                                    <input
                                        readOnly
                                        className="form-control"
                                        value={this.state.issueCategory}
                                        type="text"></input>
                                </div>
                                <div className="col-sm-6 col-md-6">
                                    <label><strong>Issue Type</strong></label>
                                    <input
                                        readOnly
                                        className="form-control"
                                        value={this.state.issueType}
                                        type="text"></input>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-sm-6 col-md-6">
                                    <label><strong>Reasons</strong></label>
                                    <input
                                        readOnly
                                        className="form-control"
                                        value={this.state.reasons}
                                        type="text"></input>
                                </div>
                                <div className="col-sm-6 col-md-6">
                                    <label><strong>Users</strong></label>
                                    <input
                                        readOnly
                                        className="form-control"
                                        value={this.state.users}
                                        type="text"></input>
                                </div>
                            </div>
                            <div className="row mt-2">
                                <div className="col-sm-12 col-md-12">
                                    <label><strong>Description</strong></label>
                                    <textarea
                                        className="form-control"
                                        value={this.state.description}
                                        readOnly
                                        type="text"
                                        rows="6"></textarea>
                                </div></div>
                        </div>
                    </Modal.Body>
                </Modal>
            </div>
        )
    }
}
const mapStateToProps = (state) => ({
    allNotification: state.page.allNotification,
})
const mapDispatchToProps = dispatch => ({
    actions: bindActionCreators({ getAllNotification }, dispatch)
});
export default connect(mapStateToProps, mapDispatchToProps)(AllNotification);