import {
    INITIAL_STATE, CREATE_ISSUE, ALL_ISSUES, UPDATE_REQUEST, ALL_UPDATED_RECORD, ALL_USERS, ADD_USER, DELETE_USER, TICKET_TRANSFER,
    GET_ALLISSUETYPES, ADD_ISSUE, DELETE_ISSUE, EDIT_TICKET, WITHDRAW_TICKET, UPDATE_USER, MAIL_TO_USER, MAIL_TO_SME,
    REPLY_MAIL, WITHDRAW_TICKET_MAIL, UPLOAD, NOTIFICATION_MAIL, AMP_USERS, UPLOAD_ESYNC, VERIFY_ISSUE, GET_ALL_NOTIFICATION, CHANGE_MENU, FETCH_TICKET_DETAILS
} from '../constants/PageActionTypes'

const initialPageState = {
    result: "",
    formDate: "",
    updateResult: '',
    updateRecord: "",
    userRes: "",
    allIssues: "",
    allUsers: [],
    transferTicket: '',
    issueTypes: '',
    addIssueData: '',
    deleteIssue: '',
    editResponse: '',
    withdrawResponse: "",
    updateuserRes: '',
    userMail: '',
    SMEMail: '',
    replyMail: '',
    withdrawMail: '',
    ampUsers: '',
    verify: [],
    allNotification: [],
    menuData: '',
    ticketRecord: []
}

export const page = (state = initialPageState, action) => {
    switch (action.type) {
        case CREATE_ISSUE: {
            return { ...state, result: action.payload.Details }
        }
        case ALL_ISSUES: {
            return { ...state, allIssues: action.payload.allIssues.data }
        }
        case UPDATE_REQUEST: {
            return { ...state, updateResult: action.payload.response_data }
        }
        case ALL_UPDATED_RECORD: {
            return { ...state, updateRecord: action.payload.updateRecord }
        }
        case ALL_USERS: {
            return { ...state, allUsers: action.payload.allUsers }
        }
        case ADD_USER: {
            return { ...state, userRes: action.payload.userRes }
        }
        case DELETE_USER: {
            return { ...state, deleteRes: action.payload.deleteRes }
        }
        case TICKET_TRANSFER: {
            return { ...state, transferTicket: action.payload.transferTicket }
        }
        case GET_ALLISSUETYPES: {
            return { ...state, issueTypes: action.payload.issueType }
        }
        case ADD_ISSUE: {
            return { ...state, addIssueData: action.payload.addIssueData }
        }
        case DELETE_ISSUE: {
            return { ...state, deleteIssue: action.payload.deleteIssue }
        }
        case EDIT_TICKET: {
            return { ...state, editResponse: action.payload.editResponse }
        }
        case WITHDRAW_TICKET: {
            return { ...state, withdrawResponse: action.payload.withdrawResponse }
        }
        case UPDATE_USER: {
            return { ...state, updateuserRes: action.payload.updateuserRes }
        }
        case MAIL_TO_USER: {
            return { ...state, userMail: action.payload.userMail }
        }
        case MAIL_TO_SME: {
            return { ...state, SMEMail: action.payload.SMEMail }
        }
        case REPLY_MAIL: {
            return { ...state, replyMail: action.payload.replyMail }
        }
        case WITHDRAW_TICKET_MAIL: {
            return { ...state, withdrawMail: action.payload.withdrawMail }
        }
        case UPLOAD: {
            return { ...state, excelData: action.payload.excelData }
        }
        case NOTIFICATION_MAIL: {
            return { ...state, notification: action.payload.notificationMail }
        }
        case AMP_USERS: {
            return { ...state, ampUsers: action.payload.ampUsers }
        }
        case UPLOAD_ESYNC: {
            return { ...state, eSyncData: action.payload.eSyncexcelData }
        }
        case VERIFY_ISSUE: {
            return { ...state, verify: action.payload.data.data }
        }
        case GET_ALL_NOTIFICATION: {
            return { ...state, allNotification: action.payload.allNotifications }
        }
        case CHANGE_MENU: {
            return { ...state, menuData: action.payload.menu }
        }
        case FETCH_TICKET_DETAILS: {
            return { ...state, ticketRecord: action.payload }
        }
        case INITIAL_STATE: {
            return {
                ...state,
                result: undefined
            }
        }
        default:
            return state
    }
}