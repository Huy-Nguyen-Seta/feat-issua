import {
  putStream,
  startVerifying,
  stopVerifying,
  setStream,
  setPassphrase
} from './actions';

export { verifyReducer as default } from './reducer';
export { namespace, verifySelector } from './selector';

export {
  putStream,
  setPassphrase,
  setStream,
  startVerifying,
  stopVerifying
};
