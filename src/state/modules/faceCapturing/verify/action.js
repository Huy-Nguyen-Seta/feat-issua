export const START_VERIFYING = 'verify-v2/START_VERIFYING';
export const STOP_VERIFYING = 'verify-v2/STOP_VERIFYING';

export const START_RECORDER_COUNTDOWN = 'verify-v2/START_RECORDER_COUNTDOWN';
export const RECORDING_COUNTDOWN = 'verify-v2/RECORDING_COUNTDOWN';
export const VERIFYING_COUNTDOWN = 'verify-v2/VERIFYING_COUNTDOWN';
export const SET_PASSPHRASE = 'verify-v2/SET_PASSPHRASE';
export const FULL_PROGRESS = 'verify-v2/FULL_PROGRESS';

export const STREAM = 'verify-v2/STREAM';

export function putStream(stream) {
  return {
    type: STREAM,
    payload: stream,
  };
}

export function startVerifying() {
  return {
    type: START_VERIFYING,
  };
}

export function stopVerifying() {
  return {
    type: STOP_VERIFYING,
  };
}

export function setPassphrase(passphrase) {
  return {
    type: SET_PASSPHRASE,
    payload: passphrase
  };
}

export function fullProgress() {
  return {
    type: FULL_PROGRESS,
  };
}
