/* eslint-disable array-callback-return */
/* eslint-disable import/no-cycle */
import {
  all, takeLatest, put, call, select, fork
} from 'redux-saga/effects';
import * as authActions from './actions';
import * as userActions from '../user/actions';
import { configSelector } from '../config/selector';
import { postApi, getApi } from '../../../api/apiHelper';
import { showNotification } from '../notification/actions';
import { detectVerifyStatus, stopVerifying } from '../faceCapturing/actions';
import { bootingApp, bootedApp } from '../app/actions';
import { routePath } from '../../../helper/constants';
import { uploadLoginBiometricForm, uploadRegisterBiometricForm } from './utils';

export function* saveToLocalStorage({
  OAuthToken,
  sessionToken,
  OAuthErrorCode,
  OAuthErrorDescription,
}) {
  yield call([localStorage, 'setItem'], 'OAuthToken', OAuthToken);
  yield call([localStorage, 'setItem'], 'sessionToken', sessionToken);
  yield call([localStorage, 'setItem'], 'OAuthErrorCode', OAuthErrorCode);
  yield call(
    [localStorage, 'setItem'],
    'OAuthErrorDescription',
    OAuthErrorDescription
  );
}

export function* loadLocalStorage() {
  const OAuthToken = yield call([localStorage, 'getItem'], 'OAuthToken');
  const sessionToken = yield call([localStorage, 'getItem'], 'sessionToken');
  const OAuthErrorCode = yield call(
    [localStorage, 'getItem'],
    'OAuthErrorCode'
  );
  const OAuthErrorDescription = yield call(
    [localStorage, 'getItem'],
    'OAuthErrorDescription'
  );
  yield put(
    authActions.initialAuth({
      OAuthErrorCode,
      OAuthErrorDescription,
      OAuthToken,
      sessionToken,
    })
  );
  yield put(authActions.loadedLocalStorage());
}

function* saveDataAfterSuccess(res) {
  if (res && res.data) {
    yield put(authActions.saveInfoAuthen());
    yield put(userActions.setCurrentUser(res.data));
  }
}

function* loginSaga({ payload: { user, callback } }) {
  yield put(bootingApp());
  const { serverURL, apiRoute } = yield select(configSelector);
  const request = yield call(postApi, {
    apiRoot: serverURL, apiRoute: apiRoute.login, payloadData: user
  });
  yield saveDataAfterSuccess(request);
  callback(request);
}
function* logoutSaga() {
  const { serverURL, apiRoute } = yield select(configSelector);
  const request = yield call(postApi, { apiRoot: serverURL, apiRoute: apiRoute.logout, });
  if (request.error) {
    yield put(showNotification('fail', request.error.message || request.error, true));
  } else {
    yield window.location.href = routePath.SIGN_IN_PATH;

    yield put(userActions.removeCurrentUser());
    yield put(authActions.removeInfoAuthen());
    yield put(authActions.logoutSuccess());
  }
}

const loginBySessionID = (data, apiRoot, apiRoute) => new Promise((resolve) => {
  const { sessionId } = data;
  const timer = setInterval(async () => {
    const request = await getApi({ apiRoot, apiRoute: `${apiRoute.session}/${sessionId}` });
    if (request) {
      if (request.complete) {
        resolve(request);
        clearInterval(timer);
      }
    }
  }, 2000);
  const wait = setTimeout(() => {
    clearTimeout(wait);
    clearInterval(timer);
    resolve({ valid: false, complete: false, error: 'Cannot verify account.' });
  }, 10000);
});

function* restartVerify(error) {
  yield put(detectVerifyStatus(false, null));
  yield put(showNotification('fail', error, true));
}

export function* requestFaceLogin(data, callback) {
  yield put(bootingApp());

  const { serverURL, apiRoute } = yield select(configSelector);
  if (data && data.sessionId) {
    const loginRes = yield call(loginBySessionID, data, serverURL, apiRoute);

    if (loginRes && loginRes.valid === true && loginRes.complete === true) {
      yield saveDataAfterSuccess(loginRes);
      callback(loginRes);
    } else {
      yield fork(restartVerify, 'Cannot verify account.');
    }
  } else {
    yield fork(restartVerify, 'Cannot verify your biometric.Please try again later.');
  }
  yield put(bootedApp());
  yield put(stopVerifying());
}

function* signupSaga(action) {
  yield console.log(action);
}

function* loginBiometricSaga({ payload: { user, callback } }) {
  const { badgeNumber, avatar } = user;
  const { serverURL, apiRoute } = yield select(configSelector);
  const bodyFormData = new FormData();
  const file = new File(avatar.blobArr, 'untitle.png', { lastModified: new Date() });
  bodyFormData.set('badgeNumber', badgeNumber);
  bodyFormData.append('avatar', file);
  const request = yield call(uploadLoginBiometricForm,
    `${serverURL}${apiRoute.loginWithImage}`,
    { method: 'POST', body: bodyFormData });
  if (request) {
    yield fork(requestFaceLogin, request, callback);
  }
}

function* registerBiometricSaga({ payload: { faces, callback } }) {
  const { serverURL, apiRoute } = yield select(configSelector);
  const bodyFormData = new FormData();
  faces.map((item, index) => {
    bodyFormData.append(
      'images',
      new File(
        [item],
        `bio_image_${index}_${new Date().getTime()}`,
        { lastModified: new Date() }
      )
    );
  });
  const request = yield call(uploadRegisterBiometricForm,
    `${serverURL}${apiRoute.registerBiometric}`,
    { method: 'POST', body: bodyFormData, credentials: 'include', });
  if (callback) callback(request);
  if (request.success && request.complete && request.valid) {
    window.location.href = routePath.TIMESHEET_PATH;
  }
}

export function* sagaFlow() {
  yield all([
    takeLatest(authActions.REQUEST_SIGNIN, loginSaga),
    takeLatest(authActions.REQUEST_SIGNUP, signupSaga),
    takeLatest(authActions.REQUEST_LOGOUT, logoutSaga),
    takeLatest(authActions.REQUEST_SIGNIN_BY_BIOMETRIC, loginBiometricSaga),
    takeLatest(authActions.REQUEST_REGISTER_BIOMETRIC, registerBiometricSaga),

  ]);
}
