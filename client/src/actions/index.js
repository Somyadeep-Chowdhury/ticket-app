import * as loginTypes from '../constants/LoginActionTypes'
import * as pageTypes from '../constants/PageActionTypes'
import axios from "axios";

// const serverUrl = 'http://localhost:8181';
const serverUrl = "";
export const setLoginPending = isLoginPending => ({
  type: loginTypes.SET_LOGIN_PENDING,
  payload: { isLoginPending }
})

export const setLoginSuccess = data => ({
  type: loginTypes.SET_LOGIN_SUCCESS,
  payload: { data }
})

export const setLoginError = isLoginError => ({
  type: loginTypes.SET_LOGIN_ERROR,
  payload: { isLoginError }
})



//Login...
export function login(email, password) {
  return (dispatch) => {
    dispatch(setLoginPending(true));
    let password_encode = new Buffer(password).toString('base64')
    axios.get(serverUrl + '/login?email=' + email + '&pass=' + password_encode)
      .then(response => {
        if (response.status === 200) {
          if (!response.data.isAuthenticated) {
            dispatch(setLoginError(response.data.message));
          } else if (response.data.isAuthenticated) {
            response.data.userEmail = email;
            dispatch(checkUser(response.data));
          } else {
            dispatch(setLoginError(response.data.message));
          }
        } else {
          dispatch(setLoginError("Server Error, Please Try Later!"));
        }
      })
      .catch(error => {
        dispatch(setLoginError("Network Error, Please Try Later!"))
      });
  }
}

//Check user has access for this portal or not...
export function checkUser(data) {
  return (dispatch => {
    axios.post(serverUrl + '/api/v1/checkUser', { "userId": data.userEmail })
      .then((response) => {
        var userInfo = response.data;
        userInfo.empId = data.empId;
        userInfo.username = data.username;
        userInfo.userEmail = data.userEmail;
        userInfo.role = response.data.role
        if (response.data.isAuthenticated && response.status === 200) {
          dispatch(setLoginSuccess(userInfo));
        }
        else {
          dispatch(setLoginError(response.data.message)
          );
        }
      })
      .catch(error => {
        dispatch(setLoginError(error));
      });
  })
}
//Getting all issues
export function getAllIssues(data) {
  return (dispatch => {
    axios.post(serverUrl + '/api/v1/getAllIssues', data)
      .then((response) => {
        // console.log(response)
        if (response.status === 200) {
          dispatch({
            type: pageTypes.ALL_ISSUES,
            payload: {
              allIssues: response.data
            }
          });
        }
        else {
          dispatch(setLoginError(response.data.message))
        }
      })
      .catch(error => {
        dispatch(setLoginError(error));
      });
  })
}


//update the Issue
export function updateIssue(reply) {
  return function (dispatch) {
    axios.post(serverUrl + '/api/v1/response', reply)
      .then((updateData) => {
        if (updateData.status === 200) {
          dispatch({
            type: pageTypes.UPDATE_REQUEST,
            payload: {
              response_data: updateData
            }
          });
          dispatch(getAllIssues(reply))
        }
        else {
          dispatch(setLoginError(updateData.data.message))
        }

      })
      .catch(error => {
        dispatch(setLoginError(error));
      });
  }
}

//form submition
export function raiseIssue(data) {
  return (dispatch => {
    axios.post(serverUrl + '/api/v1/craeteIncident', data)
      .then((response) => {
        // console.log(response)
        if (response.status === 201 && response.data.message === "Successfully Inserted") {
          dispatch({
            type: pageTypes.CREATE_ISSUE,
            payload: {
              Details: response.data.data
            }
          });
          dispatch(mailToUser(data))
          dispatch(mailToSME(data))
        }
        else {
          dispatch(setLoginError(response.data.message))
          dispatch({
            type: pageTypes.CREATE_ISSUE,
            payload: {
              Details: []
            }
          });
        }

      }).catch(function (err) {
        dispatch(setLoginError("Network Error, Please try Later!"))
        dispatch({
          type: pageTypes.CREATE_ISSUE,
          payload: {
            Details: []
          }
        });
      })
  })
}

//form editing
export function editTicket(data) {
  return (dispatch => {
    axios.post(serverUrl + '/api/v1/editIncident', data)
      .then((response) => {
        if (response.status === 200) {
          dispatch({
            type: pageTypes.EDIT_TICKET,
            payload: {
              editResponse: response
            }
          });
          dispatch(getAllIssues(data))
        }
        else {
          dispatch(setLoginError(response.data.message))
        }

      })
  })
}

//Withdrw Ticket
export function withdrawTicket(data) {
  return (dispatch => {
    axios.post(serverUrl + '/api/v1/withdrawTicket', data)
      .then((response) => {
        if (response.status === 200) {
          dispatch({
            type: pageTypes.WITHDRAW_TICKET,
            payload: {
              withdrawResponse: response
            }
          });
          dispatch(getAllIssues(data))
        }
        else {
          dispatch(setLoginError(response.data.message))
        }

      })
  })
}

