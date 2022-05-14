/* eslint-disable no-unreachable */
/* eslint-disable react/prop-types */
/* eslint-disable array-callback-return */
import React,
{
  useState,
  useEffect
} from 'react';
import { makeStyles } from '@material-ui/core/styles';
import moment from 'moment';
import {
  Modal, Grid, TextField,
  Button, FormControl,
} from '@material-ui/core';
import MomentUtils from '@date-io/moment';
import {
  MuiPickersUtilsProvider,
  KeyboardDatePicker,
} from '@material-ui/pickers';
import { useDispatch, useSelector } from 'react-redux';
import { bool } from 'prop-types';
import { styles } from './styles';
import { requestPostLeaveRequests, requestPutRequestsLeave, requestCheckDayleaves } from '../../state/modules/requests/actions';
import { showNotification } from '../../state/modules/notification/actions';
import { requiredValidate, requiredDateValidate } from '../../helper/validate';
import { userSelector } from '../../state/modules/user';
import { reasonsSelector } from '../../state/modules/reason';
import {
  getDaysFromHours, getBackToWorkDate, getOffTimeHour,
  getLeaveHour, setHourTime, getRoundUpRequestTime
} from '../../helper/helper';
import { LeaveReasonSelect } from '../LeaveReasonComponent';
import { reasonCarryOverId } from '../../global/constants';

const useStyles = makeStyles((theme) => ({
  ...styles(theme)
}));

const originError = {
  FromDate: false,
  ToDate: false,
  reason: false,
  comment: false,
  startTime: false,
  endTime: false,
};

const validateMapper = {
  FromDate: requiredDateValidate,
  ToDate: requiredDateValidate,
  reason: requiredValidate,
  startTime: requiredValidate,
  endTime: requiredValidate,
  comment: requiredValidate
};

const dataRemainDefault = null;

