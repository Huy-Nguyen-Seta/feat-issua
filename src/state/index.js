import {
  applyMiddleware,
  compose,
  createStore
} from 'redux';
import createSagaMiddleware from 'redux-saga';
import thunkMiddleware from 'redux-thunk';
import rootSaga from './saga';
import { reducers } from './reducer';

const sagasMiddleware = createSagaMiddleware();
const composeMiddlewares = applyMiddleware(thunkMiddleware, sagasMiddleware);
// Use Redux DevTools Extension if available and not in production.
const composeEnhancers = ((process.env.NODE_ENV !== 'production') && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) || compose;

export const store = createStore(
  reducers,
  composeEnhancers(composeMiddlewares)
);

sagasMiddleware.run(rootSaga);
