/* eslint-disable no-case-declarations */
import moment from 'moment';
import * as actions from './actions';
import { roleOrder } from '../../../helper/constants';

const initialState = {
  isLoggedIn: false,
  loginFailed: false,
  loginFailureMessage: false,
  user: {},
  roles: [],
  permissions: [],
  managers: [],
  users: [],
  unapprovedRequest: 0
};

export function userReducer(state = initialState, action) {
  switch (action.type) {
    case actions.REMOVE_CURRENT_USER:
      return {
        ...state,
        user: {}
      };
    case actions.SET_CURRENT_USER:
      const dataUser = action.payload.user;
      const titleIIndex = roleOrder.findIndex((role) => role === dataUser.title);
      return {
        ...state,
        user: {
          ...dataUser,
          fromTime: dataUser.fromTime ? moment.utc(dataUser.fromTime, 'HH:mm:ss').local().format('HH:mm') : '08:30',
          toTime: dataUser.toTime ? moment.utc(dataUser.toTime, 'HH:mm:ss').local().format('HH:mm') : '17:30',
        },
        permissions: roleOrder.slice(0, titleIIndex + 1)
      };
    case actions.GET_LIST_USER_RESULT:
      return {
        ...state,
        users: action.payload.result
      };

    case actions.GET_LIST_ROLE_RESULT:
      return {
        ...state,
        roles: action.payload.result && action.payload.result.data
      };
    case actions.GET_LIST_MANAGER_RESULT:
      return {
        ...state,
        managers: action.payload.result && action.payload.result.data
      };
    case actions.GET_MANAGER_REQUEST_COUNT_RESULT:
      return {
        ...state,
        unapprovedRequest: action.payload && action.payload.data && action.payload.data.count
      };
    default:
      return state;
  }
}
