import {
  call, select, put, all, takeLatest
} from 'redux-saga/effects';
import { stringify } from 'query-string';
import { getApi } from '../../../api/apiHelper';
import { configSelector } from '../config/selector';
import * as timesheetActions from './actions';

export function* requestGetTimesheetSaga({ payload: { filter, callback } }) {
  const { serverURL, apiRoute } = yield select(configSelector);
  const request = yield call(getApi, { apiRoot: serverURL, apiRoute: `${apiRoute.timesheet}?${stringify(filter)}` });
  yield put(timesheetActions.resultGetTimesheet(request));
  callback(request);
}

export function* requestGetTimesheetSagaUnSave({ payload: { filter, callback } }) {
  const { serverURL, apiRoute } = yield select(configSelector);
  const request = yield call(getApi, { apiRoot: serverURL, apiRoute: `${apiRoute.timesheet}?${stringify(filter)}` });
  callback(request);
}

export function* requestGetTimesheetAllMemberSaga({ payload: { filter, callback } }) {
  const { serverURL, apiRoute } = yield select(configSelector);
  const request = yield call(getApi, { apiRoot: serverURL, apiRoute: `${apiRoute.memberTimesheet}?${stringify(filter)}` });
  yield put(timesheetActions.resultGetAllMemberTimesheet(request));
  yield put(timesheetActions.doneAllMemberTimesheet());
  callback(request);
}

export function* requestGetTimesheetAllUserSaga({ payload: { filter, callback } }) {
  const { serverURL, apiRoute } = yield select(configSelector);
  const request = yield call(getApi, { apiRoot: serverURL, apiRoute: `${apiRoute.allTimesheet}?${stringify(filter)}` });
  yield put(timesheetActions.resultGetAllUserTimesheet(request));
  yield put(timesheetActions.doneAllUserTimesheet());
  callback(request);
}

export function* requestGetTimesheetExportAllUserSaga({ payload: { filter, callback } }) {
  const { serverURL, apiRoute } = yield select(configSelector);

  const request = yield call(getApi, { apiRoot: serverURL, apiRoute: `${apiRoute.exportTimesheet}?${stringify(filter)}` });
  yield put(timesheetActions.resultGetExportAllUserTimesheet(request));
  yield put(timesheetActions.doneExportAllUserTimesheet());
  callback(request);
}
export function* sagaFlow() {
  yield all([
    takeLatest(timesheetActions.GET_TIMESHEET_REQUEST, requestGetTimesheetSaga),
    takeLatest(timesheetActions.GET_TIMESHEET_REQUEST_UNSAVE, requestGetTimesheetSagaUnSave),
    takeLatest(timesheetActions.GET_TIMESHEET_ALL_MEMBER_REQUEST, requestGetTimesheetAllMemberSaga),
    takeLatest(timesheetActions.GET_TIMESHEET_ALL_USER_REQUEST, requestGetTimesheetAllUserSaga),
    takeLatest(timesheetActions.GET_TIMESHEET_EXPORT_ALL_USER_REQUEST,
      requestGetTimesheetExportAllUserSaga),

  ]);
}
