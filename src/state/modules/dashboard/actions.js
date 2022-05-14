import { namespace } from './selector';

export const INIT_ROUTE = `verisafe/${namespace}/init route`;
export const UPDATE_ROUTE = `verisafe/${namespace}/update route`;

export const initRoute = (data) => ({
  type: INIT_ROUTE,
  payload: {
    data
  }
});

export const updateRoute = (data) => ({
  type: UPDATE_ROUTE,
  payload: {
    data
  }
});
