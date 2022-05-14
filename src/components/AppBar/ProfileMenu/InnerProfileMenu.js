import React from 'react';
import PowerIcon from '@material-ui/icons/PowerSettingsNew';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import MenuItem from '@material-ui/core/MenuItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import Button from '@material-ui/core/Button';
import Avatar from '@material-ui/core/Avatar';
import ListSubheader from '@material-ui/core/ListSubheader';
import Divider from '@material-ui/core/Divider';
import { makeStyles } from '@material-ui/core/styles';
import { userSelector } from '../../../state/modules/user/selector';
import { styles } from './styles';
import { requestLogout } from '../../../state/modules/auth/actions';
// import { bootedApp } from '../../../state/modules/app/actions';
import { routePath } from '../../../helper/constants';

const useStyles = makeStyles({
  ...styles
});

export default function InnerProfileMenu() {
  const classes = useStyles();
  const { user } = useSelector(userSelector);
  const history = useHistory();
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(requestLogout());
  };

  const handleChangeRouteUserDetail = () => {
    history.push(routePath.INFO_PATH);
  };
  return (
    <>
      <ListSubheader className={classes.header} key="header">
        <div className={classes['user-avatar']}>
          <Avatar />
        </div>
        <div className={classes['user-profile']}>
          <div className={classes['full-name']}>
            {user && user.name}
          </div>
          <div className={classes.username}>
            {user && user.email}
          </div>
          <div className={classes.editButton}>

            <Button
              variant="contained"
              color="primary"
              className={classes.editProfileButton}
              onClick={handleChangeRouteUserDetail}
            >
              User Information
            </Button>

          </div>
        </div>
      </ListSubheader>

      <Divider />
      <MenuItem
        key="logout"
        className="logoutButton"
        onClick={handleLogout}
      >
        <ListItemIcon>
          <PowerIcon />
        </ListItemIcon>
        <ListItemText primary="Log out" />
      </MenuItem>
    </>
  );
}
