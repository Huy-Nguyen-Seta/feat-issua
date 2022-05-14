/* eslint-disable react/prop-types */
/* eslint-disable array-callback-return */
import React, { useState, useEffect } from 'react';
import {
  Modal, Grid, TextField, Button, Tooltip,
  Popover, Typography
} from '@material-ui/core';
import EditIcon from '@material-ui/icons/Edit';
import AddIcon from '@material-ui/icons/Add';
import DeleteIcon from '@material-ui/icons/Delete';
import { useDispatch } from 'react-redux';
import moment from 'moment';
import MomentUtils from '@date-io/moment';
import {
  MuiPickersUtilsProvider,
  KeyboardDatePicker,
} from '@material-ui/pickers';
import { makeStyles } from '@material-ui/styles';

import CustomTable from '../CustomTable';
import { requiredValidate, requiredDateValidate, rangeDateValidate } from '../../helper/validate';
import {
  getUserWorktimeHistory,
  requestDeleteUserWorktime,
  requestPostUserWorktime,
  requestPutUserWorktime
} from '../../state/modules/user/actions';
import { showNotification } from '../../state/modules/notification/actions';
import {
  setHourTime
} from '../../helper/helper';
import { styles } from './styles';

const originalForm = {
  fromDate: null,
  fromTime: '',
  toTime: '',
  startBreakTime: '12:00',
  endBreakTime: '13:00',
  toDate: null,
  description: ''
};

const originalError = {
  fromTime: false,
  toTime: false,
  startBreakTime: false,
  endBreakTime: false,
  fromDate: false,
  toDate: false,
  description: false
};
const dataMoment = ['fromDate', 'toDate'];
const packageData = [['fromDate', 'toDate'], ['fromTime', 'toTime'], ['startBreakTime', 'endBreakTime']];
const validateMapper = {
  fromTime: requiredValidate,
  toTime: requiredValidate,
  startBreakTime: requiredValidate,
  endBreakTime: requiredValidate,
  fromDate: requiredDateValidate
};

const useStyles = makeStyles((theme) => ({ ...styles(theme) }));

