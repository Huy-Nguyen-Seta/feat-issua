import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { makeStyles } from '@material-ui/core/styles';
import Dialog from '@material-ui/core/Dialog';
import ClearIcon from '@material-ui/icons/Clear';
import { Snackbar, IconButton } from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import CheckCircleOutlineIcon from '@material-ui/icons/CheckCircleOutline';
import { notificationSelector, hideNotification } from '../../state/modules/notification';
import styles from './styles';

const useStyles = makeStyles(() => ({
  ...styles
}));

function Notifications() {
  const dispatch = useDispatch();
  const {
    showing,
    message = 'Successful',
    type,
    duration = 3000,
    isSnackbar
  } = useSelector(notificationSelector);
  const classes = useStyles();
  React.useEffect(() => {
    if (!isSnackbar && showing) {
      setTimeout(() => {
        dispatch(hideNotification());
      }, duration);
    }
  }, [showing]);
  function handleClose() {
    dispatch(hideNotification());
  }
  return (
    <>
      {isSnackbar && (
        <Snackbar
          open={showing}
          // autoHideDuration={duration}
          onClose={handleClose}
          message={message}
          action={(
            <>
              <IconButton
                aria-label="close"
                color="inherit"
                className={classes.close}
                onClick={handleClose}
              >
                <CloseIcon />
              </IconButton>
            </>
          )}
        />
      )}
      {!isSnackbar && (
        <Dialog
          open={showing}
          onClose={handleClose}
          className={classes.container}
          aria-labelledby="simple-modal-title"
          aria-describedby="simple-modal-description"
        >
          <div className={classes.body}>
            {type === 'success' && (<CheckCircleOutlineIcon className={classes.failIcon} />)}
            {type === 'fail' && (<ClearIcon className={classes.failIcon} />)}
            <div className={classes.message}>{message}</div>
          </div>
        </Dialog>
      )}
    </>

  );
}

export default Notifications;
