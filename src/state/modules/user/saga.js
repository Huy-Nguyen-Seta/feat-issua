import {
  all,
  takeLatest,
  put,
  select,
  call
} from 'redux-saga/effects';
import { stringify } from 'query-string';

import * as userActions from './actions';
import * as authActions from '../auth/actions';
import { configSelector } from '../config/selector';
import {
  deleteApi, getApi, postApi, putApi
} from '../../../api/apiHelper';

function* getCurrentUser() {
  const { serverURL, apiRoute } = yield select(configSelector);
  const request = yield call(getApi, { apiRoot: serverURL, apiRoute: apiRoute.getUserInfo });
  if (request && request.data) {
    yield put(authActions.saveInfoAuthen());
    yield put(userActions.setCurrentUser(request.data));
  }
  yield put(userActions.getCurrentUserDone());
}

function* getListUsers({ payload: { filter, callback } }) {
  const { serverURL, apiRoute } = yield select(configSelector);
  const request = yield call(getApi, { apiRoot: serverURL, apiRoute: `${apiRoute.getUserForAdmin}?${stringify(filter)}` });
  yield put(userActions.getListUserResult(request));
  yield put(userActions.getListUserDone(request));
  if (callback) callback(request);
}

function* getListRoles({ payload: { callback } }) {
  const { serverURL, apiRoute } = yield select(configSelector);
  const request = yield call(getApi, { apiRoot: serverURL, apiRoute: apiRoute.role });
  yield put(userActions.getListRoleResult(request));
  yield put(userActions.getListRoleDone(request));
  if (callback) callback(request);
}

function* getListManagers({ payload: { callback } }) {
  const { serverURL, apiRoute } = yield select(configSelector);
  const request = yield call(getApi, { apiRoot: serverURL, apiRoute: apiRoute.manager });
  yield put(userActions.getListManagerResult(request));
  yield put(userActions.getListManagerDone(request));
  if (callback) callback(request);
}

function* requestPostUser({ payload: { payload, callback } }) {
  const { serverURL, apiRoute } = yield select(configSelector);
  const request = yield call(postApi, {
    apiRoot: serverURL, apiRoute: apiRoute.register, payloadData: payload
  });
  if (callback) callback(request);
}

function* requestPutUser({ payload: { payload, callback } }) {
  const { serverURL, apiRoute } = yield select(configSelector);
  const request = yield call(putApi, {
    apiRoot: serverURL, apiRoute: `${apiRoute.user}/${payload.id}`, payloadData: payload
  });
  if (callback) callback(request);
}

function* getUserWorktimeHistorySaga({ payload: { filter, callback } }) {
  const { serverURL, apiRoute } = yield select(configSelector);
  const request = yield call(getApi, {
    apiRoot: serverURL, apiRoute: `${apiRoute.workTime}?${stringify(filter)}`
  });
  if (callback) callback(request);
}

function* requestPostUserWorktimeSaga({ payload: { payload, callback } }) {
  const { serverURL, apiRoute } = yield select(configSelector);
  const request = yield call(postApi, {
    apiRoot: serverURL, apiRoute: apiRoute.workTime, payloadData: payload
  });
  if (callback) callback(request);
}

function* requestPutUserWorktimeSaga({ payload: { payload, callback } }) {
  const { serverURL, apiRoute } = yield select(configSelector);
  const payloadData = { ...payload };
  delete payloadData.id;
  const request = yield call(putApi, {
    apiRoot: serverURL, apiRoute: `${apiRoute.workTime}/${payload.id}`, payloadData
  });
  if (callback) callback(request);
}

function* requestDeleteUserWorktimeSaga({ payload: { payload, callback } }) {
  const { serverURL, apiRoute } = yield select(configSelector);
  const request = yield call(deleteApi, {
    apiRoot: serverURL, apiRoute: `${apiRoute.workTime}/${payload.id}`
  });
  if (callback) callback(request);
}

function* getManagerRequestCountSaga() {
  const { serverURL, apiRoute } = yield select(configSelector);

  const request = yield call(getApi, {
    apiRoot: serverURL, apiRoute: `${apiRoute.countRequestForManager}`
  });
  if (request && request.data) {
    yield put(userActions.getManagerRequestCountResult(request));
  }
}

function* requestPutUserPasswordSaga({ payload: { payload, callback } }) {
  const { serverURL, apiRoute } = yield select(configSelector);
  const request = yield call(putApi, {
    apiRoot: serverURL, apiRoute: `${apiRoute.password}`, payloadData: payload
  });
  if (callback) callback(request);
}

export function* sagaFlow() {
  yield all([
    takeLatest(userActions.REQUEST_GET_CURRENT_USER, getCurrentUser),
    takeLatest(userActions.REQUEST_GET_LIST_USER, getListUsers),
    takeLatest(userActions.REQUEST_GET_LIST_ROLE, getListRoles),
    takeLatest(userActions.REQUEST_GET_LIST_MANAGER, getListManagers),
    takeLatest(userActions.POST_USER_REQUEST, requestPostUser),
    takeLatest(userActions.PUT_USER_REQUEST, requestPutUser),
    takeLatest(userActions.GET_USER_WORKTIME_HISTORY, getUserWorktimeHistorySaga),
    takeLatest(userActions.POST_USER_WORKTIME_REQUEST, requestPostUserWorktimeSaga),
    takeLatest(userActions.PUT_USER_WORKTIME_REQUEST, requestPutUserWorktimeSaga),
    takeLatest(userActions.DELETE_USER_WORKTIME_REQUEST, requestDeleteUserWorktimeSaga),
    takeLatest(userActions.GET_MANAGER_REQUEST_COUNT, getManagerRequestCountSaga),
    takeLatest(userActions.PUT_USER_PASSWORD_REQUEST, requestPutUserPasswordSaga),

  ]);
}
