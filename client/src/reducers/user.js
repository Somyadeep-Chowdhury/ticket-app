import { SET_LOGIN_PENDING, SET_LOGIN_SUCCESS, SET_LOGIN_ERROR, LOGOUT } from '../constants/LoginActionTypes';

const initialState = {
  user_detail: {},
  isLoginSuccess: false,
  isLoginPending: false,
  isLoginError: null,
  getAccountData: [],
  excelData: [],
  error: '',
  getNames: [],
  Success: false,
};

export const user = (state = initialState, action) => {

  switch (action.type) {
    case SET_LOGIN_PENDING:
      return {
        ...state,
        isLoginPending: true,
        isLoginError: null
      };
    case SET_LOGIN_SUCCESS:
      return {
        ...state,
        isLoginSuccess: true,
        Success: true,
        user_details: action.payload.data,
        isLoginError: null,
        isLoginPending: false
      }
    case SET_LOGIN_ERROR:
      return {
        ...state,
        isLoginPending: true,
        isLoginError: action.payload.isLoginError,
      };
    case LOGOUT:
      return {
        state
      }


    default:
      // ALWAYS have a default case in a reducer
      return state;
  }

}
