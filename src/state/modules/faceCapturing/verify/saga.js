/* eslint-disable no-bitwise */
/* eslint-disable no-param-reassign */
import {
  take,
  call,
  fork,
  cancel,
  put,
  // race,
  // all,
  // cancelled,
  select,
  delay,
} from 'redux-saga/effects';
import { verifySelector } from '../selector';
import { configSelector } from '../../config/selector';
import mediaSaga from '../media/saga';
import faceSaga from '../face/saga';
import { FACE_RESULTS, FACE_IMAGE, CAMERA_RESTART } from '../face/actions';
import { setStream, detectVerifyStatus } from '../actions';
import { getImageBlob } from './utils';
import { routePath } from '../../../../helper/constants';
import { requestFaceLogin } from '../../auth/saga';
import { showNotification } from '../../notification/actions';

const uploadLognForm = (url, { method, headers, body }) => fetch(url, {
  method,
  headers,
  body,
}).then((res) => res.json());

const uploadFormRegister = (url, { method, credentials, body }) => fetch(url, {
  method,
  credentials,
  body,
}).then((res) => res.json());

// eslint-disable-next-line no-unused-vars
function* verifyAPI(faceVoiceData, type, callback) {
  const { badgeNumber } = yield select(verifySelector);
  const file = new File(faceVoiceData[0].blobArr, 'untitle.png', {
    lastModified: new Date(),
  });
  const { serverURL, apiRoute } = yield select(configSelector);
  const bodyFormData = new FormData();
  if (type === 'signin') {
    bodyFormData.set('badgeNumber', badgeNumber);
    bodyFormData.append('avatar', file);
    const request = yield call(
      uploadLognForm,
      `${serverURL}${apiRoute.loginWithImage}`,
      { method: 'POST', body: bodyFormData }
    );
    if (request) {
      yield fork(requestFaceLogin, request, callback);
    }
  } else if (type === 'register') {
    bodyFormData.append('avatar', file);
    const request = yield call(
      uploadFormRegister,
      `${serverURL}${apiRoute.uploadImageRegister}`,
      { method: 'POST', body: bodyFormData, credentials: 'include' }
    );
    if (request.success && request.success.complete && request.success.valid) {
      if (callback) callback(request);
      window.location.href = routePath.TIMESHEET_PATH;
    }
  }
}

function* collectFaceResults(face) {
  face.blobArr = [];
  face.timeStampArr = [];
  face.landMarksArr = [];
  const faceImageAction = yield take(FACE_IMAGE);
  const faceBlob = yield call(getImageBlob, faceImageAction.payload.face);
  face.blobArr.push(faceBlob);
  while (true) {
    const faceResultAction = yield take(FACE_RESULTS);
    face.landMarksArr.push(faceResultAction.payload.faceLandmarks);
    face.timeStampArr.push(Date.now());
  }
}

export default function* verifySaga(loop, callback) {
  let faceData = {};
  const stream = yield call(mediaSaga, { audio: false, video: true });

  if (stream) {
    yield put(setStream(stream));
    const tracks = stream.getTracks();
    let i = 0;
    while (i < loop) {
      let restartCamera = null;
      if (loop > 1) {
        restartCamera = yield take(CAMERA_RESTART);
      }
      yield fork(faceSaga, stream);
      yield take(FACE_RESULTS);
      const faceCollectionTask = yield fork(collectFaceResults, faceData);

      yield delay(loop > 1 ? 2000 : 1000);
      yield cancel(faceCollectionTask);
      const tempURL = URL.createObjectURL(faceData.blobArr[0]);
      yield put(detectVerifyStatus(true, tempURL));
      if (restartCamera && restartCamera.callback) {
        restartCamera.callback(faceData);
      }
      if (loop > 1) {
        faceData = {};
      }

      i += 1;
    }
    tracks.forEach((track) => {
      track.stop();
    });
    if (callback) callback(faceData);
  } else {
    yield put(showNotification('failed', 'Please connect to a camera', true));
    if (callback) callback({ error: 'Not found camera' });
  }
}
