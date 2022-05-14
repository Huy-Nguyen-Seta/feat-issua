import React from 'react';

import useStyles from './styles';

export default function AlertComponent() {
  const classes = useStyles();
  return (
    <>
      <div className={classes.detailContainer}>
        <div className={classes.noAlert}>
          <div className={classes.noAlertText}>No Alerts</div>
          <div className={classes.noAlertSubText}>Your Alerts will appear here</div>
        </div>
      </div>
    </>
  );
}
