import { namespace } from './selector';

export const GET_ALL_USER_LEAVE = `timesheet/${namespace}/GET_ALL_USER_LEAVE`;

export const FETCH_ALL_USER_LEAVE = `timesheet/${namespace}/FETCH_ALL_USER_LEAVE`;

export const UPDATE_USER_LEAVE = `timesheet/${namespace}/UPDATE_USER_LEAVE`;

export const CREATE_ALL_USER_LEAVE = `timesheet/${namespace}/CREATE_ALL_USER_LEAVE`;

export const getAllUserLeave = (result) => ({
  type: GET_ALL_USER_LEAVE,
  payload: { result }
});

export const fetchAllUserLeave = ({ filter, callback }) => ({
  type: FETCH_ALL_USER_LEAVE,
  payload: { filter, callback }
});

export const updateUserLeave = ({ payload, callback }) => ({
  type: UPDATE_USER_LEAVE,
  payload: { payload, callback }
});

export const createAllUserLeave = ({ payload, callback }) => ({
  type: CREATE_ALL_USER_LEAVE,
  payload: { payload, callback }
});
