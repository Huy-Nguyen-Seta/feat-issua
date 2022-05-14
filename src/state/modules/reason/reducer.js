import * as actions from './actions';

const initialState = {
  reasonList: [],
};

export function reasonReducer(state = initialState, action) {
  switch (action.type) {
    case actions.GET_REQUEST_REASON_RESULT:
      return ({
        ...state,
        reasonList: action.payload.data
      });

    default:
      return state;
  }
}
