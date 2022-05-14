/* eslint-disable no-unused-vars */
/* eslint-disable import/named */
/* eslint-disable react/forbid-prop-types */
/* eslint-disable array-callback-return */
import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import moment from 'moment';
import {
  Grid, TextField, Checkbox,
} from '@material-ui/core';
import MomentUtils from '@date-io/moment';
import {
  MuiPickersUtilsProvider,
  KeyboardDatePicker,
} from '@material-ui/pickers';
import { useDispatch, useSelector } from 'react-redux';

import { object } from 'prop-types';
import { requestGetAllUserTimesheet } from '../../state/modules/timesheet/actions';

import { userSelector } from '../../state/modules/user';

import { styles } from './styles';

const useStyles = makeStyles({
  ...styles
});

const originForm = {
  comment: '',
  errorCount: false
};

export default function ForgetModalComponent({
  openProps,
}) {
  const classes = useStyles();
  const { user } = useSelector(userSelector);
  const dispatch = useDispatch();

  const [formModalValue, setFormModalValue] = useState(originForm);

  useEffect(() => {
    if (openProps) {
      dispatch(requestGetAllUserTimesheet({
        filter: {
          fromDate: moment(openProps.requestDate).format('MM/DD/YYYY'),
          toDate: moment(openProps.requestDate).format('MM/DD/YYYY'),
          badgeNumber: openProps.badgeNumber,
        },
        callback: (res) => {
          if (res && res.data && res.data[0]) {
            setFormModalValue({
              date: moment(openProps.requestDate),
              actualCheckIn: openProps.startDateTime ? moment(openProps.startDateTime).format('HH:mm') : moment(res.data[0].checkIn).format('HH:mm'),
              checkIn: res.data[0].checkIn ? moment(res.data[0].checkIn).format('HH:mm') : user.fromTime,
              actualCheckOut: openProps.endDateTime ? moment(openProps.endDateTime).format('HH:mm') : moment(res.data[0].checkOut).format('HH:mm'),
              checkOut: res.data[0].checkOut ? moment(res.data[0].checkOut).format('HH:mm') : user.toTime,
              errorCount: openProps && !openProps.errorCount,
              comment: openProps && openProps.comment,

            });
          }
        }
      }));
    }
  }, [openProps]);

  return (
    <>
      <MuiPickersUtilsProvider utils={MomentUtils}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <KeyboardDatePicker
              required
              disableToolbar
              variant="inline"
              format="DD/MM/YYYY"
              id="date-picker-inline"
              label="Register for Date"
              KeyboardButtonProps={{
                'aria-label': 'change date',
              }}
              InputProps={{
                classes: {
                  root: classes.inputRoot,
                  disabled: classes.disabled
                }
              }}
              style={{ width: '100%' }}
              value={formModalValue.date}

              disabled
            />
          </Grid>

        </Grid>

        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <TextField
              required
              id="actualCheckIn"
              label="Actual Check-in"
              type="time"
              InputLabelProps={{
                shrink: true,
              }}
              InputProps={{
                classes: {
                  root: classes.inputRoot,
                  disabled: classes.disabled
                }
              }}
              style={{ width: '100%' }}
              value={formModalValue.actualCheckIn}
              disabled
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              disabled
              required
              id="check-in"
              label="Check-in"
              type="time"
              InputLabelProps={{
                shrink: true,
              }}
              InputProps={{
                classes: {
                  root: classes.inputRoot,
                  disabled: classes.disabled
                }
              }}
              style={{ width: '100%' }}
              value={formModalValue.checkIn}
            />

          </Grid>

        </Grid>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <TextField
              required
              id="actualCheckOut"
              label="Actual Check-out"
              type="time"
              InputLabelProps={{
                shrink: true,
              }}
              InputProps={{
                classes: {
                  root: classes.inputRoot,
                  disabled: classes.disabled
                }
              }}
              style={{ width: '100%' }}
              value={formModalValue.actualCheckOut}

              disabled
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              disabled
              required
              id="check-out"
              label="Check-out"
              type="time"
              InputLabelProps={{
                shrink: true,
              }}
              InputProps={{
                classes: {
                  root: classes.inputRoot,
                  disabled: classes.disabled
                }
              }}
              style={{ width: '100%' }}
              value={formModalValue.checkOut}
            />
          </Grid>

        </Grid>
        <Grid container spacing={2}>
          <Grid item xs={12} md={8}>
            <Checkbox
              color="primary"
              inputProps={{ 'aria-label': 'primary checkbox' }}
              checked={formModalValue.errorCount}
              disabled
            />
            Special reason (not count as error)
          </Grid>
        </Grid>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              required
              id="reason"
              label="Reason"
              multiline
              rows={2}
              value={formModalValue.comment}
              style={{ width: '100%' }}
              InputLabelProps={{
                shrink: true,
              }}
              InputProps={{
                classes: {
                  root: classes.inputRoot,
                  disabled: classes.disabled
                }
              }}
              disabled
            />
          </Grid>
        </Grid>

      </MuiPickersUtilsProvider>

    </>
  );
}

ForgetModalComponent.propTypes = {

  openProps: object,

};

ForgetModalComponent.defaultProps = {
  openProps: {},

};