//getting updated record
export function getUpdatedRecord(data) {
  return (dispatch => {
    axios.post(serverUrl + '/api/v1/getupdatedIssue', data)
      .then((response) => {
        // console.log(response)
        if (response.status === 200) {
          dispatch({
            type: pageTypes.ALL_UPDATED_RECORD,
            payload: {
              updateRecord: response.data.data
            }
          });
        }
        else {
          dispatch(setLoginError(response.data.message))
        }
      })
      .catch(error => {
        dispatch(setLoginError(error));
      });
  })
}
//Getiing all users
export function getAllUsers() {
  return (dispatch => {
    axios.post(serverUrl + '/api/v1/getAllUsers')
      .then((response) => {
        // console.log(response)
        if (response.status === 200) {
          dispatch({
            type: pageTypes.ALL_USERS,
            payload: {
              allUsers: response.data.data
            }
          });
        }
        else {
          dispatch(setLoginError(response.data.message))
        }
      })
      .catch(error => {
        dispatch(setLoginError(error));
      });
  })
}

//adding user
export function addUser(data) {
  return (dispatch => {
    axios.post(serverUrl + '/api/v1/addUser', data)
      .then((response) => {
        if (response.status === 200) {
          dispatch({
            type: pageTypes.ADD_USER,
            payload: {
              userRes: response
            }
          });
          dispatch(getAllUsers())
        }
        else {
          dispatch(setLoginError(response.data.message))
        }

      })
  })
}
//update user
export function updateUser(data) {
  return (dispatch => {
    axios.post(serverUrl + '/api/v1/updateUser', data)
      .then((response) => {
        if (response.status === 200) {
          dispatch({
            type: pageTypes.UPDATE_USER,
            payload: {
              updateuserRes: response
            }
          });
          dispatch(getAllUsers())
        }
        else {
          dispatch(setLoginError(response.data.message))
        }

      })
  })
}

//deleting user
export function deleteUser(data) {
  return (dispatch => {
    axios.post(serverUrl + '/api/v1/deleteUser', data)
      .then((response) => {
        if (response.status === 200) {
          dispatch({
            type: pageTypes.DELETE_USER,
            payload: {
              deleteRes: response
            }
          });
          dispatch(getAllUsers())
        }
        else {
          dispatch(setLoginError(response.data.message))
        }

      })
  })
}

//transfering ticket
export function trasferTicket(data) {
  return (dispatch => {
    axios.post(serverUrl + '/api/v1/ticketTransfer', data)
      .then((response) => {
        if (response.status === 200) {
          dispatch({
            type: pageTypes.TICKET_TRANSFER,
            payload: {
              transferTicket: response
            }
          });
          dispatch(getAllIssues(data))
        }
        else {
          dispatch(setLoginError(response.data.message))
        }

      })
  })
}


//Getting All issue types
export function getAllIssueTypes() {
  return (dispatch => {
    axios.get(serverUrl + '/api/v1/getAllIssueTypes')
      .then((response) => {
        // console.log(response)
        if (response.status === 200) {
          dispatch({
            type: pageTypes.GET_ALLISSUETYPES,
            payload: {
              issueType: response.data.data
            }
          });
          // dispatch(getAllIssues(data))
        }
        else {
          dispatch(setLoginError(response.data.message))
        }

      })
  })
}

//adding  issue
export function addIssue(data) {
  return (dispatch => {
    axios.post(serverUrl + '/api/v1/addIssue', data)
      .then((response) => {
        if (response.status === 200) {
          dispatch({
            type: pageTypes.ADD_ISSUE,
            payload: {
              addIssueData: response
            }
          });
          dispatch(getAllIssueTypes())
        }
        else {
          dispatch(setLoginError(response.data.message))
        }

      })
  })
}
//delete issue
export function deleteIssue(data) {
  return (dispatch => {
    axios.post(serverUrl + '/api/v1/DELETEISSUE', data)
      .then((response) => {
        if (response.status === 200) {
          dispatch({
            type: pageTypes.DELETE_ISSUE,
            payload: {
              deleteIssue: response
            }
          });
          dispatch(getAllIssueTypes())
        }
        else {
          dispatch(setLoginError(response.data.message))
        }

      })
  })
}

//mail to user
export function mailToUser(data) {
  return (dispatch => {
    axios.post(serverUrl + '/api/v1/mailToUser', data)
      .then((response) => {
        if (response.status === 200) {
          dispatch({
            type: pageTypes.MAIL_TO_USER,
            payload: {
              userMail: response
            }
          });
        }
        else {
          dispatch(setLoginError(response.data.message))
        }
      })
  })
}
//mail to sme
export function mailToSME(data) {
  return (dispatch => {
    axios.post(serverUrl + '/api/v1/mailToSME', data)
      .then((response) => {
        // if (response.status === 200) {
        //   dispatch({
        //     type: pageTypes.MAIL_TO_SME,
        //     payload: {
        //       SMEMail: response
        //     }
        //   });
        // }
        // else {
        //   dispatch(setLoginError(response.data.message))
        // }
      }).catch(function (err) {

      })
  })
}
export function replyMail(data) {
  return (dispatch => {
    axios.post(serverUrl + '/api/v1/replyMail', data)
      .then((response) => {
        if (response.status === 200) {
          dispatch({
            type: pageTypes.REPLY_MAIL,
            payload: {
              replyMail: response
            }
          });
        }
        else {
          dispatch(setLoginError(response.data.message))
        }
      })
  })
}
//mail for withdrawing ticket
export function withdrawTicketMail(data) {
  return (dispatch => {
    axios.post(serverUrl + '/api/v1/withdrawTicketMail', data)
      .then((response) => {
        if (response.status === 200) {
          dispatch({
            type: pageTypes.WITHDRAW_TICKET_MAIL,
            payload: {
              withdrawMail: response
            }
          });
        }
        else {
          dispatch(setLoginError(response.data.message))
        }
      })
  })
}


