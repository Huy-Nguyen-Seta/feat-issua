import React from 'react';
import { makeStyles } from '@material-ui/styles';
import moment from 'moment';
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

export function UserInfoComponent() {
  const classes = useStyles();

  const { user } = useSelector(userSelector);

  return (
    <div className={classes.userInfo}>
      <Grid container>
        <Grid item xs={12} md={3}>
          <span>Staff: </span>
          <span className={classes.userInfoContent}>
            {`${user && user.name} `}
          </span>
        </Grid>
        <Grid item xs={12} md={3}>
          <span>Position: </span>
          <span className={classes.userInfoContent}>{user && user.title}</span>
        </Grid>
        <Grid item xs={12} md={3}>
          <span>Start-working Time: </span>
          <span className={classes.userInfoContent}>
            {(user && user.fromTime && moment(user.fromTime, 'HH:mm:ss').format('HH:mm')) || '08:30'}
          </span>
        </Grid>
        <Grid item xs={12} md={3}>
          <span>End-working Time: </span>
          <span className={classes.userInfoContent}>
            {(user && user.toTime && moment(user.toTime, 'HH:mm:ss').format('HH:mm')) || '17:30'}
          </span>
        </Grid>
        <br />
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
