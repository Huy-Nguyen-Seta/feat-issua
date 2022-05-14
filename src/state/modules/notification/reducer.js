import * as actions from './actions';

const initialState = {
  showing: false,
  message: '',
  type: '',
  duration: 1000 // one of type: loading / success / error / normal
};

export function notificationReducer(state = initialState, action) {
  switch (action.type) {
    case actions.SHOW_ACTION:
      return {
        ...state,
        showing: true,
        ...action.payload
      };
    case actions.HIDE_ACTION:
      return {
        ...initialState
      };
    default:
      return state;
  }
}
