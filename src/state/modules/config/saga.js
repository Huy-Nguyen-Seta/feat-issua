import { all, takeLatest, put } from 'redux-saga/effects';
import * as configActions from './actions';
import config from '../../../../config.json';
import apiRoute from '../../../../apiRoute.json';
import configWhitelist from '../../../configWhitelist.json';

function* setConfig() {
  const globalConfig = configWhitelist.reduce((callbackConfig, item) => {
    // eslint-disable-next-line no-param-reassign
    if (config[item]) callbackConfig[item] = config[item];
    return callbackConfig;
  }, {});
  yield put(configActions.setConfig({
    ...globalConfig,
    apiRoute
  }));
  yield put(configActions.setConfigDone());
}

export function* sagaFlow() {
  yield all([
    takeLatest(configActions.REQUEST_SET_CONFIG, setConfig)
  ]);
}
