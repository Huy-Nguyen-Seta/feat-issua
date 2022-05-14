import { namespace } from './selector';

export const SHOW_ACTION = `verisafe/${namespace}/show notification`;

export const HIDE_ACTION = `verisafe/${namespace}/hide notification`;
export const showNotification = (type, message, isSnackbar) => ({
  type: SHOW_ACTION,
  payload: {
    type,
    message,
    isSnackbar
  }
});

export const hideNotification = () => ({
  type: HIDE_ACTION
});
