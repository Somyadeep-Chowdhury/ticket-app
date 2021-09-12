import axios from 'axios';
import React, { Component } from 'react'
import { connect } from 'react-redux';
import ChatBot from 'react-simple-chatbot';
import { bindActionCreators } from 'redux';
import { changeMenu, fetchTicketByNumber } from '../actions/index';
import ReviewTicket from './ReviewTicket';
import '../styles/chatbot.css';

// const serverUrl = 'http://localhost:8181';
const serverUrl = '';
class SimpleBot extends Component {
    state = {
        chatbotKey: 0
    }
    componentDidMount() {
        this.handleEnd = this.handleEnd.bind(this);
    }

    handleEnd({ steps, values }) {
        this.setState((prevState) => ({
            chatbotKey: prevState.chatbotKey + 1
        }));
    }
    render() {
        // console.log(this.state)
        return (
            <div>
                <ChatBot
                    headerTitle="Chat Support"
                    floating={true}
                    handleEnd={this.handleEnd}
                    key={this.state.chatbotKey}
                    steps={[
                        {
                            id: 'initilize',
                            message: 'Hello, What would you like me to do?',
                            trigger: ({ value, steps }) => {
                                return 'main-option'
                            },
                        },
                        {
                            id: 'main-option',
                            options: [
                                { value: 'raise-query', label: 'Raise Query', trigger: 'raise-query' },
                                { value: 'my-queue', label: 'Tickets in Queue', trigger: 'my-queue' },
                                { value: 'my-tickets', label: 'Tickets Raised', trigger: 'my-ticket' },
                                { value: 'ticket-status', label: 'Check Ticket Status ', trigger: 'ticket-status' },
                            ]
                        },
                        {
                            id: 'raise-query',
                            message: 'You are in Raise Ticket Page!',
                            trigger: ({ value, steps }) => {
                                this.props.actions.changeMenu('Raise New Ticket');
                                return 'initilize'
                            },
                        },
                        {
                            id: 'my-queue',
                            message: 'You are in My Ticket page',
                            trigger: ({ value, steps }) => {
                                this.props.actions.changeMenu('My Ticket Logs');
                                return 'initilize'
                            },
                        },
                        {
                            id: 'my-ticket',
                            message: 'You are in My Queue page',
                            trigger: ({ value, steps }) => {
                                this.props.actions.changeMenu('All Ticket Logs');
                                return 'initilize'
                            },
                        },
                        {
                            id: 'ticket-status',
                            message: 'Enter Ticket Number: ',
                            trigger: 'get-ticket'

                        },
                        {
                            id: 'get-ticket',
                            user: true,
                            // trigger: 'fetch-ticket',
                            validator: (value) => {
                                if (isNaN(value)) {
                                    return 'Enter valid Ticket Number';
                                }
                                return true;
                            },
                            trigger: ({ value, steps }) => {
                                let data;
                                if ((this.props.user_details.role === 'Super Admin') || (this.props.user_details.role === 'Super User')) {
                                    data = { "email": this.props.user_details.userEmail, "role": this.props.user_details.role, "data": "getall" };
                                }
                                else {
                                    data = { "email": this.props.user_details.userEmail, "role": this.props.user_details.role, "data": "allissues", category: this.props.user_details.section };
                                }
                                axios.post(serverUrl + '/api/v1/getAllIssues', data)
                                    .then((response) => {
                                        // console.log(response)
                                        if (response.status === 200 && response.data.hasOwnProperty('data') && response.data.data.length > 0) {
                                            this.props.actions.fetchTicketByNumber(value, response.data.data)
                                        }
                                        else {
                                            this.props.actions.fetchTicketByNumber(value, [])
                                        }
                                    })
                                    .catch(error => {
                                        this.props.actions.fetchTicketByNumber(value, [])
                                    });
                                return 'fetch-ticket';
                            },
                        },
                        {
                            id: 'fetch-ticket',
                            component: <ReviewTicket />,
                            asMessage: false,
                            delay: 5000,
                            trigger: "end-step"
                        },
                        {
                            id: 'end-step',
                            message: 'Start Chat Again. Thank You!',
                            trigger: "final-step"
                        },
                        {
                            id: "final-step",
                            delay: 20000,
                            message: '...',
                            end: true
                        }
                    ]}
                />
            </div>
        )
    }
}

const mapStateToProps = state => ({
    user_details: state.user.user_details,
    ticketRecord: state.page.ticketRecord,
});

const mapDispatchToProps = dispatch => ({
    actions: bindActionCreators({ changeMenu, fetchTicketByNumber }, dispatch)
});

export default connect(mapStateToProps, mapDispatchToProps)(SimpleBot);