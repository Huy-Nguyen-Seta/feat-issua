import { eventChannel, END } from 'redux-saga';
import {
  call, take, cancelled, put
} from 'redux-saga/effects';

function countdown({ value, skipTime, actionType }) {
  return eventChannel((emitter) => {
    const iv = setInterval(() => {
      const tValue = value - 1;
      if (tValue > 0) {
        emitter({ type: actionType, payload: tValue });
      } else {
        emitter(END);
      }
    }, skipTime);
    return () => {
      clearInterval(iv);
    };
  });
}

export default function* timerSaga({ value, skipTime, actionType }) {
  const chan = yield call(countdown, { value, skipTime, actionType });
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