export function DayLeavesCRUD({
  openProps, refreshListFunc, setOpenPropsModal, editModal, setEditModal
}) {
  const { user } = useSelector(userSelector);
  const originForm = {
    FromDate: moment(),
    ToDate: moment(),
    reason: '',
    comment: '',
    startTime: user.fromTime,
    endTime: user.toTime,
    backToWorkDate:
      getBackToWorkDate(moment().set(user.toTime ? { h: user.toTime.split(':')[0], m: user.toTime.split(':')[1], s: 0 } : {
        h: 17, m: 30, s: 0
      }), user),
    offTimeHour: 8
  };
  const dispatch = useDispatch();
  const classes = useStyles();
  const { reasonList } = useSelector(reasonsSelector);
  const [formModalValue, setFormModalValue] = useState(originForm);
  const [errorForm, setErrorForm] = useState(originError);
  const [remainDays, setRemainDays] = useState(dataRemainDefault);
  const getOffTimeLeaveHour = (data) => {
    if (data && data.FromDate && data.FromDate.isValid() && data.ToDate && data.ToDate.isValid()) {
      const startTime = setHourTime(data.FromDate.clone(), data.startTime);
      const startRange = getLeaveHour(startTime, 0, user);
      const endTime = setHourTime(data.ToDate.clone(), data.endTime);
      const endRange = getLeaveHour(endTime, 1, user);
      const offTimeHour = getOffTimeHour(
        startRange,
        endRange,
        user.fromTime,
        user.toTime
      );
      return offTimeHour;
    }
    return 0;
  };

  useEffect(
    () => {
      if (JSON.stringify(editModal) !== '{}') {
        let dataFormUpdate = {
          FromDate: moment(editModal.startDateTime),
          startTime: moment(editModal.startDateTime).format('HH:mm'),
          ToDate: moment(editModal.endDateTime),
          endTime: moment(editModal.endDateTime).format('HH:mm'),
          backToWorkDate: getBackToWorkDate(moment(editModal.endDateTime).clone(), user),
          reason: editModal.reasonId,
          comment: editModal.comment,

        };
        const offTimeHour = getOffTimeLeaveHour({
          ...dataFormUpdate,
        });
        dataFormUpdate = {
          ...dataFormUpdate,
          offTimeHour
        };

        setFormModalValue(dataFormUpdate);
        dispatch(requestCheckDayleaves({
          filter: {
            requestTypeId: '6c2cc1c7-9555-49b6-89a7-debd4c10d46f',
            reasonId: editModal.reasonId,
            fromDate: moment().startOf('year').format('YYYY-MM-DD'),
            toDate: moment().endOf('year').format('YYYY-MM-DD'),
          },
          callback: (res) => {
            if (res && res.data) {
              setRemainDays(res.data);
            }
          }
        }));
      } else {
        setFormModalValue(originForm);
        setErrorForm(originError);
      }
    },
    [editModal]
  );

  const setBackToWorkDate = (data) => ({
    ...data,
    backToWorkDate: getBackToWorkDate(data.ToDate.clone().set({ h: data.endTime.split(':')[0], m: data.endTime.split(':')[1], s: 0 }), user),

  });

  const validateForm = (objValue) => {
    let errorObj = { ...errorForm };
    // validate required
    Object.keys(objValue).map((item) => {
      errorObj = {
        ...errorObj,
        [item]: validateMapper[item] ? validateMapper[item](objValue[item]) : false,
      };
    });

    const startTime = setHourTime(objValue.FromDate.clone(), objValue.startTime);
    const startRange = getLeaveHour(startTime, 0, user);
    const endTime = setHourTime(objValue.ToDate.clone(), objValue.endTime);
    const endRange = getLeaveHour(endTime, 1, user);

    // validate date
    if (objValue.ToDate.isValid() && objValue.FromDate.isValid()) {
      if (endRange.isBefore(startRange)) {
        errorObj = {
          ...errorObj,
          ToDate: 'End date must be greater than start date',
          startTime: 'Start date must be less than end date',
          FromDate: 'Start date must be less than end date',
          endTime: 'End date must be greater than start date',
        };
      } else {
        const maternityLeaveId = reasonList.find((reason) => reason.name === 'Maternity leave')
          && reasonList.find((reason) => reason.name === 'Maternity leave').id;
        if (objValue.reason === maternityLeaveId && startRange.isBefore(moment())) {
          errorObj = {
            ...errorObj,
            ToDate: 'End date must be less than now',
            startTime: 'Start date must be less than now',
            FromDate: 'Start date must be less than now',
            endTime: 'End date must be less than now',
          };
        }
      }
    }

    const offTimeHour = getOffTimeHour(
      startRange,
      endRange,
      user.fromTime,
      user.toTime
    );

    if (remainDays && remainDays.numberOfLeftHour) {
      if (offTimeHour > remainDays.numberOfLeftHour) {
        errorObj = {
          ...errorObj,
          ToDate: 'During time is greater than remaining days',
          FromDate: 'During time is greater than remaining days',
        };
      }
    } else {
      errorObj = {
        ...errorObj,
        reason: 'This field must not be empty',
      };
    }
    if (formModalValue.reason === reasonCarryOverId) {
      if ((moment(formModalValue.FromDate).month()) + 1 > 3) {
        errorObj = {
          ...errorObj,
          FromDate: 'Carry-over leave can be used only from January to March',
        };
      }
      if ((moment(formModalValue.ToDate).month()) + 1 > 3) {
        errorObj = {
          ...errorObj,
          ToDate: 'Carry-over leave can be used only from January to March',
        };
      }
    }
    setErrorForm({ ...errorObj });
    const errorFlag = Object.keys(errorObj).reduce(
      (callbackVal, currentVal) => callbackVal || errorObj[currentVal],
      false
    );
    return errorFlag;
  };

  const handleFormChangeDate = (type) => (value) => {
    setErrorForm({
      ...errorForm,
      startTime: '',
      endTime: '',
      FromDate: '',
      ToDate: ''
    });
    let dataFormValue = {
      ...formModalValue,
      [type]: moment(value),

    };
    if (type === 'FromDate' && dataFormValue.FromDate.valueOf() > dataFormValue.ToDate.valueOf()) {
      dataFormValue = {
        ...dataFormValue,
        ToDate: moment(value),
      };
    }
    dataFormValue = {
      ...dataFormValue,
      offTimeHour: getOffTimeLeaveHour(dataFormValue)
    };

    dataFormValue = setBackToWorkDate(dataFormValue);
    setFormModalValue({ ...dataFormValue });
  };

  const handleFormChangeTextField = (type) => (e) => {
    setErrorForm({
      ...errorForm,
      [type]: false
    });
    let dataChange = {
      ...formModalValue,
      [type]: e.target.value,

    };

    if (type === 'startTime' || type === 'endTime') {
      dataChange = {
        ...dataChange,
        offTimeHour: getOffTimeLeaveHour(dataChange)
      };
    }
    setFormModalValue(dataChange);
  };

  const handleResetForm = () => {
    if (JSON.stringify(editModal) !== '{}') {
      setErrorForm(originError);
      setFormModalValue(
        {
          FromDate: moment(editModal.startDateTime),
          startTime: moment(editModal.startDateTime).format('HH:mm'),
          ToDate: moment(editModal.endDateTime),
          endTime: moment(editModal.endDateTime).format('HH:mm'),
          backToWorkDate: getBackToWorkDate(moment(editModal.endDateTime).clone(), user),
          reason: editModal.reasonId,
          comment: editModal.comment,

        }
      );
    } else {
      setRemainDays(dataRemainDefault);
      setErrorForm(originError);
      setFormModalValue(originForm);
    }
  };

  const handleSubmitForm = () => {
    const error = validateForm({ ...formModalValue });
    if (error) {
      return;
    }
    const startTime = setHourTime(formModalValue.FromDate.clone(), formModalValue.startTime);
    const startRange = getLeaveHour(startTime, 0, user);
    const endTime = setHourTime(formModalValue.ToDate.clone(), formModalValue.endTime);
    const endRange = getLeaveHour(endTime, 1, user);

    // get round up start time
    const dataTimeLeave = getRoundUpRequestTime(
      startRange, endRange, user, formModalValue.offTimeHour
    );
    const dataSend = {
      reasonId: formModalValue.reason,
      comment: formModalValue.comment,
      startDateTime: new Date(dataTimeLeave.startTime.utc()),
      endDateTime: new Date(dataTimeLeave.endTime.utc()),
    };

    if (JSON.stringify(editModal) === '{}') {
      dispatch(requestPostLeaveRequests({
        payload: {
          ...dataSend,
          requestTypeId: '6c2cc1c7-9555-49b6-89a7-debd4c10d46f',
          errorCount: false,
        },
        callback: (res) => {
          if (res.error) {
            dispatch(showNotification('failed', res.error.message || res.error, true));
          } else {
            dispatch(showNotification('success', 'Create successfully!',));
          }
          if (refreshListFunc) refreshListFunc();
        }
      }));
    } else {
      const dataUpdate = {};
      if (dataSend.reasonId !== editModal.reasonId) dataUpdate.reasonId = dataSend.reasonId;
      if (dataSend.comment !== editModal.comment) dataUpdate.comment = dataSend.comment;
      if (dataSend.startDateTime.toISOString() !== editModal.startDateTime.toString()) {
        dataUpdate.startDateTime = dataSend.startDateTime;
      }
      if (dataSend.endDateTime.toISOString() !== editModal.endDateTime.toString()) {
        dataUpdate.endDateTime = dataSend.endDateTime;
      }
      dispatch(requestPutRequestsLeave({

        id: editModal.id,
        payload: { ...dataUpdate, status: editModal.status },
        callback: (res) => {
          if (res.error) {
            dispatch(showNotification('failed', res.error.message || res.error, true));
          } else {
            dispatch(showNotification('success', 'Update successfully!',));
          }
          if (refreshListFunc) refreshListFunc();
        }
      }));
    }

    handleResetForm();
    setOpenPropsModal(false);
  };

  const handleCloseModal = () => {
    handleResetForm();
    setOpenPropsModal(false);
    setEditModal({});
  };

  const handleFormChangeSelect = (type) => (event) => {
    setErrorForm({
      ...errorForm,
      [type]: false,
      startTime: '',
      endTime: '',
      FromDate: '',
      ToDate: ''

    });

    if (type === 'reason') {
      dispatch(requestCheckDayleaves({
        filter: {
          requestTypeId: '6c2cc1c7-9555-49b6-89a7-debd4c10d46f',
          reasonId: event,
          fromDate: moment().startOf('year').format('YYYY-MM-DD'),
          toDate: moment().endOf('year').format('YYYY-MM-DD'),
        },
        callback: (res) => {
          if (res && res.data) {
            setRemainDays(res.data);
          }
        }
      }));
    }
    setFormModalValue({
      ...formModalValue,
      [type]: event
    });
  };

  const handleDisabledDate = (date) => [6, 7].includes(date.isoWeekday());

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
            <Grid container spacing={4}>
              <Grid item xs={12} md={4}>
                <KeyboardDatePicker
                  required
                  disableToolbar
                  variant="inline"
                  format="DD/MM/YYYY"
                  id="date-picker-inline"
                  label="Start Date"
                  KeyboardButtonProps={{
                    'aria-label': 'change date',
                  }}
                  InputLabelProps={{ shrink: true }}
                  style={{ width: '100%' }}
                  value={formModalValue.FromDate}
                  onChange={handleFormChangeDate('FromDate')}
                  error={errorForm.FromDate}
                  helperText={errorForm.FromDate}
                  shouldDisableDate={handleDisabledDate}

                />

              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  required
                  ampm={false}

                  id="start-time"
                  label="Start Hour"
                  type="time"
                  defaultValue="08:30"
                  InputLabelProps={{
                    shrink: true,
                  }}
                  inputProps={{
                    step: 1800,
                  }}
                  style={{ width: '100%' }}
                  value={formModalValue.startTime}
                  onChange={handleFormChangeTextField('startTime')}
                  error={errorForm.startTime}
                  helperText={errorForm.startTime}
                />

              </Grid>
            </Grid>
            <Grid container spacing={4}>
              <Grid item xs={12} md={4}>
                <KeyboardDatePicker
                  required
                  disableToolbar
                  variant="inline"
                  format="DD/MM/YYYY"
                  id="date-picker-inline"
                  label="End Date"
                  KeyboardButtonProps={{
                    'aria-label': 'change date',
                  }}
                  InputLabelProps={{ shrink: true }}
                  style={{ width: '100%' }}
                  value={formModalValue.ToDate}
                  onChange={handleFormChangeDate('ToDate')}
                  error={errorForm.ToDate}
                  helperText={errorForm.ToDate}
                  shouldDisableDate={handleDisabledDate}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  required
                  id="start-time"
                  label="End Hour"
                  type="time"
                  defaultValue="17:30"
                  InputLabelProps={{
                    shrink: true,
                  }}
                  inputProps={{
                    step: 1800,
                  }}
                  value={formModalValue.endTime}
                  onChange={handleFormChangeTextField('endTime')}
                  style={{ width: '100%' }}
                  error={errorForm.endTime}
                  helperText={errorForm.endTime}
                />

              </Grid>
            </Grid>
            <Grid container spacing={4}>
              <Grid item xs={12} md={4}>
                <TextField
                  disabled
                  required
                  id="standard_note"
                  label="Off-Time"
                  value={Math.round(formModalValue.offTimeHour * 2) / 2}
                  style={{ width: '100%' }}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  error={errorForm.offTimeHour}
                  helperText={errorForm.offTimeHour}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <KeyboardDatePicker
                  disabled
                  disableToolbar
                  variant="inline"
                  format="DD/MM/YYYY"
                  id="date-picker-inline"
                  label="Back-to-work Date"
                  KeyboardButtonProps={{
                    'aria-label': 'change date',
                  }}
                  style={{ width: '100%' }}
                  value={formModalValue.backToWorkDate}
                  onChange={handleFormChangeDate('backToWorkDate')}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControl required style={{ width: '100%' }} error={errorForm.reason}>
                  <LeaveReasonSelect
                    inputLabel="Request Type"
                    value={formModalValue.reason}
                    onChange={handleFormChangeSelect('reason')}
                    error={errorForm.reason}
                  />
                </FormControl>

              </Grid>

            </Grid>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  required
                  id="standard_note"
                  label="Reason"
                  value={formModalValue.comment}
                  onChange={handleFormChangeTextField('comment')}
                  style={{ width: '100%' }}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  multiline
                  rowsMax={4}
                  rows={2}
                  error={errorForm.comment}
                  helperText={errorForm.comment}
                />
              </Grid>
            </Grid>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                {
                  formModalValue.reason && remainDays && remainDays.numberOfLeftHour > 0 && (
                    <span className={classes.checkRequest}>
                      {' '}
                      You have
                      {' '}
                      {getDaysFromHours(remainDays.numberOfLeftHour).day}
                      {' '}
                      {getDaysFromHours(remainDays.numberOfLeftHour).day > 1 ? 'days' : 'day'}
                      {' '}
                      {getDaysFromHours(remainDays.numberOfLeftHour).hour}
                      {' '}
                      {getDaysFromHours(remainDays.numberOfLeftHour).hour > 1 ? 'hours' : 'hour'}
                      {' '}
                      left to request
                    </span>
                  )
                }
                {
                  formModalValue.reason && remainDays && remainDays.numberOfLeftHour === 0 && (
                    <span className={classes.checkRequest}>
                      You don&apos;t have any day left for this kind of request
                    </span>
                  )
                }
              </Grid>

            </Grid>
            <Grid
              container
              spacing={1}
              justify="center"
              style={{ marginTop: 20 }}
            >
              <Grid item md={2} xs={4}>
                <Button
                  style={{ width: '80%' }}
                  variant="contained"
                  color="secondary"
                  onClick={handleCloseModal}
                >
                  Close
                </Button>
              </Grid>
              <Grid item mdxs={2} xs={4}>
                <Button
                  variant="contained"
                  style={{ width: '80%' }}
                  color="primary"
                  onClick={handleSubmitForm}
                >
                  Submit
                </Button>
              </Grid>
              <Grid item md={2} xs={4}>
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

DayLeavesCRUD.propTypes = {
  // eslint-disable-next-line react/require-default-props
  openProps: bool
};
