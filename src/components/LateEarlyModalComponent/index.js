/* eslint-disable react/forbid-prop-types */
/* eslint-disable array-callback-return */
import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import moment from 'moment';
import {
  Modal, Grid, TextField,
  Button, FormHelperText
} from '@material-ui/core';
import MomentUtils from '@date-io/moment';
import { useDispatch } from 'react-redux';
import {
  MuiPickersUtilsProvider,
  KeyboardDatePicker,
} from '@material-ui/pickers';
import { bool, func, object } from 'prop-types';
import { requestGetTimesheetUnsave } from '../../state/modules/timesheet/actions';
import {
  requestPostCompensationRequests, requestPutRequestsCompensation,
  requestCheckCompRequest, requestDeleteRequests
} from '../../state/modules/requests/actions';
import { showNotification } from '../../state/modules/notification/actions';

import { requiredValidate, } from '../../helper/validate';
import { styles } from './styles';

const useStyles = makeStyles((theme) => ({
  ...styles(theme)
}));

const originForm = {
  comp: null,
  comment: ''
};

const originError = {
  comp: false,
  comment: false
};

const validateMapper = {
  comp: requiredValidate,
  comment: requiredValidate,
};

const getMinutes = (time) => {
  const dataTime = time && time.split(':') ? time : '00:00';
  return Number(dataTime.split(':')[0]) * 60 + Number(dataTime.split(':')[1]);
};