//upload dat for sst userlist
export function uploadExcel(data, userData) {
  return (dispatch => {
    axios.post(serverUrl + '/api/v1/uploadExcel', {data, userData})
      .then((response) => {
        if (response.status === 200) {
          dispatch({
            type: pageTypes.UPLOAD,
            payload: {
              excelData: response
            }
          });
        }
        else {
          dispatch(setLoginError(response.data.message))
        }
      })
      .catch(error => {
        dispatch(setLoginError(error));
      });
  })
}

//notification mail
export function notificationMail(data) {
  return (dispatch => {
    axios.post(serverUrl + '/api/v1/notificationMail', { data })
      .then((response) => {
        // console.log(response)
        if (response.status === 200) {
          dispatch({
            type: pageTypes.NOTIFICATION_MAIL,
            payload: {
              notificationMail: response
            }
          });
        }
        else {
          dispatch(setLoginError(response.data.message))
        }
      })
  })
}
export function getUsers(data) {
  return (dispatch => {
    axios.post(serverUrl + '/api/v1/ampUsers', { data })
      .then((response) => {
        if (response.status === 200) {
          dispatch({
            type: pageTypes.AMP_USERS,
            payload: {
              ampUsers: response.data.data
            }
          });
        }
        else {
          dispatch(setLoginError(response.data.message))
        }
      })
  })
}
//upload dat for esync
export function uploadeSyncExcel(eSyncData) {
  return (dispatch => {
    axios.post(serverUrl + '/api/v1/uploadeSyncExcel', eSyncData)
      .then((response) => {
        if (response.status === 200) {
          dispatch({
            type: pageTypes.UPLOAD_ESYNC,
            payload: {
              eSyncexcelData: response
            }
          });
        }
        else {
          dispatch(setLoginError(response.data.message))
        }
      })
      .catch(error => {
        dispatch(setLoginError(error));
      });
  })
}

export function postNotification(data) {
  return (dispatch => {
    axios.post(serverUrl + '/api/v1/postNotification', { data })
      .then((response) => {
        // console.log(response)
        if (response.status === 200) {
          dispatch({
            type: pageTypes.NOTIFICATION_MAIL,
            payload: {
              notificationMail: response
            }
          });
        }
        else {
          dispatch(setLoginError(response.data.message))
        }
      }).catch(err => {
        dispatch(setLoginError(err.message))
      })
  })
}

export function getPopNotification(data) {
  return (dispatch => {
    axios.post(serverUrl + '/api/v1/getPopNotification', { data })
      .then((response) => {
        // console.log(response)
        if (response.status === 200) {
          dispatch({
            type: pageTypes.VERIFY_ISSUE,
            payload: {
              data: response.data
            }
          });
        }
        else {
          dispatch(setLoginError(response.data.message))
        }
      }).catch(err => {
        dispatch(setLoginError(err.message))
      })
  })
}

export function getAllNotification() {
  return (dispatch => {
    axios.get(serverUrl + '/api/v1/allNotification')
      .then((response) => {
        // console.log(response)
        if (response.status === 200) {
          dispatch({
            type: pageTypes.GET_ALL_NOTIFICATION,
            payload: {
              allNotifications: response.data.data
            }
          });
        }
        else {
          dispatch(setLoginError(response.data.message))
        }
      })
  })
}

export const changeMenu = (menu) => {
  return (dispatch) => {
    dispatch({
      type: pageTypes.CHANGE_MENU,
      payload: { menu }
    })
  }
}
export const fetchTicketByNumber = (ticketNumber, data) => {
  return (dispatch) => {
    let ticketStatus = data.length > 0 && ticketNumber !== null ? data.filter(x => x.TICKET_NO === ticketNumber) : [];
    dispatch({
      type: pageTypes.FETCH_TICKET_DETAILS,
      payload: ticketStatus
    })
  }
}

export function slackNotification(data) {
  return (dispatch => {
    axios.post(serverUrl + '/api/v1/slackNotification', { data })
      .then((response) => {
        // console.log(response)
        if (response.status === 200) {
          dispatch({
            type: pageTypes.NOTIFICATION_MAIL,
            payload: {
              notificationMail: response
            }
          });
        }
        else {
          dispatch(setLoginError(response.data.message))
        }
      })
  })
}