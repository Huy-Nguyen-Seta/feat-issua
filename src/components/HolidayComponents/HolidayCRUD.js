/* eslint-disable no-unused-vars */
/* eslint-disable import/extensions */
/* eslint-disable import/named */
/* eslint-disable react/forbid-prop-types */
/* eslint-disable array-callback-return */
import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import moment from 'moment';
import {
  Modal, Grid, TextField,
  Button,
} from '@material-ui/core';
import MomentUtils from '@date-io/moment';
import { useDispatch, } from 'react-redux';
import {
  MuiPickersUtilsProvider,
  KeyboardDatePicker,
} from '@material-ui/pickers';
import { bool, func, object } from 'prop-types';
import { requestPostHoliday, requestPutHoliday } from '../../state/modules/holidays/actions';

import { showNotification } from '../../state/modules/notification/actions';
import { requiredValidate, requiredDateValidate } from '../../helper/validate';
import { styles } from './styles';

const useStyles = makeStyles((theme) => ({
  ...styles(theme)
}));

const originForm = {
  note: '',
  name: '',
  startDate: moment(),
  endDate: moment()
};

const originError = {
  note: false,
  name: false,
  startDate: false,
  endDate: false
};

const validateMapper = {
  name: requiredValidate,
  startDate: requiredDateValidate,
  endDate: requiredDateValidate
};

export default function HolidayCRUD({
  openProps, infoProps, setOpenModal,
  refreshListFunc
}) {
  const dispatch = useDispatch();
  const [formModalValue, setFormModalValue] = useState(originForm);
  const [errorForm, setErrorForm] = useState(originError);

  const classes = useStyles();
  useEffect(() => {
    if (infoProps && infoProps.id) {
      const dataFormUpdate = {
        startDate: infoProps && infoProps.startDate && moment(infoProps.startDate),
        endDate: infoProps && infoProps.endDate && moment(infoProps.endDate),
        note: infoProps && infoProps.description,
        name: infoProps && infoProps.name,

      };

      setFormModalValue(dataFormUpdate);
    } else {
      setFormModalValue(originForm);
      setErrorForm(originError);
    }
  }, [openProps]);

  const handleFormChangeDate = (type) => (value) => {
    const valueChange = {
      ...formModalValue,
      [type]: moment(value)
    };
    let errorChange = {
      ...errorForm,
      endDate: '',
      startDate: ''
    };

    if (valueChange.startDate.isValid() && valueChange.endDate.isValid()
      && valueChange.startDate.valueOf() > valueChange.endDate.valueOf()) {
      errorChange = {
        ...errorChange,
        endDate: 'End date must be greater than start date',
        startDate: 'Start date must be less than end date',

      };
    }
    setErrorForm(errorChange);
    setFormModalValue(valueChange);
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
    if (objValue.startDate.isValid() && objValue.endDate.isValid()
      && objValue.startDate.valueOf() > objValue.endDate.valueOf()) {
      errorObj = {
        ...errorObj,
        endDate: 'End date must be greater than start date',
        startDate: 'Start date must be less than end date',

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
    const dataUpdate = {
      name: formModalValue.name,
      startDate: formModalValue.startDate.format('YYYY-MM-DD'),
      endDate: formModalValue.endDate.format('YYYY-MM-DD'),
      // description: formModalValue.note,
    };
    if (formModalValue.note) dataUpdate.description = formModalValue.note;
    if (infoProps && infoProps.id) {
      dispatch(requestPutHoliday({
        payload: {

          ...dataUpdate
        },
        id: infoProps.id,
        callback: (res) => {
          if (res.error) {
            dispatch(showNotification('failed', res.error.message || res.error, true));
          } else {
            setOpenModal(false);
            if (refreshListFunc) refreshListFunc();
          }
        }

      }));
    } else {
      dispatch(requestPostHoliday({
        payload: dataUpdate,
        callback: (res) => {
          if (res.error) {
            dispatch(showNotification('failed', res.error.message || res.error, true));
          } else {
            setOpenModal(false);
            if (refreshListFunc) refreshListFunc();
          }
        }

      }));
    }
  };

  const handleResetForm = () => {
    setErrorForm(originError);
    if (infoProps && infoProps.id) {
      setFormModalValue({
        startDate: infoProps && infoProps.startDate && moment(infoProps.startDate),
        endDate: infoProps && infoProps.endDate && moment(infoProps.endDate),
        note: infoProps && infoProps.description,
        name: infoProps && infoProps.name,

      });
    } else {
      setFormModalValue(originForm);
    }
  };

  const handleCloseModal = () => {
    handleResetForm();
    setOpenModal(false);
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
                <TextField
                  required
                  id="title"
                  label="Title"
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
                  value={formModalValue.name}
                  onChange={handleFormChangeTextField('name')}
                  error={errorForm.name}
                  helperText={errorForm.name}
                />
              </Grid>
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
                  InputProps={{
                    classes: {
                      root: classes.inputRoot,
                      disabled: classes.disabled
                    }
                  }}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  style={{ width: '100%' }}
                  value={formModalValue.startDate}
                  onChange={handleFormChangeDate('startDate')}
                  error={errorForm.startDate}
                  helperText={errorForm.startDate}

                />
              </Grid>
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
                  InputProps={{
                    classes: {
                      root: classes.inputRoot,
                      disabled: classes.disabled
                    }
                  }}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  style={{ width: '100%' }}
                  value={formModalValue.endDate}
                  onChange={handleFormChangeDate('endDate')}
                  error={errorForm.endDate}
                  helperText={errorForm.endDate}

                />
              </Grid>

            </Grid>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  id="note"
                  label="Note"
                  multiline
                  rows={2}
                  value={formModalValue.note}
                  onChange={handleFormChangeTextField('note')}
                  style={{ width: '100%' }}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  error={errorForm.note}
                  helperText={errorForm.note}
                />
              </Grid>
            </Grid>

            <Grid
              container
              spacing={1}
              justify="center"
              style={{ marginTop: 20 }}
            >
              <Grid item xs={2}>
                <Button
                  style={{ width: '80%' }}
                  variant="contained"
                  color="secondary"
                  onClick={handleCloseModal}
                >
                  Close
                </Button>
              </Grid>
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

HolidayCRUD.propTypes = {
  openProps: bool,
  setOpenModal: func,
  infoProps: object,
  refreshListFunc: func,
};

HolidayCRUD.defaultProps = {
  openProps: false,
  infoProps: {},
  setOpenModal: () => { },
  refreshListFunc: () => { },
};
