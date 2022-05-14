import * as actions from './actions';

const initialState = {
  userLeave: []
};

export function userLeaveReducer(state = initialState, { type, payload }) {
  switch (type) {
    case actions.GET_ALL_USER_LEAVE:
      return {
        ...state,
        userLeave: payload.result
      };
    default:
      return state;
  }
}
