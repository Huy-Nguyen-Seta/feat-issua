import { eventChannel } from 'redux-saga';
import {
  take, call, cancelled, put
} from 'redux-saga/effects';
import * as faceapi from 'face-api.js';
import {
  faceImage, faceResults, startDetectingFace, startLoadFaceApi
} from './actions';

const FACE_API_VERSION = '0.22.2';
const modelsUri = `https://cdn.jsdelivr.net/gh/justadudewhohacks/face-api.js@${FACE_API_VERSION}/weights`;

function convertToVtnStandard(face) {
  const bb = face.detection.box;
  const right = bb.left + bb.width;
  const bottom = bb.top + bb.height;

  const widthPixels = 640;
  const heightPixels = 480;
  const boundingPoly = [{
    // Upper left
    x: bb.left / widthPixels,
    y: bb.top / heightPixels
  }, {
    // Upper right
    x: right / widthPixels,
    y: bb.top / heightPixels
  }, {
    // Lower right
    x: right / widthPixels,
    y: bottom / heightPixels
  }, {
    // Lower left
    x: bb.left / widthPixels,
    y: bottom / heightPixels
  }];

  function mapLandmarksData(landmarks, type) {
    return {
      type,
      locationPoly: landmarks.map((landmark) => ({
        x: landmark.x / widthPixels,
        y: landmark.y / heightPixels
      }))
    };
  }

  // TODO: Worry about the standardization of these landmark type names
  const faceLandmarks = [
    mapLandmarksData(face.landmarks.getLeftEye(), 'leftEye'),
    mapLandmarksData(face.landmarks.getLeftEyeBrow(), 'leftEyeBrow'),
    mapLandmarksData(face.landmarks.getRightEye(), 'rightEye'),
    mapLandmarksData(face.landmarks.getRightEyeBrow(), 'rightEyeBrow'),
    mapLandmarksData(face.landmarks.getMouth(), 'mouth'),
    mapLandmarksData(face.landmarks.getNose(), 'nose'),
    mapLandmarksData(face.landmarks.getJawOutline(), 'jawOutline')
  ];
  const confidence = face.detection.score;

  return {
    confidence,
    boundingPoly,
    faceLandmarks,
    vendor: face,
  };
}

function faceChannel(stream) {
  return eventChannel((emitter) => {
    const inputSize = 480;
    const scoreThreshold = 0.5;
    const videoElement = document.createElement('video');
    videoElement.srcObject = stream;
    videoElement.muted = true;

    let frameId;
    videoElement.play().then(() => {
      async function tick() {
        const { videoHeight } = videoElement;
        const { videoWidth } = videoElement;
        const canvasElement = document.createElement('canvas');
        const canvasContext = canvasElement.getContext('2d');
        canvasElement.width = videoWidth;
        canvasElement.height = videoHeight;
        canvasContext.drawImage(
          videoElement,
          0,
          0,
          canvasElement.width,
          canvasElement.height
        );
        const face = await faceapi.detectSingleFace(
          canvasElement,
          new faceapi.TinyFaceDetectorOptions({
            inputSize,
            scoreThreshold
          })
        ).withFaceLandmarks(true);
        if (face) {
          emitter(faceResults(convertToVtnStandard(face)));
          emitter(faceImage({ face: canvasElement, width: videoWidth, height: videoHeight }));
        }
        frameId = window.requestAnimationFrame(tick);
      }
      frameId = window.requestAnimationFrame(tick);
    });
    return () => {
      window.cancelAnimationFrame(frameId);
    };
  });
}

export default function* faceAPISaga(stream) {
  yield put(startLoadFaceApi());
  yield faceapi.nets.tinyFaceDetector.loadFromUri(modelsUri);
  yield faceapi.nets.faceLandmark68TinyNet.loadFromUri(modelsUri);
  // yield faceapi.nets.ssdMobilenetv1.loadFromUri(modelsUri);

  const chan = yield call(faceChannel, stream);
  yield put(startDetectingFace());
  try {
    while (true) {
      const channelAction = yield take(chan);
      yield put(channelAction);
    }
  } finally {
    if (yield cancelled()) {
      chan.close();
    }
  }
}
