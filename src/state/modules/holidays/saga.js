import {
  call, select, put, all, takeLatest
} from 'redux-saga/effects';
import { stringify } from 'query-string';
import {
  getApi, postApi, putApi, deleteApi
} from '../../../api/apiHelper';
import { configSelector } from '../config/selector';
import * as holidaysActions from './actions';

export function* requestGetHolidaySaga({ payload: { filter, callback } }) {
  const { serverURL, apiRoute } = yield select(configSelector);
  const request = yield call(getApi, { apiRoot: serverURL, apiRoute: `${apiRoute.holiday}?${stringify(filter)}` });
  yield put(holidaysActions.resultGetHoliday(request));
  callback(request);
}

export function* requestGetHolidaySagaUnSave({ payload: { filter, callback } }) {
  const { serverURL, apiRoute } = yield select(configSelector);
  const request = yield call(getApi, { apiRoot: serverURL, apiRoute: `${apiRoute.holiday}?${stringify(filter)}` });
  callback(request);
}

export function* requestPostHolidaySaga({ payload, callback }) {
  const { serverURL, apiRoute } = yield select(configSelector);
  const request = yield call(postApi, {
    apiRoot: serverURL, apiRoute: apiRoute.holiday, payloadData: payload
  });
  if (callback) callback(request);
}

export function* requestPutHolidaySaga({ payload: { id, payload, callback } }) {
  const { serverURL, apiRoute } = yield select(configSelector);
  const request = yield call(putApi, { apiRoot: serverURL, apiRoute: `${apiRoute.holiday}/${id}`, payloadData: payload });
  if (callback) callback(request);
}

export function* requestDeleteHolidaySaga({ payload: { payload, callback } }) {
  const { serverURL, apiRoute } = yield select(configSelector);
  const request = yield call(deleteApi, { apiRoot: serverURL, apiRoute: `${apiRoute.holiday}/${payload.id}` });
  if (callback) callback(request);
}

export function* sagaFlow() {
  yield all([
    takeLatest(holidaysActions.GET_HOLIDAY_REQUEST, requestGetHolidaySaga),
    takeLatest(holidaysActions.GET_HOLIDAY_REQUEST_UNSAVE, requestGetHolidaySagaUnSave),
    takeLatest(holidaysActions.POST_HOLIDAY_REQUEST, requestPostHolidaySaga),
    takeLatest(holidaysActions.PUT_HOLIDAY_REQUEST, requestPutHolidaySaga),
    takeLatest(holidaysActions.DELETE_HOLIDAY_REQUEST, requestDeleteHolidaySaga),

  ]);
}
