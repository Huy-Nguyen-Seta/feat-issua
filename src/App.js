import React from 'react';
import {
  BrowserRouter as Router,
  Route,
  Redirect,
} from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { element } from 'prop-types';
import { authSelector } from './state/modules/auth';
import { appSelector } from './state/modules/app';
import { showNotification as showNotificationAction } from './state/modules/notification';
import { bootApp } from './state/actions';
import TitleContainer from './containers/TitleContainer';
import routes from './routeMap';
import { routePath } from './helper/constants';
import Loading from './components/CommonComponents/Loading';
import Notification from './containers/NotifyContainer';

function PrivateRoute({ children, ...rest }) {
  const { isAuthenticated } = useSelector(authSelector);
  return (
    <Route
      {...rest}
      render={
        ({ location }) => (isAuthenticated ? (
          children
        )
          : (
            <Redirect
              to={{
                pathname: routePath.SIGN_IN_PATH,
                state: { from: location }
              }}
            />
          ))
      }
    />
  );
}

PrivateRoute.propTypes = {
  children: element.isRequired
};

function App() {
  const dispatch = useDispatch();
  const { isBooting, bootDidFinish } = useSelector(appSelector);

  React.useEffect(() => {
    dispatch(bootApp());
  }, []);
  const showNotification = (type, messsage, duration) => {
    dispatch(showNotificationAction(type, messsage, duration));
  };
  const routeComponents = routes.map((routeItem) => {
    const {
      component: Page,
      path,
      id,
      authenRequired,
      ...remains
    } = routeItem;
    if (!authenRequired) {
      return (
        <Route
          exact
          path={path}
          key={id}
        >
          <TitleContainer path={path}>
            <Page
              key={id}
              path={path}
              authenRequired={authenRequired}
              showNotification={showNotification}
              {...remains}
            />
          </TitleContainer>
        </Route>
      );
    }
    return (
      <PrivateRoute
        exact
        path={path}
        key={id}
      >
        <TitleContainer path={path}>
          <Page
            key={id}
            path={path}
            authenRequired={authenRequired}
            showNotification={showNotification}
            {...remains}
          />
        </TitleContainer>
      </PrivateRoute>
    );
  });
  return (
    <>
      {isBooting && <Loading />}
      {bootDidFinish && (
        <Router>
          {routeComponents}
        </Router>
      )}
      <Notification />
    </>
  );
}

export default App;
