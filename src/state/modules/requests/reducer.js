import * as actions from './actions';

// import moment from 'moment';

export const statusLeaves = {
  QUEUE: 'new',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  CONFIRMED: 'confirmed'
};

const initialState = { dayLeavesList: [] };

export function dayLeavesReducer(state = initialState, action) {
  switch (action.type) {
    case actions.GET_REQUEST_RESULT:
      return ({
        ...state,
        dayLeavesList: action.payload
      });

    default:
      return state;
  }
}
