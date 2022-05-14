/* eslint-disable react/prop-types */
import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { useSelector } from 'react-redux';
import { useHistory, useLocation } from 'react-router-dom';
import { userSelector } from '../../state/modules/user/selector';
import AppBar from '../../components/AppBar';
import Drawer from '../../components/MyDrawer';
import { styles } from './styles';
import AddBiometricURLAlert from '../../components/AddBiometricURLAlert';
import { routePath } from '../../helper/constants';
import routes from '../../routeMap';

const useStyles = makeStyles({ ...styles });

export default function AuthenticatedContainer({ children, }) {
  const [open, setOpen] = useState(true);
  const { user } = useSelector(userSelector);
  const classes = useStyles();
  const location = useLocation();
  const history = useHistory();
  const { permissions } = useSelector(userSelector);

  useEffect(() => {
    const findRole = routes.find((route) => route.path === location.pathname)
      && routes.find((route) => route.path === location.pathname).role;
    const hasPermission = findRole && permissions.includes(findRole);

    if (!hasPermission) history.push(routePath.SIGN_IN_PATH);
  }, []);

  function handleChangeRoute(route) {
    history.push(route);
  }

  const handleActionButton = () => {
    setOpen(false);
    window.location.href = routePath.REGISTER_BIOMETRIC;
  };

  return (
    <>
      <AppBar />
      <Drawer
        pathName={location.pathname}
        onChangeRoute={handleChangeRoute}
      />
      <div className={classes.childDiv}>
        {children}
      </div>
      {!user.hasBiometric && location.pathname !== routePath.REGISTER_BIOMETRIC && (
        <AddBiometricURLAlert open={open} handleActionButton={handleActionButton} />
      )}

    </>
  );
}
