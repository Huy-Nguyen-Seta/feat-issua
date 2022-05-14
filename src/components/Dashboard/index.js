/* eslint-disable react/prop-types */
import React from 'react';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles({
  root: {
    width: '100%',
    height: 'calc(100vh - 120px)'
  },
  tabIndicatorRoot: {
    bottom: 'auto',
    top: 0
  },
  styles: {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItem: 'center',
    justifyContent: 'center'
  }
});
function Dashboard() {
  const classes = useStyles();
  return (
    <div className={classes.root}>
      Dashboard
    </div>
  );
}

export default Dashboard;
