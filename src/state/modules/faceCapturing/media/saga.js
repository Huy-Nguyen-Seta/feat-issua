import { put } from 'redux-saga/effects';
import { showNotification } from '../../notification/actions';

export default function* mediaSaga(options) {
  let stream = null;
  try {
    stream = yield window.navigator.mediaDevices.getUserMedia(options);
  } catch (error) {
    yield put(showNotification('failed', 'Please connect to a camera', true));
  }

  return stream;
}
