import * as actions from './actions';

const initialState = {};

export function configReducer(state = initialState, action) {
  switch (action.type) {
    case actions.SET_CONFIG:
      return {
        ...state,
        ...action.payload.config
      };
    default:
      return state;
  }
}