export default function WorkingScheduleSetting({ openProps, setOpenPropsModal, }) {
  const dispatch = useDispatch();
  const classes = useStyles();

  const [formValues, setFormValues] = useState(originalForm);
  const [error, setError] = useState(originalError);
  const [isAddingWorkingTime, setIsAddingWorkingTime] = useState(false);
  const [isEdittingWorkingTime, setIsEdittingWorkingTime] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [dataSource, setDataSource] = useState([{
    fromDate: '16/06/2020',
    toDate: '16/06/2022',
    fromTime: '09:00',
    toTime: '18:00',
    startBreakTime: '12:00',
    endBreakTime: '13:00',
  }]);

  const handleCloseModal = () => {
    setFormValues(originalForm);
    setError(originalError);
    setOpenPropsModal({});
    setIsAddingWorkingTime(false);
    setIsEdittingWorkingTime(false);
  };

  useEffect(() => {
    if (JSON.stringify(openProps) !== '{}') {
      dispatch(getUserWorktimeHistory({
        filter: {
          userId: openProps && openProps.id
        },
        callback: (res) => {
          if (res && res.data) {
            setDataSource(res.data);
          } else {
            dispatch(showNotification('failed', res.error.message || res.error, true));
          }
        }
      }));
    }
  }, [openProps]);

  const handleChange = (type) => (e) => {
    let tempError = { ...error };

    packageData.map((item) => {
      if (item.includes(type)) {
        tempError = {
          ...tempError,
          [item[0]]: '',
          [item[1]]: ''
        };
      }
    });
    const valueObj = {
      ...formValues,
      [type]: dataMoment.includes(type) ? moment(e) : e.target.value
    };
    const errorObj = {
      ...tempError,
      [type]: validateMapper[type]
        ? validateMapper[type](dataMoment.includes(type) ? moment(e) : e.target.value)
        : false,
    };

    setError(errorObj);
    setFormValues(valueObj);
  };

  const validateForm = () => {
    let errorObj = error;

    Object.keys(errorObj).map((item) => {
      errorObj = {
        ...errorObj,
        [item]: validateMapper[item] ? validateMapper[item](formValues[item]) : false,
      };
    });
    if (formValues.toDate && moment(formValues.toDate).isValid()) {
      const dataValidateDate = rangeDateValidate(formValues.fromDate, formValues.toDate);
      if (dataValidateDate.length > 0) {
        errorObj = {
          ...errorObj,
          fromDate: dataValidateDate[0],
          toDate: dataValidateDate[1],
        };
      }
    }
    if (formValues.fromTime && formValues.toTime) {
      const validateTime = rangeDateValidate(setHourTime(moment(), formValues.fromTime),
        setHourTime(moment(), formValues.toTime));
      if (validateTime && validateTime.length > 0) {
        errorObj = {
          ...errorObj,
          fromTime: validateTime[0],
          toTime: validateTime[1],
        };
      }
    }
    if (formValues.startBreakTime && formValues.endBreakTime) {
      const validateTimeBreaking = rangeDateValidate(
        setHourTime(moment(), formValues.startBreakTime),
        setHourTime(moment(), formValues.endBreakTime)
      );
      if (validateTimeBreaking && validateTimeBreaking.length > 0) {
        errorObj = {
          ...errorObj,
          startBreakTime: validateTimeBreaking[0],
          endBreakTime: validateTimeBreaking[1],
        };
      }
    }

    const errorFlag = Object.keys(errorObj).reduce(
      (callbackVal, currentVal) => callbackVal || errorObj[currentVal],
      false
    );

    setError(errorObj);

    return errorFlag;
  };

  const handleEditWorkingTime = (record) => () => {
    setIsAddingWorkingTime(false);
    setIsEdittingWorkingTime(true);
    setError(originalError);
    setFormValues(record);
  };

  const handleClosePopOver = () => {
    setAnchorEl(null);
  };

  const handleConfirmDeleteItem = (row) => (event) => {
    setAnchorEl({ event: event.currentTarget, id: row.id });
  };

  const handleDeleteWorkingTime = (record) => () => {
    const payload = { id: record.id };

    dispatch(requestDeleteUserWorktime({
      payload,
      callback: (res) => {
        if (res && res.data) {
          dispatch(getUserWorktimeHistory({
            filter: {
              userId: record.userId
            },
            callback: (res2) => {
              if (res2 && res2.data) {
                setDataSource(res2.data);
                dispatch(showNotification('success', 'Delete working time successfully'));
              } else {
                dispatch(showNotification('failed', res2.error.message || res2.error, true));
              }
            }
          }));
        } else {
          dispatch(showNotification('failed', res.error.message || res.error, true));
        }
      }
    }));

    handleClosePopOver();
  };

  const handleClose = () => {
    setIsAddingWorkingTime(false);
    setIsEdittingWorkingTime(false);
    setFormValues({});
  };

  const handleSubmitForm = (type) => () => {
    const errors = validateForm();
    if (errors) return;

    const payload = {
      userId: openProps && openProps.id,
      fromDate: moment(formValues.fromDate).startOf('day').clone().utc(),
      fromTime: moment(formValues.fromTime, 'HH:mm').utc().set({ s: 0 }).format('HH:mm:ss'),
      toTime: moment(formValues.toTime, 'HH:mm').utc().set({ s: 0 }).format('HH:mm:ss'),
      startBreakTime: moment(formValues.startBreakTime, 'HH:mm').utc().set({ s: 0 }).format('HH:mm:ss'),
      endBreakTime: moment(formValues.endBreakTime, 'HH:mm').utc().set({ s: 0 }).format('HH:mm:ss'),
    };
    if (formValues.toDate && moment(formValues.toDate).isValid()) {
      payload.toDate = moment(formValues.toDate).clone().utc();
    }
    if (formValues.description) {
      payload.description = formValues.description;
    }

    if (type === 'add') {
      dispatch(requestPostUserWorktime({
        payload,
        callback: (res) => {
          if (res && res.data) {
            handleClose();
            dispatch(getUserWorktimeHistory({
              filter: {
                userId: payload.userId
              },
              callback: (res2) => {
                if (res2 && res2.data) {
                  setDataSource(res2.data);
                } else {
                  dispatch(showNotification('failed', res2.error.message || res2.error, true));
                }
              }
            }));
          } else {
            dispatch(showNotification('failed', res.error.message || res.error, true));
          }
        }
      }));
    } else if (type === 'update') {
      payload.id = formValues.id;

      dispatch(requestPutUserWorktime({
        payload,
        callback: (res) => {
          if (res && res.data) {
            handleClose();
            dispatch(getUserWorktimeHistory({
              filter: {
                userId: payload.userId
              },
              callback: (res2) => {
                if (res2 && res2.data) {
                  setDataSource(res2.data);
                } else {
                  dispatch(showNotification('failed', res2.error.message || res2.error, true));
                }
              }
            }));
          } else {
            dispatch(showNotification('failed', res.error.message || res.error, true));
          }
        }
      }));
    }
  };

  const columns = [
    {
      field: 'fromDate',
      label: 'Start Date',
      render: (text) => text && moment(text).format('DD/MM/YYYY')
    },
    {
      field: 'toDate',
      label: 'End Date',
      render: (text) => text && moment(text).format('DD/MM/YYYY')
    },
    {
      field: 'fromTime',
      label: 'Start-working',
      render: (text) => text && moment.utc(text, 'HH:mm:ss').local().format('HH:mm')

    },
    {
      field: 'toTime',
      label: 'End-working',
      render: (text) => text && moment.utc(text, 'HH:mm:ss').local().format('HH:mm')

    },
    {
      field: 'startBreakTime',
      label: 'Start-breaking',
      render: (text) => text && moment.utc(text, 'HH:mm:ss').local().format('HH:mm')
    },
    {
      field: 'endBreakTime',
      label: 'End-breaking',
      render: (text) => text && moment.utc(text, 'HH:mm:ss').local().format('HH:mm')
    },
    {
      field: 'description',
      label: 'Description'
    },
    {
      field: '#',
      label: 'Action',
      render: (record, index, row) => (
        <>
          <div>
            <Tooltip title="Edit">
              <EditIcon style={{ cursor: 'pointer' }} onClick={handleEditWorkingTime(row)} />
            </Tooltip>
            <Tooltip title="Delete">
              <DeleteIcon
                style={{ cursor: 'pointer' }}
                onClick={handleConfirmDeleteItem(row)}
              />
            </Tooltip>

            <Popover
              open={anchorEl && anchorEl.event && Boolean(anchorEl.event)}
              anchorEl={anchorEl && anchorEl.event}
              onClose={handleClosePopOver}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'center',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'center',
              }}
            >
              <Typography className={classes.typography}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <span>
                      Do you want to delete this working time ?
                    </span>
                  </Grid>
                </Grid>
                <Grid
                  container
                  spacing={2}
                  direction="row"
                  justify="flex-end"
                  alignItems="center"
                >
                  <Grid item xs={3}>
                    <Button
                      size="small"
                      variant="contained"
                      onClick={handleClosePopOver}
                    >
                      No
                    </Button>
                  </Grid>
                  <Grid item xs={4}>
                    <Button
                      size="small"
                      variant="contained"
                      color="primary"
                      onClick={handleDeleteWorkingTime(row)}
                    >
                      Yes
                    </Button>
                  </Grid>
                </Grid>

              </Typography>

            </Popover>
          </div>

        </>
      )
    },
  ];

  const handleDisabledDate = (date) => [6, 7].includes(date.isoWeekday());

  const handleAddWorkingTime = () => {
    setFormValues(originalForm);
    setError(originalError);
    setIsAddingWorkingTime(true);
    setIsEdittingWorkingTime(false);
  };

  return (
    <>
      <Modal
        open={JSON.stringify(openProps) !== '{}'}
        onClose={handleCloseModal}
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
        className={classes.modalStyle}
      >
        <div
          className={classes.bodyModalStyles}
          style={{ width: '50%' }}
        >
          <Grid
            container
            spacing={2}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-around',
              marginBottom: 10
            }}
          >
            <div className={classes.groupTitle} style={{ marginTop: 0 }}>
              Change Working Schedule of
              {' '}
              {`${openProps.name} - ${openProps.badgeNumber || '//'}`}
            </div>
            <Button
              variant="contained"
              color="primary"
              onClick={handleAddWorkingTime}
              size="small"
              disabled={isAddingWorkingTime}

            >
              <AddIcon />
            </Button>
          </Grid>

          <Grid container spacing={4}>
            <Grid item xs={12}>
              <CustomTable
                dataSource={dataSource}
                columns={columns}
                pagination={null}
                classnameHeaderCell={classes.headerTable}
                classnameBodyCell={classes.bodyTable}
              />
            </Grid>

          </Grid>

          {(isAddingWorkingTime || isEdittingWorkingTime) && (
            <>
              <MuiPickersUtilsProvider utils={MomentUtils}>
                <Grid
                  container
                  spacing={4}
                >
                  <Grid item xs={12} md={3}>
                    <KeyboardDatePicker
                      required
                      disableToolbar
                      variant="inline"
                      format="DD/MM/YYYY"
                      id="date-picker-inline"
                      label="From Date"
                      KeyboardButtonProps={{
                        'aria-label': 'change date',
                      }}
                      InputLabelProps={{
                        shrink: true,
                      }}
                      shouldDisableDate={handleDisabledDate}

                      style={{ width: '100%' }}
                      value={formValues.fromDate}
                      onChange={handleChange('fromDate')}
                      error={error.fromDate}
                      helperText={error.fromDate}
                    />
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <KeyboardDatePicker
                      disableToolbar
                      variant="inline"
                      format="DD/MM/YYYY"
                      id="date-picker-inline"
                      label="To Date"
                      KeyboardButtonProps={{
                        'aria-label': 'change date',
                      }}
                      InputLabelProps={{
                        shrink: true,
                      }}
                      shouldDisableDate={handleDisabledDate}
                      style={{ width: '100%' }}
                      value={formValues.toDate}
                      onChange={handleChange('toDate')}
                    />
                  </Grid>

                  <Grid item xs={12} md={3}>
                    <TextField
                      required
                      id="start-time"
                      label="Start-woring Hour"
                      type="time"
                      defaultValue="08:30"
                      InputLabelProps={{
                        shrink: true,
                      }}
                      inputProps={{
                        step: 1800,
                      }}
                      style={{ width: '100%' }}
                      value={formValues.fromTime}
                      onChange={handleChange('fromTime')}
                      error={error.fromTime}
                      helperText={error.fromTime}
                    />
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <TextField
                      required
                      id="start-time"
                      label="End-working Hour"
                      type="time"
                      defaultValue="08:30"
                      InputLabelProps={{
                        shrink: true,
                      }}
                      inputProps={{
                        step: 1800,
                      }}
                      style={{ width: '100%' }}
                      value={formValues.toTime}
                      onChange={handleChange('toTime')}
                      error={error.toTime}
                      helperText={error.toTime}
                    />
                  </Grid>

                </Grid>
                <Grid
                  container
                  spacing={4}
                >
                  <Grid item xs={12} md={3}>
                    <TextField
                      required
                      label="Start-breaking Hour"
                      type="time"
                      InputLabelProps={{
                        shrink: true,
                      }}
                      inputProps={{
                        step: 1800,
                      }}
                      style={{ width: '100%' }}
                      value={formValues.startBreakTime}
                      onChange={handleChange('startBreakTime')}
                      error={error.startBreakTime}
                      helperText={error.startBreakTime}
                    />
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <TextField
                      required
                      label="End-breaking Hour"
                      type="time"
                      InputLabelProps={{
                        shrink: true,
                      }}
                      inputProps={{
                        step: 1800,
                      }}
                      style={{ width: '100%' }}
                      value={formValues.endBreakTime}
                      onChange={handleChange('endBreakTime')}
                      error={error.endBreakTime}
                      helperText={error.endBreakTime}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Description"
                      InputLabelProps={{
                        shrink: true,
                      }}
                      style={{ width: '100%' }}
                      value={formValues.description}
                      onChange={handleChange('description')}
                      error={error.description}
                      helperText={error.description}
                    />
                  </Grid>
                </Grid>

              </MuiPickersUtilsProvider>
              <Grid
                container
                spacing={2}
              >
                <Grid
                  container
                  spacing={1}
                  justify="center"
                  style={{ marginTop: 20 }}
                >
                  <Grid item md={3} xs={3}>
                    <Button
                      style={{ width: '80%' }}
                      variant="contained"
                      onClick={handleClose}
                      color="secondary"
                    >
                      Close
                    </Button>
                  </Grid>
                  <Grid item md={3} xs={3}>
                    {isAddingWorkingTime && (
                    <Button
                      variant="contained"
                      style={{ width: '80%' }}
                      color="primary"
                      onClick={handleSubmitForm('add')}
                    >
                      Add
                    </Button>
                    )}
                    {isEdittingWorkingTime && (
                    <Button
                      variant="contained"
                      style={{ width: '80%' }}
                      color="primary"
                      onClick={handleSubmitForm('update')}
                    >
                      Update
                    </Button>
                    )}
                  </Grid>
                </Grid>
              </Grid>
            </>
          )}
        </div>

      </Modal>
    </>
  );
}
