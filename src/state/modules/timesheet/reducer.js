// import moment from 'moment';
import * as actions from './actions';

const initialState = {
  timesheetList: [],
  memberTimesheetList: [],
  timesheetListAll: []

};

export function timesheetReducer(state = initialState, action) {
  switch (action.type) {
    case actions.GET_TIMESHEET_RESULT:
      return {
        ...state,
        timesheetList: action.payload.result
      };
    case actions.GET_TIMESHEET_ALL_MEMBER_RESULT:
      return {
        ...state,
        timesheetListAll: action.payload.result
      };
    default:
      return state;
  }
}
