/* eslint-disable import/no-named-as-default */
import {
  take,
  cancel,
  fork,
  put
} from 'redux-saga/effects';
import * as verifyActions from './actions';
// eslint-disable-next-line import/no-named-as-default-member
import verifySaga from './verify/saga';
import { detectVerifyStatus } from './actions';

export function* sagaFlow() {
  while (true) {
    yield put(detectVerifyStatus(false, []));
    const action = yield take(verifyActions.START_VERIFYING);
    const verifyTask = yield fork(verifySaga, action.payload.loop, action.payload.callback);
    yield take(verifyActions.STOP_VERIFYING);
    yield cancel(verifyTask);
  }
}
