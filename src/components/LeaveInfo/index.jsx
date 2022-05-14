import React from 'react';
import { makeStyles } from '@material-ui/styles';
import { Grid } from '@material-ui/core';
import { useSelector } from 'react-redux';
import { userSelector } from '../../state/modules/user/selector';

import { styles } from './styles';
import { getDaysFromHours } from '../../helper/helper';

const useStyles = makeStyles({
  ...styles
});
const convertHourTime = (hours) => {
  const { day, hour } = getDaysFromHours(hours);
  return `${day}${day > 1 ? ' days' : ' day'} 
  ${hour}${hour > 1 ? ' hours' : ' hour'}`;
};

export function LeaveInfo() {
  const classes = useStyles();

  const { user } = useSelector(userSelector);

  return (
    <div className={classes.userInfo}>
      <Grid container>
        <Grid item xs={12} md={6}>
          <span>Total leave remain: </span>
          <span className={classes.userInfoContent}>
            {convertHourTime(user?.totalRemain)}
          </span>
        </Grid>
        <Grid item xs={12} md={6}>
          <span>Total carry over leave remain: </span>
          <span className={classes.userInfoContent}>
            {convertHourTime(user?.carryOverRemain)}

          </span>
        </Grid>

      </Grid>
    </div>
  );
}
