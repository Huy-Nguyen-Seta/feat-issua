import {
  call, select, all, takeLatest, put
} from 'redux-saga/effects';
import { stringify } from 'query-string';
import {
  getApi, postApi, putApi, deleteApi
} from '../../../api/apiHelper';
import { configSelector } from '../config/selector';
import * as reasonsActions from './actions';

export function* requestGetRequestReasonSaga({ payload: { filter, callback } }) {
  const { serverURL, apiRoute } = yield select(configSelector);
  const request = yield call(getApi, { apiRoot: serverURL, apiRoute: `${apiRoute.reason}?${stringify(filter)}` });
  yield put(reasonsActions.resultGetRequestReason(request));
  yield put(reasonsActions.doneGetRequestReason(request));
  if (callback) callback(request);
}

export function* requestGetRequestReasonAllSaga({ payload: { callback } }) {
  const { serverURL, apiRoute } = yield select(configSelector);
  const request = yield call(getApi, { apiRoot: serverURL, apiRoute: `${apiRoute.reason}/all` });
  if (callback) callback(request);
}

export function* requestPostRequestReasonSaga({ payload, callback }) {
  const { serverURL, apiRoute } = yield select(configSelector);
  const request = yield call(postApi, {
    apiRoot: serverURL, apiRoute: apiRoute.reason, payloadData: payload
  });
  if (callback) callback(request);
}

export function* requestPutRequestReasonSaga({ payload: { id, payload, callback } }) {
  const { serverURL, apiRoute } = yield select(configSelector);
  const request = yield call(putApi, { apiRoot: serverURL, apiRoute: `${apiRoute.reason}/${id}`, payloadData: payload });
  if (callback) callback(request);
}

export function* requestDeleteRequestReasonSaga({ payload: { payload, callback } }) {
  const { serverURL, apiRoute } = yield select(configSelector);
  const request = yield call(deleteApi, { apiRoot: serverURL, apiRoute: `${apiRoute.reason}/${payload.id}` });
  if (callback) callback(request);
}

export function* sagaFlow() {
  yield all([
    takeLatest(reasonsActions.GET_REQUEST_REASON_REQUEST, requestGetRequestReasonSaga),
    takeLatest(reasonsActions.GET_REQUEST_REASON_REQUEST_ALL, requestGetRequestReasonAllSaga),
    takeLatest(reasonsActions.POST_REQUEST_REASON_REQUEST, requestPostRequestReasonSaga),
    takeLatest(reasonsActions.PUT_REQUEST_REASON_REQUEST, requestPutRequestReasonSaga),
    takeLatest(reasonsActions.DELETE_REQUEST_REASON_REQUEST, requestDeleteRequestReasonSaga),

  ]);
}
