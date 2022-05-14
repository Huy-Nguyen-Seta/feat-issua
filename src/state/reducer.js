import { combineReducers } from 'redux';
import { reducer as formReducer } from 'redux-form';

import modules from './modules/moduler';

export const reducers = combineReducers({
  ...modules,
  form: formReducer
});
