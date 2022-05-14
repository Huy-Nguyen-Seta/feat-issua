import { namespace } from './selector';

export const REQUEST_GET_CURRENT_USER = `timesheet/${namespace}/REQUEST_GET_CURRENT_USER`;

export const GET_CURRENT_USER_DONE = `timesheet/${namespace}/GET_CURRENT_USER_DONE`;
export const REMOVE_CURRENT_USER = `timesheet/${namespace}/REMOVE_CURRENT_USER`;
export const SET_CURRENT_USER = `timesheet/${namespace}/SET_CURRENT_USER`;

export const REQUEST_UPDATE_USER = `timesheet/${namespace}/REQUEST_UPDATE_USER`;

export const REQUEST_GET_LIST_USER = `timesheet/${namespace}/REQUEST_GET_LIST_USER`;
export const GET_LIST_USER_RESULT = `timesheet/${namespace}/GET_LIST_USER_RESULT`;
export const GET_LIST_USER_DONE = `timesheet/${namespace}/GET_LIST_USER_DONE`;

export const REQUEST_GET_LIST_ROLE = `timesheet/${namespace}/REQUEST_GET_LIST_ROLE`;
export const GET_LIST_ROLE_RESULT = `timesheet/${namespace}/GET_LIST_ROLE_RESULT`;
export const GET_LIST_ROLE_DONE = `timesheet/${namespace}/GET_LIST_ROLE_DONE`;

export const REQUEST_GET_LIST_MANAGER = `timesheet/${namespace}/REQUEST_GET_LIST_MANAGER`;
export const GET_LIST_MANAGER_RESULT = `timesheet/${namespace}/GET_LIST_MANAGER_RESULT`;
export const GET_LIST_MANAGER_DONE = `timesheet/${namespace}/GET_LIST_MANAGER_DONE`;

export const POST_USER_REQUEST = `timesheet/${namespace}/POST_USER_REQUEST`;
export const PUT_USER_REQUEST = `timesheet/${namespace}/PUT_USER_REQUEST`;

export const GET_USER_WORKTIME_HISTORY = `timesheet/${namespace}/GET_USER_WORKTIME_HISTORY`;

export const POST_USER_WORKTIME_REQUEST = `timesheet/${namespace}/POST_USER_WORKTIME_REQUEST`;
export const PUT_USER_WORKTIME_REQUEST = `timesheet/${namespace}/PUT_USER_WORKTIME_REQUEST`;
export const DELETE_USER_WORKTIME_REQUEST = `timesheet/${namespace}/DELETE_USER_WORKTIME_REQUEST`;

export const GET_MANAGER_REQUEST_COUNT = `timesheet/${namespace}/GET_MANAGER_REQUEST_COUNT`;
export const GET_MANAGER_REQUEST_COUNT_RESULT = `timesheet/${namespace}/GET_MANAGER_REQUEST_COUNT_RESULT`;

export const PUT_USER_PASSWORD_REQUEST = `timesheet/${namespace}/PUT_USER_PASSWORD_REQUEST`;

export const requestGetCurrentUser = () => ({
  type: REQUEST_GET_CURRENT_USER
});

export const removeCurrentUser = () => ({
  type: REMOVE_CURRENT_USER
});

export const getCurrentUserDone = () => ({
  type: GET_CURRENT_USER_DONE
});

export const updateUser = (user) => ({
  type: REQUEST_UPDATE_USER,
  payload: {
    user
  }
});

export const setCurrentUser = (user) => ({
  type: SET_CURRENT_USER,
  payload: {
    user
  }
});

export const requestGetListUser = ({ filter, callback }) => ({
  type: REQUEST_GET_LIST_USER,
  payload: { filter, callback }
});

export const getListUserResult = (result) => ({
  type: GET_LIST_USER_RESULT,
  payload: { result }
});

export const getListUserDone = () => ({
  type: GET_LIST_USER_DONE,
});

export const requestGetListRole = ({ filter, callback }) => ({
  type: REQUEST_GET_LIST_ROLE,
  payload: { filter, callback }
});

export const getListRoleResult = (result) => ({
  type: GET_LIST_ROLE_RESULT,
  payload: { result }
});

export const getListRoleDone = () => ({
  type: GET_LIST_ROLE_DONE,
});
export const requestGetListManager = ({ filter, callback }) => ({
  type: REQUEST_GET_LIST_MANAGER,
  payload: { filter, callback }
});

export const getListManagerResult = (result) => ({
  type: GET_LIST_MANAGER_RESULT,
  payload: { result }
});

export const getListManagerDone = () => ({
  type: GET_LIST_MANAGER_DONE,
});

export const requestPostUser = ({ payload, callback }) => ({
  type: POST_USER_REQUEST,
  payload: {
    payload,
    callback
  }

});

export const requestPutUser = ({ payload, callback }) => ({
  type: PUT_USER_REQUEST,
  payload: {
    payload,
    callback
  }

});

export const getUserWorktimeHistory = ({ filter, callback }) => ({
  type: GET_USER_WORKTIME_HISTORY,
  payload: {
    filter,
    callback
  }

});

export const requestPostUserWorktime = ({ payload, callback }) => ({
  type: POST_USER_WORKTIME_REQUEST,
  payload: {
    payload,
    callback
  }
});

export const requestPutUserWorktime = ({ payload, callback }) => ({
  type: PUT_USER_WORKTIME_REQUEST,
  payload: {
    payload,
    callback
  }
});

export const requestDeleteUserWorktime = ({ payload, callback }) => ({
  type: DELETE_USER_WORKTIME_REQUEST,
  payload: {
    payload,
    callback
  }
});

export const getManagerRequestCount = () => ({
  type: GET_MANAGER_REQUEST_COUNT,

});

export const getManagerRequestCountResult = (result) => ({
  type: GET_MANAGER_REQUEST_COUNT_RESULT,
  payload: result
});

export const requestPutUserPassword = ({ payload, callback }) => ({
  type: PUT_USER_PASSWORD_REQUEST,
  payload: {
    payload,
    callback
  }

});
