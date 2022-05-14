import * as actions from './actions';

const initialState = {
  stream: null,
  badgeNumber: '',
  verifying: false,
  verifyingURL: null
};

export function verifyReducer(state = initialState, action) {
  switch (action.type) {
    case actions.SET_STREAM:
      return {
        ...state,
        stream: action.payload.stream || null
      };
    // case actions.START_VERIFYING:
    //   return {
    //     ...state,
    //     badgeNumber: action.payload.badgeNumber || {},
    //   };
    case actions.DETECT_VERIFY_STATUS:
      return {
        ...state,
        verifying: action.payload.verifying || {},
        verifyingURL: action.payload.verifyingURL
      };
    default:
      return state;
  }
}
