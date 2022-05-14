import React, { useEffect, useState } from 'react';
import { bool, func, object } from 'prop-types';
import {
  Button,
  Grid, Modal, TextField
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import MomentUtils from '@date-io/moment';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import { useDispatch } from 'react-redux';
import { styles } from './styles';
import {
  requiredValidate, validateNumber
} from '../../helper/validate';
import { updateUserLeave } from '../../state/modules/userLeave/actions';

import { showNotification } from '../../state/modules/notification/actions';

const useStyles = makeStyles((theme) => ({ ...styles(theme) }));
const originalForm = {
  year: null,
  userId: '',
  badgeNumber: '',
  name: '',
  totalLeave: null,
  totalRemain: null,
  carryOver: null,
  carryOverRemain: null,
};
const originalError = {
  year: false,
  userId: false,
  badgeNumber: false,
  name: false,
  totalLeave: false,
  totalRemain: false,
  carryOver: false,
  carryOverRemain: false,
};

const UpdateUserLeaveModal = ({
  openModal, setOpenModal, objEdit, refreshList
}) => {
  const classes = useStyles();
  const [formValues, setFormValues] = useState(originalForm);
  const [error, setError] = useState(originalError);
  const dispatch = useDispatch();
  const handleCloseModal = () => {
    setOpenModal(false);
    if (refreshList) refreshList();
  };
  const validateMapper = JSON.stringify(objEdit) === '{}'
    ? {
      year: requiredValidate,
      userId: requiredValidate,
      badgeNumber: requiredValidate,
      name: requiredValidate,
      totalLeave: validateNumber,
      totalRemain: validateNumber,
      carryOver: validateNumber,
      carryOverRemain: validateNumber,
    }
    : {
      year: requiredValidate,
      userId: requiredValidate,
      badgeNumber: requiredValidate,
      name: requiredValidate,
      totalLeave: validateNumber,
      totalRemain: validateNumber,
      carryOver: validateNumber,
      carryOverRemain: validateNumber,
    };

  const validateForm = () => {
    let errorObj = error;

    // eslint-disable-next-line array-callback-return
    Object.keys(errorObj).map((item) => {
      errorObj = {
        ...errorObj,
        [item]: validateMapper[item] ? validateMapper[item](formValues[item]) : false,
      };
    });

    const errorFlag = Object.keys(errorObj).reduce(
      (callbackVal, currentVal) => callbackVal || errorObj[currentVal],
      false
    );

    setError(errorObj);

    return errorFlag;
  };

  const handleChange = (type) => (e) => {
    const valueObj = {
      ...formValues,
      [type]: e.target.value
    };
    const errorObj = {
      ...error,
      [type]: validateMapper[type] ? validateMapper[type](e.target.value) : false
    };
    setError(errorObj);
    setFormValues(valueObj);
  };
  useEffect(() => {
    if (objEdit) {
      setFormValues({
        year: objEdit?.year,
        userId: objEdit?.userId,
        badgeNumber: objEdit?.badgeNumber,
        name: objEdit?.name,
        totalLeave: objEdit?.totalLeave,
        totalRemain: objEdit?.totalRemain,
        carryOver: objEdit?.carryOver,
        carryOverRemain: objEdit?.carryOverRemain,
      });
    } else {
      setFormValues(originalForm);
    }
    setError(originalError);
  }, [objEdit]);

  const handleOnsubmit = () => {
    const errors = validateForm();
    if (errors) return;
    const payload = { ...formValues, };
    dispatch(updateUserLeave({
      payload,
      callback: (res) => {
        if (res?.error) {
          dispatch(showNotification('failed', res.error.message || res.error, true));
        } else {
          handleCloseModal();
          dispatch(showNotification('success', 'Update successfully!',));
        }
      }
    }));
  };
  return (
    <Modal
      open={openModal}
      onClose={handleCloseModal}
      aria-labelledby="simple-modal-title"
      aria-describedby="simple-modal-description"
      className={classes.modalStyle}
    >
      <div className={classes.bodyModalStyles}>
        <MuiPickersUtilsProvider utils={MomentUtils}>
          <Grid container spacing={4}>
            <div className={classes.groupTitle}>
              Personal Info
            </div>
          </Grid>
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <TextField
                required
                label="Code"
                InputLabelProps={{
                  shrink: true,
                }}
                className={classes.accountInput}
                value={formValues.badgeNumber}
                onChange={handleChange('badgeNumber')}
                error={error.badgeNumber}
                helperText={error.badgeNumber}
                disabled
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                required
                label="Name"
                InputLabelProps={{
                  shrink: true,
                }}
                className={classes.accountInput}
                value={formValues.name}
                onChange={handleChange('name')}
                error={error.name}
                helperText={error.name}
                disabled
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                required
                label="Year"
                InputLabelProps={{
                  shrink: true,
                }}
                className={classes.accountInput}
                value={formValues.year}
                onChange={handleChange('year')}
                error={error.year}
                type="number"
                helperText={error.year}
                disabled
              />
            </Grid>
          </Grid>
          <Grid container spacing={4}>
            <div className={classes.groupTitle}>
              Leave Day
            </div>
          </Grid>
          <Grid container spacing={4}>
            <Grid item xs={6} md={3}>
              <TextField
                type="number"
                required
                label="Total leave (h)"
                InputLabelProps={{
                  shrink: true,
                }}
                className={classes.accountInput}
                value={formValues.totalLeave}
                onChange={handleChange('totalLeave')}
                error={error.totalLeave}
                helperText={error.totalLeave}
              />
            </Grid>
            <Grid item xs={6} md={3}>
              <TextField
                required
                type="number"
                label="Total leave remain (h)"
                InputLabelProps={{
                  shrink: true,
                }}
                className={classes.accountInput}
                value={formValues.totalRemain}
                onChange={handleChange('totalRemain')}
                error={error.totalRemain}
                helperText={error.totalRemain}
              />
            </Grid>
            <Grid item xs={6} md={3}>
              <TextField
                type="number"
                required
                label="Carry ovver (h)"
                InputLabelProps={{
                  shrink: true,
                }}
                className={classes.accountInput}
                value={formValues.carryOver}
                onChange={handleChange('carryOver')}
                error={error.carryOver}
                helperText={error.carryOver}
              />
            </Grid>
            <Grid item xs={6} md={3}>
              <TextField
                type="number"
                required
                label="Carry over remain (h)"
                InputLabelProps={{
                  shrink: true,
                }}
                className={classes.accountInput}
                value={formValues.carryOverRemain}
                onChange={handleChange('carryOverRemain')}
                error={error.carryOverRemain}
                helperText={error.carryOverRemain}
              />
            </Grid>
          </Grid>
          <Grid
            container
            spacing={1}
            justify="center"
            style={{ marginTop: 20 }}
          >
            <Grid item md={2} xs={3}>
              <Button
                style={{ width: '80%' }}
                variant="contained"
                onClick={handleCloseModal}
                color="secondary"
              >
                Close
              </Button>
            </Grid>
            <Grid item md={2} xs={3}>
              <Button
                variant="contained"
                style={{ width: '80%' }}
                color="primary"
                onClick={handleOnsubmit}
              >
                Submit
              </Button>
            </Grid>
          </Grid>
        </MuiPickersUtilsProvider>
      </div>
    </Modal>
  );
};

UpdateUserLeaveModal.propTypes = {
  openModal: bool,
  setOpenModal: func,
  // eslint-disable-next-line react/forbid-prop-types
  objEdit: object,
  refreshList: func,
};

UpdateUserLeaveModal.defaultProps = {
  openModal: false,
  objEdit: {},
  setOpenModal: () => {},
  refreshList: () => {}
};

export default UpdateUserLeaveModal;
