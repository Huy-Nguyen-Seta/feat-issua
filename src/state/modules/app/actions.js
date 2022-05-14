import { namespace } from './selector';

export const BOOTING = `verisafe/${namespace}/booting`;

export const BOOTED = `verisafe/${namespace}/booted`;

export const bootingApp = (auth) => ({
  type: BOOTING,
  payload: {
    auth
  }
});

export const bootedApp = () => ({
  type: BOOTED
});
