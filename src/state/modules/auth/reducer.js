import * as actions from './actions';

const initialState = {
  isAuthenticated: false,
};

export function authReducer(state = initialState, { type, }) {
  switch (type) {
    case actions.SAVE_INFO_AUTHEN:
      return {
        isAuthenticated: true,
      };
    case actions.REMOVE_INFO_AUTHEN:
      return {
        isAuthenticated: false,
      };
    default:
      return state;
  }
}
