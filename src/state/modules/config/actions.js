import { namespace } from './selector';

export const REQUEST_SET_CONFIG = `timesheet/${namespace}/REQUEST_SET_CONFIG`;
export const SET_CONFIG = `timesheet/${namespace}/SET_CONFIG`;
export const SET_CONFIG_DONE = `timesheet/${namespace}/SET_CONFIG_DONE`;

export const GET_CONFIG = `timesheet/${namespace}/GET_CONFIG`;

export const requestSetConfig = () => ({
  type: REQUEST_SET_CONFIG
});

export const getConfig = () => ({
  type: GET_CONFIG
});

export const setConfigDone = () => ({
  type: SET_CONFIG_DONE
});

export const setConfig = (config) => ({
  type: SET_CONFIG,
  payload: {
    config
  }
});
