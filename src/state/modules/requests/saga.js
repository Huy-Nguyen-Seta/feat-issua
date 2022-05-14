import {
  call, select, put, all, takeLatest
} from 'redux-saga/effects';
import { stringify } from 'query-string';
import {
  getApi, postApi, putApi, deleteApi
} from '../../../api/apiHelper';
import { configSelector } from '../config/selector';
import * as leaveActions from './actions';

export function* requestGetRequestsSaga({ payload: { filter, callback } }) {
  const { serverURL, apiRoute } = yield select(configSelector);
  const request = yield call(getApi, { apiRoot: serverURL, apiRoute: `${apiRoute.request}?${stringify(filter, { arrayFormat: 'bracket' })}` });
  yield put(leaveActions.resultGetRequests(request));
  if (callback) callback(request);
}

export function* requestGetAllRequestsForAdminSaga({ payload: { filter, callback } }) {
  const { serverURL, apiRoute } = yield select(configSelector);
  const request = yield call(getApi, { apiRoot: serverURL, apiRoute: `${apiRoute.requestForAdmin}?${stringify(filter, { arrayFormat: 'bracket' })}` });
  if (callback) callback(request);
}

export function* requestGetRequestsForManager({ payload: { filter, callback } }) {
  const { serverURL, apiRoute } = yield select(configSelector);
  const request = yield call(getApi, { apiRoot: serverURL, apiRoute: `${apiRoute.requestForManager}?${stringify(filter, { arrayFormat: 'bracket' })}` });
  if (callback) callback(request);
}

export function* requestPostRequestsSaga({ payload, callback }) {
  const { serverURL, apiRoute } = yield select(configSelector);
  const request = yield call(postApi, {
    apiRoot: serverURL, apiRoute: apiRoute.request, payloadData: payload
  });
  if (callback) callback(request);
}

export function* requestPostLeaveRequestsSaga({ payload, callback }) {
  const { serverURL, apiRoute } = yield select(configSelector);
  const request = yield call(postApi, {
    apiRoot: serverURL, apiRoute: apiRoute.leaveRequest, payloadData: payload
  });
  if (callback) callback(request);
}

export function* requestPostForgetRequestsSaga({ payload, callback }) {
  const { serverURL, apiRoute } = yield select(configSelector);
  const request = yield call(postApi, {
    apiRoot: serverURL, apiRoute: apiRoute.forgetRequest, payloadData: payload
  });
  if (callback) callback(request);
}

export function* requestPostCompensationRequestsSaga({ payload, callback }) {
  const { serverURL, apiRoute } = yield select(configSelector);
  const request = yield call(postApi, {
    apiRoot: serverURL, apiRoute: apiRoute.compensationRequest, payloadData: payload
  });
  if (callback) callback(request);
}

export function* requestPutRequestLeaveSaga({ payload: { id, payload, callback } }) {
  const { serverURL, apiRoute } = yield select(configSelector);
  const request = yield call(putApi, { apiRoot: serverURL, apiRoute: `${apiRoute.leaveRequest}/${id}`, payloadData: payload });
  if (callback) callback(request);
}

export function* requestPutRequestForgetSaga({ payload: { id, payload, callback } }) {
  const { serverURL, apiRoute } = yield select(configSelector);
  const request = yield call(putApi, { apiRoot: serverURL, apiRoute: `${apiRoute.forgetRequest}/${id}`, payloadData: payload });
  if (callback) callback(request);
}

export function* requestPutRequestCompensationSaga({ payload: { id, payload, callback } }) {
  const { serverURL, apiRoute } = yield select(configSelector);
  const request = yield call(putApi, { apiRoot: serverURL, apiRoute: `${apiRoute.compensationRequest}/${id}`, payloadData: payload });
  if (callback) callback(request);
}

export function* requestCheckDayleavesSaga({ payload: { filter, callback } }) {
  const { serverURL, apiRoute } = yield select(configSelector);
  const request = yield call(getApi, { apiRoot: serverURL, apiRoute: `${apiRoute.checkLeaveRequest}?${stringify(filter)}` });
  if (callback) callback(request);
}

