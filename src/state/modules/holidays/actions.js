import { namespace } from './selector';

export const GET_HOLIDAY_REQUEST = `timesheet/${namespace}/GET_HOLIDAY_REQUEST`;
export const GET_HOLIDAY_RESULT = `timesheet/${namespace}/GET_HOLIDAY_RESULT`;
export const GET_HOLIDAY_DONE = `timesheet/${namespace}/GET_HOLIDAY_DONE`;

export const GET_HOLIDAY_REQUEST_UNSAVE = `timesheet/${namespace}/GET_HOLIDAY_REQUEST_UNSAVE`;

export const POST_HOLIDAY_REQUEST = `timesheet/${namespace}/POST_HOLIDAY_REQUEST`;

export const PUT_HOLIDAY_REQUEST = `timesheet/${namespace}/PUT_HOLIDAY_REQUEST`;

export const DELETE_HOLIDAY_REQUEST = `timesheet/${namespace}/DELETE_HOLIDAY_REQUEST`;

export const requestGetHoliday = ({ filter, callback }) => ({
  type: GET_HOLIDAY_REQUEST,
  payload: { filter, callback }
});

export const requestGetHolidayUnsave = ({ filter, callback }) => ({
  type: GET_HOLIDAY_REQUEST_UNSAVE,
  payload: { filter, callback }
});
export const resultGetHoliday = (res) => ({
  type: GET_HOLIDAY_RESULT,
  payload: res
});

export const doneHoliday = () => ({
  type: GET_HOLIDAY_DONE
});

export const requestPostHoliday = ({ payload, callback }) => ({
  type: POST_HOLIDAY_REQUEST,
  payload,
  callback
});

export const requestPutHoliday = ({ id, payload, callback }) => ({
  type: PUT_HOLIDAY_REQUEST,
  payload: { id, payload, callback }
});

export const requestDeleteHoliday = ({ payload, callback }) => ({
  type: DELETE_HOLIDAY_REQUEST,
  payload: { payload, callback }
});
