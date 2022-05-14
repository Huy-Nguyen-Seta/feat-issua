import { namespace } from './selector';

export const GET_REQUEST_REASON_REQUEST = `timesheet/${namespace}/GET_REQUEST_REASON_REQUEST`;
export const GET_REQUEST_REASON_REQUEST_ALL = `timesheet/${namespace}/GET_REQUEST_REASON_REQUEST_ALL`;
export const GET_REQUEST_REASON_RESULT = `timesheet/${namespace}/GET_REQUEST_REASON_RESULT`;
export const GET_REQUEST_REASON_DONE = `timesheet/${namespace}/GET_REQUEST_REASON_DONE`;

export const POST_REQUEST_REASON_REQUEST = `timesheet/${namespace}/POST_REQUEST_REASON_REQUEST`;

export const PUT_REQUEST_REASON_REQUEST = `timesheet/${namespace}/PUT_REQUEST_REASON_REQUEST`;

export const DELETE_REQUEST_REASON_REQUEST = `timesheet/${namespace}/DELETE_REQUEST_REASON_REQUEST`;

export const requestGetRequestReasonAll = ({ filter, callback }) => ({
  type: GET_REQUEST_REASON_REQUEST_ALL,
  payload: { filter, callback }
});

export const resultGetRequestReason = (res) => ({
  type: GET_REQUEST_REASON_RESULT,
  payload: res
});

export const doneGetRequestReason = () => ({
  type: GET_REQUEST_REASON_DONE
});

export const requestGetRequestReason = ({ filter, callback }) => ({
  type: GET_REQUEST_REASON_REQUEST,
  payload: { filter, callback }
});

export const requestPostRequestReason = ({ payload, callback }) => ({
  type: POST_REQUEST_REASON_REQUEST,
  payload,
  callback
});

export const requestPutRequestReason = ({ id, payload, callback }) => ({
  type: PUT_REQUEST_REASON_REQUEST,
  payload: { id, payload, callback }
});

export const requestDeleteRequestReason = ({ payload, callback }) => ({
  type: DELETE_REQUEST_REASON_REQUEST,
  payload: { payload, callback }
});