export function* requestCheckRequestSaga({ payload: { filter, callback } }) {
  const { serverURL, apiRoute } = yield select(configSelector);
  const request = yield call(getApi, { apiRoot: serverURL, apiRoute: `${apiRoute.checkRequest}?${stringify(filter)}` });
  if (callback) callback(request);
}

export function* requestCheckRequestCompSaga({ payload: { filter, callback } }) {
  const { serverURL, apiRoute } = yield select(configSelector);
  const request = yield call(getApi, { apiRoot: serverURL, apiRoute: `${apiRoute.checkCompRequest}?${stringify(filter)}` });
  if (callback) callback(request);
}

export function* requestCheckForgetSaga({ payload: { filter, callback } }) {
  const { serverURL, apiRoute } = yield select(configSelector);
  const request = yield call(getApi, { apiRoot: serverURL, apiRoute: `${apiRoute.checkForgetRequest}?${stringify(filter)}` });
  if (callback) callback(request);
}

export function* requestGetLeaveInfo({ payload: { payload, callback } }) {
  const { serverURL, apiRoute } = yield select(configSelector);
  const request = yield call(getApi, { apiRoot: serverURL, apiRoute: `${apiRoute.request}/${payload.id}` });
  if (callback) callback(request);
}

export function* requestDeleteRequestSaga({ payload: { payload, callback } }) {
  const { serverURL, apiRoute } = yield select(configSelector);
  const request = yield call(deleteApi, { apiRoot: serverURL, apiRoute: `${apiRoute.request}/${payload.id}` });
  if (callback) callback(request);
}

export function* requestGetRequestTypeSaga({ payload: { callback } }) {
  const { serverURL, apiRoute } = yield select(configSelector);
  const request = yield call(getApi, { apiRoot: serverURL, apiRoute: `${apiRoute.requestType}` });
  if (callback) callback(request);
}

export function* sagaFlow() {
  yield all([
    takeLatest(leaveActions.GET_REQUEST_REQUEST, requestGetRequestsSaga),
    takeLatest(leaveActions.POST_REQUEST_REQUEST, requestPostRequestsSaga),

    takeLatest(leaveActions.POST_LEAVE_REQUEST, requestPostLeaveRequestsSaga),
    takeLatest(leaveActions.POST_FORGET_REQUEST, requestPostForgetRequestsSaga),
    takeLatest(leaveActions.POST_COMPENSATION_REQUEST, requestPostCompensationRequestsSaga),

    takeLatest(leaveActions.PUT_REQUEST_LEAVE_REQUEST, requestPutRequestLeaveSaga),
    takeLatest(leaveActions.PUT_REQUEST_FORGET_REQUEST, requestPutRequestForgetSaga),
    takeLatest(leaveActions.PUT_REQUEST_COMPENSATION_REQUEST, requestPutRequestCompensationSaga),

    takeLatest(leaveActions.GET_REQUEST_FOR_MANAGER, requestGetRequestsForManager),
    takeLatest(leaveActions.CHECK_DAYLEAVE_REQUEST, requestCheckDayleavesSaga),
    takeLatest(leaveActions.GET_LEAVE_INFO_REQUEST, requestGetLeaveInfo),
    takeLatest(leaveActions.CHECK_REQUEST, requestCheckRequestSaga),
    takeLatest(leaveActions.REQUEST_DELETE_REQUEST, requestDeleteRequestSaga),
    takeLatest(leaveActions.CHECK_FORGET_REQUEST, requestCheckForgetSaga),
    takeLatest(leaveActions.GET_REQUEST_TYPE_REQUEST, requestGetRequestTypeSaga),
    takeLatest(leaveActions.GET_ALL_REQUEST_BY_ADMIN_REQUEST, requestGetAllRequestsForAdminSaga),
    takeLatest(leaveActions.CHECK_COMP_REQUEST, requestCheckRequestCompSaga),

  ]);
}
