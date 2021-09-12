import React, { Component } from 'react'
import propTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { changeMenu, getAllIssues } from '../actions/index'

class ReviewTicket extends Component {

    render() {
        // console.log(this.props)
        const { ticketRecord } = this.props;
        return (
            <div style={{ width: '100%' }}>
                <h3>Ticket Details:</h3>
                {ticketRecord.length > 0 ? < table >
                    <tbody>
                        <tr>
                            <td>Ticket Number:</td>
                            <td>{ticketRecord[0].hasOwnProperty('TICKET_NO') ? ticketRecord[0].TICKET_NO : ""}</td>
                        </tr>
                        <tr>
                            <td>Issue Raised By:</td>
                            <td>{ticketRecord[0].hasOwnProperty('PRACTIONER') ? ticketRecord[0].PRACTIONER : ""}</td>
                        </tr>
                        <tr>
                            <td>Status:</td>
                            <td>{ticketRecord[0].hasOwnProperty('STATUS') ? ticketRecord[0].STATUS : ""}</td>
                        </tr>
                        <tr>
                            <td>Description:</td>
                            <td>{ticketRecord[0].hasOwnProperty('DESCRIPTION') ? ticketRecord[0].DESCRIPTION : ""}</td>
                        </tr>
                        <tr>
                            <td>Section:</td>
                            <td>{ticketRecord[0].hasOwnProperty('SECTION') ? ticketRecord[0].SECTION : ""}</td>
                        </tr>
                        <tr>
                            <td>Created Date:</td>
                            <td>{ticketRecord[0].hasOwnProperty('CREATED_DATE') ? ticketRecord[0].CREATED_DATE : ""}</td>
                        </tr>
                        <tr>
                            <td>TAT:</td>
                            <td>{ticketRecord[0].hasOwnProperty('TAT') ? ticketRecord[0].TAT : ""}</td>
                        </tr>
                    </tbody>
                </table>
                    :
                    "Ticket Not Found."}
            </div>
        )
    }
}

ReviewTicket.propTypes = {
    steps: propTypes.object,
};

ReviewTicket.defaultProps = {
    steps: undefined,
};


const mapStateToProps = state => ({
    ticketRecord: state.page.ticketRecord,
});

const mapDispatchToProps = dispatch => ({
    actions: bindActionCreators({ changeMenu, getAllIssues }, dispatch)
});

export default connect(mapStateToProps, mapDispatchToProps)(ReviewTicket);