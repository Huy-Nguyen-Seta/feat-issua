import * as actions from './actions';

const initialState = {
  isBooting: false,
  bootDidFinish: false
};

export function appReducer(state = initialState, action) {
  switch (action.type) {
    case actions.BOOTING:
      return {
        ...state,
        isBooting: true,
        bootDidFinish: false
      };
    case actions.BOOTED:
      return {
        ...state,
        isBooting: false,
        bootDidFinish: true
      };
    default:
      return state;
  }
}
