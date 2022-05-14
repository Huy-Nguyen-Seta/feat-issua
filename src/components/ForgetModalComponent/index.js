/* eslint-disable import/named */
/* eslint-disable react/forbid-prop-types */
/* eslint-disable array-callback-return */
import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import moment from 'moment';
import {
  Modal, Grid, TextField, Checkbox,
  Button, FormHelperText
} from '@material-ui/core';
import MomentUtils from '@date-io/moment';
import { useDispatch, useSelector } from 'react-redux';
import {
  MuiPickersUtilsProvider,
  KeyboardDatePicker,
} from '@material-ui/pickers';
import { bool, func, object } from 'prop-types';
import {
  requestPostForgetRequests, requestPutRequestsForget,
  requestCheckForgetRequest, requestDeleteRequests
} from '../../state/modules/requests/actions';
import { showNotification } from '../../state/modules/notification/actions';
import { userSelector } from '../../state/modules/user';
import { requiredValidate, } from '../../helper/validate';
import {
  setHourTime,
  checkErrorCount
} from '../../helper/helper';
import { styles } from './styles';

const useStyles = makeStyles((theme) => ({
  ...styles(theme)
}));

const originForm = {
  comment: '',
  errorCount: false
};

const originError = {
  comment: false,
  errorCount: false
};

const validateMapper = {
  comment: requiredValidate,
};

