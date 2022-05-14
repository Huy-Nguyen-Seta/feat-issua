import {
  all,
  takeLatest,
  put,
  select,
  call
} from 'redux-saga/effects';
import { stringify } from 'query-string';

import * as userLeaveActions from './actions';
import { configSelector } from '../config/selector';
import {
  getApi, putApi, postApi
} from '../../../api/apiHelper';

function* fetchAllUserLeave({ payload: { filter, callback } }) {
  const { serverURL, apiRoute } = yield select(configSelector);
  const response = yield call(getApi, { apiRoot: serverURL, apiRoute: `${apiRoute.getUserLeave}?${stringify(filter)}` });
  yield put(userLeaveActions.getAllUserLeave(response));
  if (callback) callback(response);
}

function* updateUserLeave({ payload: { payload, callback } }) {
  const { serverURL, apiRoute } = yield select(configSelector);

  const response = yield call(putApi, {
    apiRoot: serverURL,
    apiRoute: `${apiRoute.updateUserLeave}`,
    payloadData: payload
  });
  if (callback) callback(response);
}

function* createAllUserLeave({ payload: { payload, callback } }) {
  const { serverURL, apiRoute } = yield select(configSelector);

  const response = yield call(postApi, {
    apiRoot: serverURL,
    apiRoute: `${apiRoute.createLeave}`,
    payloadData: payload
  });
  if (callback) callback(response);
}

export function* sagaFlow() {
  yield all([
    takeLatest(userLeaveActions.FETCH_ALL_USER_LEAVE, fetchAllUserLeave),
    takeLatest(userLeaveActions.UPDATE_USER_LEAVE, updateUserLeave),
    takeLatest(userLeaveActions.CREATE_ALL_USER_LEAVE, createAllUserLeave)
  ]);
}
