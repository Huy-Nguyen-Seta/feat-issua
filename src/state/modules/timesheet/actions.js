import { namespace } from './selector';

export const GET_TIMESHEET_REQUEST = `timesheet/${namespace}/GET_TIMESHEET_REQUEST`;
export const GET_TIMESHEET_RESULT = `timesheet/${namespace}/GET_TIMESHEET_RESULT`;
export const GET_TIMESHEET_DONE = `timesheet/${namespace}/GET_TIMESHEET_DONE`;

export const GET_TIMESHEET_REQUEST_UNSAVE = `timesheet/${namespace}/GET_TIMESHEET_REQUEST_UNSAVE`;

export const GET_TIMESHEET_ALL_MEMBER_REQUEST = `timesheet/${namespace}/GET_TIMESHEET_ALL_MEMBER_REQUEST`;
export const GET_TIMESHEET_ALL_MEMBER_RESULT = `timesheet/${namespace}/GET_TIMESHEET_ALL_MEMBER_RESULT`;
export const GET_TIMESHEET_ALL_MEMBER_DONE = `timesheet/${namespace}/GET_TIMESHEET_ALL_MEMBER_DONE`;

export const GET_TIMESHEET_ALL_USER_REQUEST = `timesheet/${namespace}/GET_TIMESHEET_ALL_USER_REQUEST`;
export const GET_TIMESHEET_ALL_USER_RESULT = `timesheet/${namespace}/GET_TIMESHEET_ALL_USER_RESULT`;
export const GET_TIMESHEET_ALL_USER_DONE = `timesheet/${namespace}/GET_TIMESHEET_ALL_USER_DONE`;

export const GET_TIMESHEET_EXPORT_ALL_USER_REQUEST = `timesheet/${namespace}/GET_TIMESHEET_EXPORT_ALL_USER_REQUEST`;
export const GET_TIMESHEET_EXPORT_ALL_USER_RESULT = `timesheet/${namespace}/GET_TIMESHEET_EXPORT_ALL_USER_RESULT`;
export const GET_TIMESHEET_EXPORT_ALL_USER_DONE = `timesheet/${namespace}/GET_TIMESHEET_EXPORT_ALL_USER_DONE`;

export const requestGetTimesheet = ({ filter, callback }) => ({
  type: GET_TIMESHEET_REQUEST,
  payload: { filter, callback }
});

export const requestGetTimesheetUnsave = ({ filter, callback }) => ({
  type: GET_TIMESHEET_REQUEST_UNSAVE,
  payload: { filter, callback }
});
export const resultGetTimesheet = (res) => ({
  type: GET_TIMESHEET_RESULT,
  payload: res
});

export const doneTimesheet = () => ({
  type: GET_TIMESHEET_DONE
});

export const requestGetAllMemberTimesheet = ({ filter, callback }) => ({
  type: GET_TIMESHEET_ALL_MEMBER_REQUEST,
  payload: { filter, callback }
});

export const resultGetAllMemberTimesheet = (res) => ({
  type: GET_TIMESHEET_ALL_MEMBER_RESULT,
  payload: res
});

export const doneAllMemberTimesheet = () => ({
  type: GET_TIMESHEET_ALL_MEMBER_DONE
});

export const requestGetAllUserTimesheet = ({ filter, callback }) => ({
  type: GET_TIMESHEET_ALL_USER_REQUEST,
  payload: { filter, callback }
});

export const resultGetAllUserTimesheet = (res) => ({
  type: GET_TIMESHEET_ALL_USER_RESULT,
  payload: res
});

export const doneAllUserTimesheet = () => ({
  type: GET_TIMESHEET_ALL_USER_DONE
});

export const requestGetExportAllUserTimesheet = ({ filter, callback }) => ({
  type: GET_TIMESHEET_EXPORT_ALL_USER_REQUEST,
  payload: { filter, callback }
});

export const resultGetExportAllUserTimesheet = (res) => ({
  type: GET_TIMESHEET_EXPORT_ALL_USER_RESULT,
  payload: res
});

export const doneExportAllUserTimesheet = () => ({
  type: GET_TIMESHEET_EXPORT_ALL_USER_DONE
});
