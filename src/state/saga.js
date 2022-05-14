import {
  all,
  fork,
  takeEvery,
  put,
  take
} from 'redux-saga/effects';

import { requestGetCurrentUser, GET_CURRENT_USER_DONE } from './modules/user';
import { BOOTING } from './actions';
import { loadLocalStorage } from './modules/auth/saga';
import { bootingApp, bootedApp } from './modules/app';
import { requestSetConfig, SET_CONFIG_DONE } from './modules/config';

import { sagaModules } from './modules/moduler';

function* booting() {
  yield takeEvery(BOOTING, function* boot() {
    yield put(bootingApp());
    yield put(requestSetConfig());
    yield take(SET_CONFIG_DONE);
    yield fork(loadLocalStorage);
    yield put(requestGetCurrentUser());
    yield take(GET_CURRENT_USER_DONE);
    yield put(bootedApp());
  });
}

function* rootSaga() {
  yield all([
    fork(booting),
    ...sagaModules.map((module) => fork(module))
  ]);
}

export default rootSaga;