export function LateEarlyModalComponent({
  openProps, infoProps, setOpenModal, refreshListFunc, setInfoModal
}) {
  const dispatch = useDispatch();
  const classes = useStyles();

  const [formModalValue, setFormModalValue] = useState(originForm);
  const [errorForm, setErrorForm] = useState(originError);
  const [remainRequest, setRemainRequest] = useState(0);
  const [compDays, setCompDays] = useState([]);

  useEffect(() => {
    const dataUpdate = {
      date: infoProps && infoProps.date,
      checkIn: moment(infoProps && infoProps.checkIn).format('HH:mm'),
      checkOut: moment(infoProps && infoProps.checkOut).format('HH:mm'),
      early: infoProps && infoProps.early,
      late: infoProps && infoProps.late,
      timeRequest: infoProps && infoProps.lack,
      // comp: null
    };

    if (infoProps && infoProps.id) {
      setFormModalValue({
        ...dataUpdate,
        overTime: infoProps && infoProps.lack,
        comp: infoProps && infoProps.comp && moment(infoProps.comp),
        comment: infoProps && infoProps.comment
      });
    } else {
      setFormModalValue({
        ...dataUpdate,
        comp: null
      });
    }

    if (openProps) {
      dispatch(requestCheckCompRequest({
        filter: {
          fromDate: moment().startOf('month').format('YYYY-MM-DD'),
          toDate: moment().endOf('month').format('YYYY-MM-DD'),
          requestTypeId: '187f0f75-3394-4962-92af-6efc131f8e74'
        },
        callback: (res) => {
          if (res.data) {
            setRemainRequest(res.data);
            setCompDays(res.data.compensationDateList);
          } else {
            dispatch(showNotification('failed', res.error || res.error.message, true));
          }
        }
      }));
    }
  }, [openProps]);

  const handleFormChangeDate = (type) => (value) => {
    setErrorForm({
      ...errorForm,
      [type]: ''
    });
    setFormModalValue({
      ...formModalValue,
      [type]: moment(value)
    });
  };

  const handleAcceptCompDate = () => {
    const value = formModalValue.comp;
    const isValidDate = compDays.length >= 3
      ? compDays.find((item) => value && moment(item.compensationDate).isSame(value, 'day'))
      : true;

    if (compDays.length >= 3 && !isValidDate && value) {
      setErrorForm({
        ...errorForm,
        comp: 'You only have maximum 3 compensation days this month.'
      });
    } else if (isValidDate && value && moment(value).isValid()) {
      dispatch(requestGetTimesheetUnsave({
        filter: {
          fromDate: moment(value).format('MM/DD/YYYY'),
          toDate: moment(value).format('MM/DD/YYYY'),
        },
        callback: (res) => {
          if (res && res.data && res.data[0] && res.data[0].overTime) {
            if (getMinutes(res.data[0].overTime) < getMinutes(formModalValue.timeRequest)) {
              setErrorForm({
                ...errorForm,
                comp: 'Overtime must greater than time request'
              });
            }
            setFormModalValue({
              ...formModalValue,
              overTime: res.data[0].overTime
            });
          } else {
            setErrorForm({
              ...errorForm,
              comp: 'You can not choose this day'
            });
            setFormModalValue({
              ...formModalValue,
              overTime: '00:00'
            });
          }
        }
      }));
    }
  };

  const handleFormChangeTextField = (type) => (e) => {
    setErrorForm({
      ...errorForm,
      [type]: false
    });
    setFormModalValue({
      ...formModalValue,
      [type]: e.target.value,

    });
  };

  const validateForm = (objValue) => {
    let errorObj = { ...errorForm };
    // validate required
    Object.keys(errorForm).map((item) => {
      errorObj = {
        ...errorObj,
        [item]: validateMapper[item] ? validateMapper[item](objValue[item]) : false,
      };
    });
    if (!(infoProps && infoProps.id) && remainRequest && remainRequest.numberOfLeftRequest === 0) {
      errorObj = {
        ...errorObj,
        errorCount: "You're not allowed to make this request"
      };
    }
    setErrorForm({ ...errorObj });
    const errorFlag = Object.keys(errorObj).reduce(
      (callbackVal, currentVal) => callbackVal || errorObj[currentVal],
      false
    );
    return errorFlag;
  };

  const handleSubmitForm = () => {
    const error = validateForm(formModalValue);
    if (error) {
      return;
    }
    if (infoProps && infoProps.id) {
      dispatch(requestPutRequestsCompensation({
        id: infoProps && infoProps.id,
        payload: {
          // errorCount: true,
          compensationDate: formModalValue.comp.format('YYYY-MM-DD'),
          comment: formModalValue.comment,
          status: infoProps && infoProps.status,
          requestDate: formModalValue.date,
        },
        callback: (res) => {
          if (res.error) {
            dispatch(showNotification('failed', res.error.message || res.error, true));
          } else {
            setOpenModal(false);
            dispatch(showNotification('success', 'Update successfully!',));
            if (refreshListFunc) refreshListFunc();
          }
        }

      }));
    } else {
      dispatch(requestPostCompensationRequests({
        payload: {
          requestTypeId: '187f0f75-3394-4962-92af-6efc131f8e74',
          errorCount: true,
          requestDate: formModalValue.date,
          compensationDate: formModalValue.comp.format('YYYY-MM-DD'),
          comment: formModalValue.comment,
        },
        callback: (res) => {
          if (res.error) {
            dispatch(showNotification('failed', res.error.message || res.error, true));
          } else if (res && res.data && res.data.id) {
            setOpenModal(false);
            dispatch(showNotification('success', 'Create successfully!',));

            if (refreshListFunc) refreshListFunc();
          }
        }

      }));
    }
  };

  const handleResetForm = () => {
    setErrorForm({ ...originError });
    if (infoProps && infoProps.id) {
      setFormModalValue({
        date: infoProps && infoProps.date,
        checkIn: moment(infoProps && infoProps.checkIn).format('HH:mm'),
        checkOut: moment(infoProps && infoProps.checkOut).format('HH:mm'),
        early: infoProps && infoProps.early,
        late: infoProps && infoProps.late,
        timeRequest: infoProps && infoProps.lack,
        overTime: infoProps && infoProps.lack,
        comp: infoProps && infoProps.comp && moment(infoProps.comp),
        comment: infoProps && infoProps.comment
      });
    } else {
      setFormModalValue({ date: infoProps && infoProps.date, ...originForm });
    }
  };

  const handleCloseModal = () => {
    handleResetForm();
    setInfoModal({});
    setOpenModal(false);
  };

  const handleDisabledDate = (date) => [6, 7].includes(date.isoWeekday())
    || (date.isBefore(infoProps.date, 'day') || date.startOf('day').isAfter(moment().startOf('day')));

  const handleDeleteLateEarlyRequest = () => {
    dispatch(requestDeleteRequests({
      payload: { id: infoProps.id },
      callback: (res) => {
        if (res && res.success && res.success === true) {
          dispatch(showNotification('success', 'Delete successfully!',));
          handleCloseModal();
          if (refreshListFunc) refreshListFunc();
        } else if (res && res.error) {
          dispatch(showNotification('failed', res.error.message || res.error, true));
        }
      }
    }));
  };

  return (
    <>
      <Modal
        open={openProps}
        onClose={handleCloseModal}
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
        className={classes.modalStyle}
      >
        <div className={classes.bodyModalStyles}>
          <MuiPickersUtilsProvider utils={MomentUtils}>
            <Grid container spacing={2}>
              <div className={classes.groupTitle}>
                Working Infomation
              </div>
            </Grid>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <KeyboardDatePicker
                  required
                  disableToolbar
                  variant="inline"
                  format="DD/MM/YYYY"
                  // margin="normal"
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
                  onChange={handleFormChangeDate('date')}
                  error={errorForm.date}
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
                  onChange={handleFormChangeDate('checkIn')}
                  error={errorForm.checkIn}
                  helperText={errorForm.checkIn}
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
                  onChange={handleFormChangeDate('checkOut')}
                  error={errorForm.checkOut}
                  helperText={errorForm.checkOut}
                />
              </Grid>
            </Grid>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <TextField
                  disabled
                  required
                  id="late"
                  label="Late"
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
                  value={formModalValue.late}
                  onChange={handleFormChangeTextField('late')}
                  error={errorForm.late}
                  helperText={errorForm.late}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  disabled
                  required
                  id="early"
                  label="Early"
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
                  value={formModalValue.early}
                  onChange={handleFormChangeTextField('early')}
                  error={errorForm.early}
                  helperText={errorForm.early}
                />
              </Grid>
              <Grid item xs={12} md={12}>
                {errorForm.errorCount && (
                  <FormHelperText id="filled-weight-helper-text">
                    <span style={{ color: 'red' }}>
                      {errorForm.errorCount}
                    </span>
                  </FormHelperText>
                )}
              </Grid>
            </Grid>
            <Grid container spacing={2}>
              <div className={classes.groupTitle}>
                Request Infomation
              </div>
            </Grid>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <KeyboardDatePicker
                  required
                  disableToolbar
                  variant="inline"
                  format="DD/MM/YYYY"
                  id="date-picker-inline"
                  label="Compensation Date"
                  KeyboardButtonProps={{
                    'aria-label': 'change date',
                  }}
                  shouldDisableDate={handleDisabledDate}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  style={{ width: '100%' }}
                  value={formModalValue.comp}
                  onChange={handleFormChangeDate('comp')}
                  error={errorForm.comp}
                  onClose={handleAcceptCompDate}
                  helperText={errorForm.comp}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  disabled
                  required
                  id="overTime"
                  label="Over Time"
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
                  value={formModalValue.overTime}
                  onChange={handleFormChangeDate('overTime')}
                  error={errorForm.overTime}
                  helperText={errorForm.overTime}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  disabled
                  required
                  id="timerequest"
                  label="Time Request"
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
                  value={formModalValue.timeRequest}
                  onChange={handleFormChangeDate('timeRequest')}
                  error={errorForm.timeRequest}
                  helperText={errorForm.timeRequest}
                />
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
                  onChange={handleFormChangeTextField('comment')}
                  style={{ width: '100%' }}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  error={errorForm.comment}
                  helperText={errorForm.comment}
                />
              </Grid>
            </Grid>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                {remainRequest
                  && Number(remainRequest.numberOfLeftRequest) + 1
                  && (
                    <span className={classes.checkRequest}>
                      {remainRequest.numberOfLeftRequest > 0
                        ? ` You are allowed to make ${remainRequest.numberOfLeftRequest}/${remainRequest.maxRequestDay} requests`
                        : 'You don\'t have any request left to make'}
                    </span>
                  )}

              </Grid>
            </Grid>
            <Grid
              container
              spacing={1}
              justify="center"
              style={{ marginTop: 20 }}
            >
              {
                infoProps && infoProps.id && (
                  <Grid item xs={2}>
                    <Button
                      style={{ width: '80%' }}
                      variant="contained"
                      color="secondary"
                      onClick={handleDeleteLateEarlyRequest}
                    >
                      Delete
                    </Button>
                  </Grid>
                )
              }

              <Grid item xs={2}>
                <Button
                  variant="contained"
                  style={{ width: '80%' }}
                  color="primary"
                  onClick={handleSubmitForm}
                  disabled={errorForm.comp}
                >
                  Submit
                </Button>
              </Grid>
              <Grid item xs={2}>
                <Button
                  variant="contained"
                  style={{ width: '80%' }}
                  onClick={handleResetForm}
                >
                  Reset
                </Button>
              </Grid>

            </Grid>
          </MuiPickersUtilsProvider>
        </div>
      </Modal>
    </>
  );
}

LateEarlyModalComponent.propTypes = {
  openProps: bool,
  setOpenModal: func,
  infoProps: object,
  refreshListFunc: func,
  setInfoModal: func
};

LateEarlyModalComponent.defaultProps = {
  openProps: false,
  infoProps: {},
  setOpenModal: () => { },
  refreshListFunc: () => { },
  setInfoModal: () => { }
};
