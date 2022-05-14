import { namespace } from './selector';

export const INITIAL_AUTH = `timesheet/${namespace}/initial auth`;
export const LOAD_LOCALSTORAGE_SUCCESS = `timesheet/${namespace}/loaded storage`;
export const REQUEST_SIGNUP = `timesheet/${namespace}/request signup`;
export const START_SIGNUP = `timesheet/${namespace}/start signup`;
export const SIGNUP_SUCCESS = `timesheet/${namespace}/signup success`;
export const SIGNUP_ERROR = `timesheet/${namespace}/signup error`;
export const REQUEST_SIGNIN = `timesheet/${namespace}/request signin`;
export const REQUEST_LOGOUT = `timesheet/${namespace}/request logout`;
export const START_SIGNIN = `timesheet/${namespace}/start signin`;
export const SIGNIN_SUCCESS = `timesheet/${namespace}/signin success`;
export const LOGOUT_SUCCESS = `timesheet/${namespace}/logout success`;
export const SIGNIN_ERROR = `timesheet/${namespace}/signin error`;
export const AUTHEN_UPDATE = `timesheet/${namespace}AUTHEN_UPDATE`;
export const REQUEST_VERIFY = `timesheet/${namespace}/request verify`;
export const START_VERIFY = `timesheet/${namespace}/start verify`;
export const VERIFY_SUCCESS = `timesheet/${namespace}/verify success`;
export const VERIFY_ERROR = `timesheet/${namespace}/verify error`;
export const REQUEST_FORGOT = `timesheet/${namespace}/request forgot`;
export const START_FORGOT = `timesheet/${namespace}/start forgot`;
export const FORGOT_SUCCESS = `timesheet/${namespace}/forgot success`;
export const FORGOT_ERROR = `timesheet/${namespace}/forgot error`;
export const REQUEST_UPDATEPASS = `timesheet/${namespace}/request updatepass`;
export const START_UPDATEPASS = `timesheet/${namespace}/start updatepass`;
export const UPDATEPASS_SUCCESS = `timesheet/${namespace}/updatepass success`;
export const UPDATEPASS_ERROR = `timesheet/${namespace}/updatepass error`;
export const SAVE_INFO_AUTHEN = `timesheet/${namespace}/save info authentication`;
export const REMOVE_INFO_AUTHEN = `timesheet/${namespace}/save info authentication`;
export const REQUEST_SIGNIN_BY_BIOMETRIC = `timesheet/${namespace}/REQUEST_SIGNIN_BY_BIOMETRIC`;
export const REQUEST_REGISTER_BIOMETRIC = `timesheet/${namespace}/REQUEST_REGISTER_BIOMETRIC`;

export const initialAuth = (auth) => ({
  type: INITIAL_AUTH,
  payload: {
    auth,
  },
});

export const authenUpdate = (auth) => ({
  type: AUTHEN_UPDATE,
  payload: {
    auth,
  },
});

export const loadedLocalStorage = () => ({
  type: LOAD_LOCALSTORAGE_SUCCESS,
});

export const requestSignIn = (user, callback) => ({
  type: REQUEST_SIGNIN,
  payload: {
    user,
    callback,
  },
});

export const requestSignInByBiometric = (user, callback) => ({
  type: REQUEST_SIGNIN_BY_BIOMETRIC,
  payload: {
    user,
    callback,
  },
});

export const requestRegisterByBiometric = ({ faces, callback }) => ({
  type: REQUEST_REGISTER_BIOMETRIC,
  payload: {
    faces,
    callback,
  },
});

export const requestLogout = (callback) => ({
  type: REQUEST_LOGOUT,
  payload: {
    callback,
  },
});

export const startSignin = () => ({
  type: START_SIGNIN,
});

export const signinSuccess = (data) => ({
  type: SIGNIN_SUCCESS,
  payload: {
    data,
  },
});

export const logoutSuccess = () => ({
  type: LOGOUT_SUCCESS,
});

export const signinError = (errorMessage) => ({
  type: SIGNIN_ERROR,
  payload: {
    errorMessage,
  },
});

export const requestSignup = (user, callback) => ({
  type: REQUEST_SIGNUP,
  payload: {
    user,
    callback,
  },
});

export const startSignup = () => ({
  type: START_SIGNUP,
});

export const signupSuccess = (user) => ({
  type: SIGNUP_SUCCESS,
  payload: {
    user,
  },
});

export const signupError = (errorMessage) => ({
  type: SIGNUP_ERROR,
  payload: {
    errorMessage,
  },
});

export const requestVerify = (token, callback) => ({
  type: REQUEST_VERIFY,
  payload: {
    token,
    callback,
  },
});

export const startVerify = () => ({
  type: START_VERIFY,
});

export const verifySuccess = (user) => ({
  type: VERIFY_SUCCESS,
  payload: {
    user,
  },
});

export const verifyError = (errorMessage) => ({
  type: VERIFY_ERROR,
  payload: {
    errorMessage,
  },
});

export const requestForgot = (email, callback) => ({
  type: REQUEST_FORGOT,
  payload: {
    email,
    callback,
  },
});

export const startForgot = () => ({
  type: START_FORGOT,
});

export const forgotSuccess = (user) => ({
  type: FORGOT_SUCCESS,
  payload: {
    user,
  },
});

export const forgotError = (errorMessage) => ({
  type: FORGOT_ERROR,
  payload: {
    errorMessage,
  },
});

export const requestUpdatePass = ({ password, token }, callback) => ({
  type: REQUEST_UPDATEPASS,
  payload: {
    password,
    token,
    callback,
  },
});

export const startUpdatePass = () => ({
  type: START_UPDATEPASS,
});

export const updatePassSuccess = (user) => ({
  type: UPDATEPASS_SUCCESS,
  payload: {
    user,
  },
});

export const updatePassError = (errorMessage) => ({
  type: UPDATEPASS_ERROR,
  payload: {
    errorMessage,
  },
});

export const saveInfoAuthen = (token) => ({
  type: SAVE_INFO_AUTHEN,
  payload: {
    token,
  },
});
export const removeInfoAuthen = () => ({
  type: REMOVE_INFO_AUTHEN,

});
