/* eslint-disable react/prop-types */
import React from 'react';
import { noob } from 'lodash';
import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import ProfileMenu from './ProfileMenu';
import Notifier from './Notifier';
import { styles } from './styles';

const useStyles = makeStyles((theme) => ({
  ...styles(theme)
}));

export default function AppBarComponent({
  open,
  profileMenu = true,
  enableNotify = true,
  notifications,
  readedNotification,
  unreadedNotification,
  onOpen = noob,
  onClose = noob,
  onClickNotification = noob,
  readAll = noob,
}) {
  const classes = useStyles();

  const notificationsProps = {
    onOpen,
    onClose,
    notifications,
    readedNotification,
    unreadedNotification,
    onClickNotification,
    readAll
  };
  return (
    <div className={classes.root}>
      <AppBar
        position="fixed"
        className={`${classes.appBar} ${open && classes.appBarShift}`}
      >
        <Toolbar className={classes.toolbar}>
          <div
            component="h1"
            variant="h6"
            color="inherit"
            className={classes.title}
          >
            <span>SETA Vietnam Timesheet </span>
          </div>
          {enableNotify && <Notifier {...notificationsProps} />}

          {profileMenu && (
            <div>
              <ProfileMenu />
            </div>
          )}
        </Toolbar>
      </AppBar>
    </div>
  );
}

AppBarComponent.propTypes = {
};
