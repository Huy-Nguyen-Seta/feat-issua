import { namespace } from './selector';

export const GET_REQUEST_REQUEST = `timesheet/${namespace}/GET_REQUEST_REQUEST`;
export const GET_REQUEST_RESULT = `timesheet/${namespace}/GET_REQUEST_RESULT`;
export const GET_REQUEST_DONE = `timesheet/${namespace}/GET_REQUEST_DONE`;

export const POST_REQUEST_REQUEST = `timesheet/${namespace}/POST_REQUEST_REQUEST`;

export const POST_LEAVE_REQUEST = `timesheet/${namespace}/POST_LEAVE_REQUEST`;
export const POST_FORGET_REQUEST = `timesheet/${namespace}/POST_FORGET_REQUEST`;
export const POST_COMPENSATION_REQUEST = `timesheet/${namespace}/POST_COMPENSATION_REQUEST`;

export const PUT_REQUEST_LEAVE_REQUEST = `timesheet/${namespace}/PUT_REQUEST_LEAVE_REQUEST`;
export const PUT_REQUEST_FORGET_REQUEST = `timesheet/${namespace}/PUT_REQUEST_FORGET_REQUEST`;

export const GET_REQUEST_FOR_MANAGER = `timesheet/${namespace}/GET_REQUEST_FOR_MANAGER`;

export const PUT_REQUEST_COMPENSATION_REQUEST = `timesheet/${namespace}/PUT_REQUEST_COMPENSATION_REQUEST`;

export const GET_REQUEST_TYPE_REQUEST = `timesheet/${namespace}/GET_REQUEST_TYPE_REQUEST`;

export const CHECK_DAYLEAVE_REQUEST = `timesheet/${namespace}/CHECK_DAYLEAVE_REQUEST`;
export const CHECK_REQUEST = `timesheet/${namespace}/CHECK_REQUEST`;
export const CHECK_FORGET_REQUEST = `timesheet/${namespace}/CHECK_FORGET_REQUEST`;

export const GET_LEAVE_INFO_REQUEST = `timesheet/${namespace}/GET_LEAVE_INFO_REQUEST`;
export const REQUEST_DELETE_REQUEST = `timesheet/${namespace}/REQUEST_DELETE_REQUEST`;

export const GET_ALL_REQUEST_BY_ADMIN_REQUEST = `timesheet/${namespace}/GET_ALL_REQUEST_BY_ADMIN_REQUEST`;

export const CHECK_COMP_REQUEST = `timesheet/${namespace}/CHECK_COMP_REQUEST`;

export const requestGetRequests = ({ filter, callback }) => ({
  type: GET_REQUEST_REQUEST,
  payload: { filter, callback }
});

export const requestGetAllRequestsByAdmin = ({ filter, callback }) => ({
  type: GET_ALL_REQUEST_BY_ADMIN_REQUEST,
  payload: { filter, callback }
});

export const resultGetRequests = (res) => ({
  type: GET_REQUEST_RESULT,
  payload: res
});

export const doneGetRequests = () => ({
  type: GET_REQUEST_DONE
});

export const requestPostRequests = ({ payload, callback }) => ({
  type: POST_REQUEST_REQUEST,
  payload,
  callback
});
export const requestPostLeaveRequests = ({ payload, callback }) => ({
  type: POST_LEAVE_REQUEST,
  payload,
  callback
});
export const requestPostForgetRequests = ({ payload, callback }) => ({
  type: POST_FORGET_REQUEST,
  payload,
  callback
});
export const requestPostCompensationRequests = ({ payload, callback }) => ({
  type: POST_COMPENSATION_REQUEST,
  payload,
  callback
});

export const requestGetRequestType = ({ callback }) => ({
  type: GET_REQUEST_TYPE_REQUEST,
  payload: {
    callback
  }

});

export const requestGetRequestsForManager = ({ filter, callback }) => ({
  type: GET_REQUEST_FOR_MANAGER,
  payload: { filter, callback }
});

export const requestPutRequestsLeave = ({ id, payload, callback }) => ({
  type: PUT_REQUEST_LEAVE_REQUEST,
  payload: { id, payload, callback }
});

export const requestPutRequestsForget = ({ id, payload, callback }) => ({
  type: PUT_REQUEST_FORGET_REQUEST,
  payload: { id, payload, callback }
});

export const requestPutRequestsCompensation = ({ id, payload, callback }) => ({
  type: PUT_REQUEST_COMPENSATION_REQUEST,
  payload: { id, payload, callback }
});

export const requestCheckDayleaves = ({ filter, callback }) => ({
  type: CHECK_DAYLEAVE_REQUEST,
  payload: { filter, callback }
});

export const requestCheckRequest = ({ filter, callback }) => ({
  type: CHECK_REQUEST,
  payload: { filter, callback }
});

export const requestCheckCompRequest = ({ filter, callback }) => ({
  type: CHECK_COMP_REQUEST,
  payload: { filter, callback }
});

export const requestCheckForgetRequest = ({ filter, callback }) => ({
  type: CHECK_FORGET_REQUEST,
  payload: { filter, callback }
});

export const requestGetLeaveInfo = ({ payload, callback }) => ({
  type: GET_LEAVE_INFO_REQUEST,
  payload: { payload, callback }
});

export const requestDeleteRequests = ({ payload, callback }) => ({
  type: REQUEST_DELETE_REQUEST,
  payload: { payload, callback }
});