export function ForgetModalComponent({
  openProps, infoProps, setOpenModal, refreshListFunc, setInfoModal
}) {
  const dispatch = useDispatch();
  const { user } = useSelector(userSelector);
  const [formModalValue, setFormModalValue] = useState(originForm);
  const [errorForm, setErrorForm] = useState(originError);

  const [remainErrorCount, setRemainErrorCount] = useState({});
  const classes = useStyles();
  useEffect(() => {
    const dataCheckIn = infoProps && infoProps.checkIn
      ? moment(infoProps.checkIn).format('HH:mm')
      : user.fromTime;
    const dataCheckout = infoProps && infoProps.checkOut
      ? moment(infoProps.checkOut).format('HH:mm')
      : user.toTime;

    let dataUpdate = {
      date: infoProps && infoProps.date,
      checkIn: infoProps && infoProps.checkIn && moment(infoProps.checkIn).format('HH:mm'),
      checkOut: infoProps && infoProps.checkOut && moment(infoProps.checkOut).format('HH:mm'),
      actualCheckIn: infoProps && infoProps.late && infoProps.late !== '00:00:00'
        ? user.fromTime
        : dataCheckIn,
      actualCheckOut: infoProps && infoProps.early && infoProps.early !== '00:00:00'
        ? user.toTime
        : dataCheckout,
    };
    if (infoProps && infoProps.id) {
      dataUpdate = {
        ...dataUpdate,
        errorCount: infoProps && !infoProps.errorCount,
        comment: infoProps && infoProps.comment,
        actualCheckIn: infoProps.startDateTime ? moment(infoProps.startDateTime).format('HH:mm') : dataUpdate.actualCheckIn,
        actualCheckOut: infoProps.endDateTime ? moment(infoProps.endDateTime).format('HH:mm') : dataUpdate.actualCheckOut,
      };
      setRemainErrorCount(null);
    } else {
      dataUpdate = {
        ...dataUpdate,
        comp: null,
        errorCount: false
      };

      if (openProps) {
        dispatch(requestCheckForgetRequest({
          filter: {
            fromDate: moment().startOf('month').format('YYYY-MM-DD'),
            toDate: moment().endOf('month').format('YYYY-MM-DD'),
            requestTypeId: '9c796106-d223-4ced-bb0c-7b0467bbc1f8'
          },
          callback: (res) => {
            if (res.data) {
              setRemainErrorCount(res.data);
            } else {
              dispatch(showNotification('failed', res.error || res.error.message, true));
            }
          }
        }));
      }
    }

    setFormModalValue(dataUpdate);
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
      // validate when this field is not error
      errorObj = {
        ...errorObj,
        [item]: validateMapper[item] ? validateMapper[item](objValue[item]) : false,
      };
    });
    const tempErrorCount = checkErrorCount(formModalValue, infoProps);
    if (!formModalValue.errorCount && remainErrorCount
      && typeof remainErrorCount.numberOfLeftRequest === 'number'
      && tempErrorCount > remainErrorCount.numberOfLeftRequest) {
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

    const actualCheckInDate = setHourTime(moment(formModalValue.date),
      formModalValue.actualCheckIn);
    const actualCheckOutDate = setHourTime(moment(formModalValue.date),
      formModalValue.actualCheckOut);
    if (infoProps && infoProps.id) {
      dispatch(requestPutRequestsForget({
        id: infoProps && infoProps.id,
        payload: {
          errorCount: !formModalValue.errorCount,
          // requestDate: formModalValue.date,
          comment: formModalValue.comment,
          status: infoProps && infoProps.status,

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
      const payloadPost = {
        requestTypeId: '9c796106-d223-4ced-bb0c-7b0467bbc1f8',
        errorCount: !formModalValue.errorCount,
        requestDate: formModalValue.date,
        comment: formModalValue.comment,
      };
      const checkStartDateTime = setHourTime(moment(infoProps.date),
        infoProps && infoProps.checkIn && moment(infoProps.checkIn).format('HH:mm'));
      const checkEndDateTime = setHourTime(moment(infoProps.date),
        infoProps && infoProps.checkOut && moment(infoProps.checkOut).format('HH:mm'));
      if (actualCheckInDate.valueOf() !== checkStartDateTime.valueOf()) {
        payloadPost.startDateTime = new Date(actualCheckInDate.utc());
      }

      if (actualCheckOutDate.valueOf() !== checkEndDateTime.valueOf()) {
        payloadPost.endDateTime = new Date(actualCheckOutDate.utc());
      }
      dispatch(requestPostForgetRequests({
        payload: payloadPost,
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

  const handleFormChangeCheckBox = (type) => (e) => {
    setFormModalValue({
      ...formModalValue,
      [type]: e.target.checked,
    });
  };

  const handleResetForm = () => {
    const dataCheckIn = infoProps && infoProps.checkIn
      ? moment(infoProps.checkIn).format('HH:mm')
      : user.fromTime;
    const dataCheckout = infoProps && infoProps.checkOut
      ? moment(infoProps.checkOut).format('HH:mm')
      : user.toTime;

    setErrorForm(originError);
    setFormModalValue({
      ...originForm,
      date: infoProps && infoProps.date,
      checkIn: infoProps && infoProps.checkIn && moment(infoProps.checkIn).format('HH:mm'),
      checkOut: infoProps && infoProps.checkOut && moment(infoProps.checkOut).format('HH:mm'),
      actualCheckIn: infoProps && infoProps.late && infoProps.late !== '00:00:00'
        ? user.fromTime
        : dataCheckIn,
      actualCheckOut: infoProps && infoProps.early && infoProps.early !== '00:00:00'
        ? user.toTime
        : dataCheckout,
      comp: null,
      errorCount: false
    });
  };

  const handleCloseModal = () => {
    handleResetForm();
    setInfoModal({});
    setOpenModal(false);
  };

  const handleDeleteForgetRequest = () => {
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
                  onChange={handleFormChangeDate('date')}
                  error={errorForm.date}
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
                  onChange={handleFormChangeTextField('actualCheckIn')}
                  error={errorForm.actualCheckIn}
                  helperText={errorForm.actualCheckIn}
                  disabled={infoProps && infoProps.id}
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
                  onChange={handleFormChangeTextField('actualCheckOut')}
                  error={errorForm.actualCheckOut}
                  helperText={errorForm.actualCheckOut}
                  disabled={infoProps && infoProps.id}

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
              <Grid item xs={12} md={8}>
                <Checkbox
                  color="primary"
                  inputProps={{ 'aria-label': 'primary checkbox' }}
                  checked={formModalValue.errorCount}
                  onChange={handleFormChangeCheckBox('errorCount')}
                  error={errorForm.errorCount}
                  helperText={errorForm.errorCount}
                  disabled={infoProps && infoProps.id}

                />
                Special reason (not count as error)
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
                {
                  !formModalValue.errorCount && remainErrorCount
                  && typeof remainErrorCount.numberOfLeftRequest === 'number'
                  && (
                    <span className={classes.checkRequest}>
                      {remainErrorCount.numberOfLeftRequest > 0
                        ? ` You are allowed to get ${remainErrorCount.numberOfLeftRequest}/${remainErrorCount.maxRequestDayPerMonth} error(s) left to request`
                        : 'You don\'t have any request left to make'}
                    </span>
                  )
                }
                {}
              </Grid>
            </Grid>
            <Grid
              container
              spacing={1}
              justify="center"
              style={{ marginTop: 20 }}
            >
              {infoProps && infoProps.id && (
                <Grid item xs={2}>
                  <Button
                    style={{ width: '80%' }}
                    variant="contained"
                    color="secondary"
                    onClick={handleDeleteForgetRequest}
                  >
                    Delete
                  </Button>
                </Grid>
              )}
              <Grid item xs={2}>
                <Button
                  variant="contained"
                  style={{ width: '80%' }}
                  color="primary"
                  onClick={handleSubmitForm}
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

ForgetModalComponent.propTypes = {
  openProps: bool,
  setOpenModal: func,
  infoProps: object,
  refreshListFunc: func,
  setInfoModal: func
};

ForgetModalComponent.defaultProps = {
  openProps: false,
  infoProps: {},
  setOpenModal: () => { },
  refreshListFunc: () => { },
  setInfoModal: () => { }
};
