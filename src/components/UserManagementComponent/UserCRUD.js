/* eslint-disable array-callback-return */
/* eslint-disable react/prop-types */
import React, { useState, useEffect } from 'react';
import {
  Modal, Grid, TextField, InputLabel, Select, MenuItem, Button,
  Checkbox, Typography
} from '@material-ui/core';
import MomentUtils from '@date-io/moment';
import {
  MuiPickersUtilsProvider,
  KeyboardDatePicker,
} from '@material-ui/pickers';
import { useDispatch, useSelector } from 'react-redux';
import { makeStyles } from '@material-ui/core/styles';
import moment from 'moment';
import { bool } from 'prop-types';
import {
  emailValidate, requiredValidate, rePasswordValidate,
  passwordValidate, requiredDateValidate
} from '../../helper/validate';
import { userSelector } from '../../state/modules/user/selector';
import { showNotification } from '../../state/modules/notification/actions';
import { RoleListComponent } from '../RoleListComponent';
import ManagerListComponent from '../ManagerListComponent';
import { requestPostUser, requestPutUser } from '../../state/modules/user/actions';
import { styles } from './styles';

const useStyles = makeStyles((theme) => ({ ...styles(theme) }));

const originalForm = {
  address: '',
  birthDay: null,
  email: '',
  hiredDate: moment(),
  managerId: '',
  name: '',
  phone: '',
  status: 'active',
  title: 'ecf88b1f-1f48-43a6-9807-c01061df7996',
  password: '',
  rePassword: '',
  badgeNumber: '',
  gender: 'male'
};

const originalError = {
  address: false,
  birthDay: false,
  email: false,
  hiredDate: false,
  managerId: false,
  name: false,
  phone: false,
  status: false,
  title: false,
  password: false,
  rePassword: false,
  badgeNumber: false,
  gender: false
};
const dateField = ['hiredDate', 'birthDay'];

export default function UserCRUD({
  openProps, setOpenPropsModal, refreshListUser, editUser
}) {
  const { roles } = useSelector(userSelector);

  const validateMapper = JSON.stringify(editUser) === '{}'
    ? {
      email: emailValidate,
      name: requiredValidate,
      password: passwordValidate,
      hiredDate: requiredDateValidate,
      userName: requiredValidate,
      managerId: requiredValidate,
      title: requiredValidate,
      badgeNumber: requiredValidate,
      phone: requiredValidate,
      gender: requiredValidate,
      rePassword: requiredValidate
    }
    : {
      email: emailValidate,
      name: requiredValidate,
      hiredDate: requiredDateValidate,
      userName: requiredValidate,
      managerId: requiredValidate,
      title: requiredValidate,
      badgeNumber: requiredValidate,
      phone: requiredValidate,
      gender: requiredValidate

    };

  const classes = useStyles();
  const [formValues, setFormValues] = useState(originalForm);
  const [error, setError] = useState(originalError);
  const dispatch = useDispatch();
  const handleChange = (type) => (e) => {
    const valueObj = {
      ...formValues,
      [type]: dateField.includes(type) ? moment(e) : e.target.value
    };
    let errorObj = {
      ...error,
      [type]: validateMapper[type]
        ? validateMapper[type](dateField.includes(type) ? e : e.target.value)
        : false,
    };
    if ((type === 'password' || type === 'rePassword') && valueObj.rePassword && JSON.stringify(editUser) === '{}') {
      errorObj = {
        ...errorObj,
        rePassword: rePasswordValidate(valueObj.rePassword, valueObj.password)
      };
    }
    setError(errorObj);
    setFormValues(valueObj);
  };

  const handleDisabledDate = (date) => date.isAfter(moment());

  useEffect(
    () => {
      try {
        if (JSON.stringify(editUser) !== '{}') {
          setFormValues({
            badgeNumber: editUser && editUser.badgeNumber,
            name: editUser && editUser.name,
            gender: editUser && editUser.gender,
            email: editUser && editUser.email,
            phone: editUser && editUser.phone,
            address: editUser && editUser.address,
            title: editUser && editUser.title
              && roles.find((role) => role.name === editUser.title)
              && roles.find((role) => role.name === editUser.title).id,
            managerId: editUser && editUser.managerId,
            birthDay: editUser && editUser.birthDay && moment(editUser.birthDay),
            hiredDate: editUser && editUser.hiredDate && moment(editUser.hiredDate),
            status: editUser.status,
          });
        } else {
          setFormValues(originalForm);
          setError(originalError);
        }
      } catch (err) {
        console.log(err);
      }
    },
    [editUser, roles]
  );
  const handleCloseModal = () => {
    setFormValues(originalForm);
    setError(originalError);
    setOpenPropsModal(false);
    if (refreshListUser) refreshListUser();
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
    if (!errorObj.rePassword) {
      errorObj = {
        ...errorObj,
        rePassword: rePasswordValidate(formValues.rePassword, formValues.password)
      };
    }

    setError(errorObj);
    const errorFlag = Object.keys(errorObj).reduce(
      (callbackVal, currentVal) => callbackVal || errorObj[currentVal],
      false
    );
    return errorFlag;
  };

  const handleSubmitForm = () => {
    const errors = validateForm();
    if (errors) {
      return;
    }
    const dataSend = {

      name: formValues.name,
      hiredDate: formValues.hiredDate.format('YYYY/MM/DD'),
      status: formValues.status,
      roleId: formValues.title,
      // birthDay: formValues.birthDay.format('YYYY/MM/DD'),
      // phone: formValues.phone,
      // address: formValues.address,
      managerId: formValues.managerId,
      gender: formValues.gender,
    };
    if (formValues.birthDay) dataSend.birthDay = formValues.birthDay.format('YYYY/MM/DD');
    if (formValues.phone) dataSend.phone = formValues.phone;
    if (formValues.address) dataSend.address = formValues.address;

    if (JSON.stringify(editUser) === '{}') {
      dispatch(requestPostUser({
        payload: {
          ...dataSend,
          password: formValues.password, // not in update data
          email: formValues.email, // need to check change in update
          badgeNumber: formValues.badgeNumber, // need to check change in update
        },
        callback: (res) => {
          if (res && res.error) {
            dispatch(showNotification('failed', res.error.message || res.error, true));
          } else {
            handleCloseModal();
            dispatch(showNotification('success', 'Create successfully!',));
          }
        }
      }));
    } else {
      const dataUpdate = {
        ...dataSend
      };
      if (formValues.email && formValues.email !== editUser.email) {
        dataUpdate.email = formValues.email;
      }

      if (formValues.badgeNumber && formValues.badgeNumber !== editUser.badgeNumber) {
        dataUpdate.badgeNumber = formValues.badgeNumber;
      }
      dispatch(requestPutUser({
        payload: { ...dataUpdate, id: editUser && editUser.id, },
        callback: (res) => {
          if (res && res.error) {
            dispatch(showNotification('failed', res.error.message || res.error, true));
          } else {
            handleCloseModal();
            dispatch(showNotification('success', 'Update successfully!',));
          }
        }
      }));
    }
  };

  const handleRemoveUser = () => {
    const dataSend = {
      name: formValues.name,
      hiredDate: formValues.hiredDate.format('YYYY/MM/DD'),
      status: 'inactive',
      roleId: formValues.title,
      // birthDay: formValues.birthDay.format('YYYY/MM/DD'),
      // phone: formValues.phone,
      // address: formValues.address,
      managerId: formValues.managerId,
      gender: formValues.gender,
    };
    if (formValues.birthDay) dataSend.birthDay = formValues.birthDay.format('YYYY/MM/DD');
    if (formValues.phone) dataSend.phone = formValues.phone;
    if (formValues.address) dataSend.address = formValues.address;

    if (JSON.stringify(editUser) === '{}') {
      dispatch(requestPostUser({
        payload: {
          ...dataSend,
          password: formValues.password, // not in update data
          email: formValues.email, // need to check change in update
          badgeNumber: formValues.badgeNumber, // need to check change in update
        },
        callback: (res) => {
          if (res && res.error) {
            dispatch(showNotification('failed', res.error.message || res.error, true));
          } else {
            handleCloseModal();
            dispatch(showNotification('success', 'Create successfully!',));
          }
        }
      }));
    } else {
      const dataUpdate = {
        ...dataSend
      };
      if (formValues.email && formValues.email !== editUser.email) {
        dataUpdate.email = formValues.email;
      }

      if (formValues.badgeNumber && formValues.badgeNumber !== editUser.badgeNumber) {
        dataUpdate.badgeNumber = formValues.badgeNumber;
      }
      dispatch(requestPutUser({
        payload: { ...dataUpdate, id: editUser && editUser.id, },
        callback: (res) => {
          if (res && res.error) {
            dispatch(showNotification('failed', res.error.message || res.error, true));
          } else {
            handleCloseModal();
            dispatch(showNotification('success', 'Update successfully!',));
          }
        }
      }));
    }
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
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <InputLabel shrink id="reason-placeholder-label-gender">
                  Gender
                  {' '}
                  *
                </InputLabel>
                <Select
                  labelId="select-placeholder-label-gender"
                  id="select-placeholder"
                  value={formValues.gender}
                  onChange={handleChange('gender')}
                  error={error.gender}
                  style={{ width: '100%' }}
                >
                  <MenuItem value="male">Male</MenuItem>
                  <MenuItem value="female">Female</MenuItem>

                </Select>
              </Grid>

            </Grid>
            <Grid container spacing={4}>
              <Grid item xs={12} md={4}>
                <TextField
                  required
                  label="Email"
                  InputLabelProps={{
                    shrink: true,
                  }}
                  className={classes.accountInput}
                  value={formValues.email}
                  onChange={handleChange('email')}
                  error={error.email}
                  helperText={error.email}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  disabled={JSON.stringify(editUser) !== '{}'}
                  required={JSON.stringify(editUser) === '{}'}
                  id="outlined-password-input"
                  label="Password"
                  type="password"
                  className={classes.accountInput}
                  value={formValues.password}
                  onChange={handleChange('password')}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  inputProps={{
                    autocomplete: 'new-password',
                  }}
                  error={error.password}
                  helperText={error.password}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  disabled={JSON.stringify(editUser) !== '{}'}
                  required={JSON.stringify(editUser) === '{}'}
                  id="outlined-password-input"
                  label="Re-password"
                  type="password"
                  className={classes.accountInput}
                  value={formValues.rePassword}
                  onChange={handleChange('rePassword')}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  inputProps={{
                    autocomplete: 'new-password',
                  }}
                  error={error.rePassword}
                  helperText={error.rePassword}
                />
              </Grid>

            </Grid>
            <Grid container spacing={4}>
              <Grid item xs={12} md={4}>
                <TextField
                  required
                  label="Phone"
                  InputLabelProps={{
                    shrink: true,
                  }}
                  className={classes.accountInput}
                  value={formValues.phone}
                  onChange={handleChange('phone')}
                  error={error.phone}
                  helperText={error.phone}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <KeyboardDatePicker
                  disableToolbar
                  variant="inline"
                  format="DD/MM/YYYY"
                  id="date-picker-inline"
                  label="Birthday"
                  KeyboardButtonProps={{
                    'aria-label': 'change date',
                  }}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  shouldDisableDate={handleDisabledDate}

                  style={{ width: '100%' }}
                  value={formValues.birthDay}
                  onChange={handleChange('birthDay')}
                  error={error.birthDay}
                  helperText={error.birthDay}
                />

              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  label="Address"
                  InputLabelProps={{
                    shrink: true,
                  }}
                  className={classes.accountInput}
                  value={formValues.address}
                  onChange={handleChange('address')}
                  error={error.address}
                  helperText={error.address}
                />
              </Grid>
            </Grid>
            <Grid container spacing={4}>
              <div className={classes.groupTitle}>Working Info</div>
            </Grid>
            <Grid container spacing={4}>
              <Grid item xs={12} md={4}>

                <RoleListComponent
                  value={formValues.title}
                  onChange={handleChange('title')}
                  displayEmpty
                  className={classes.accountInput}
                  error={error.title}
                  helperText={error.title}
                  required
                  inputLabel="Grant *"
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <ManagerListComponent
                  value={formValues.managerId}
                  onChange={handleChange('managerId')}
                  displayEmpty
                  style={{ width: '100%' }}
                  error={error.managerId}
                  helperText={error.managerId}
                  required
                  inputLabel="Manager *"
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <KeyboardDatePicker
                  required
                  disableToolbar
                  variant="inline"
                  format="DD/MM/YYYY"
                  id="date-picker-inline"
                  label="Hired Date"
                  KeyboardButtonProps={{
                    'aria-label': 'change date',
                  }}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  style={{ width: '100%' }}
                  value={formValues.hiredDate}
                  onChange={handleChange('hiredDate')}
                  error={error.hiredDate}
                  helperText={error.hiredDate}
                />

              </Grid>
            </Grid>
            <Grid container spacing={4} alignItems="flex-end">
              <Grid item xs={12} md={4}>
                <Checkbox
                  disabled
                  inputProps={{ 'aria-label': 'primary checkbox' }}
                  checked={formValues.biometricUrl}
                  onChange={handleChange('biometricUrl')}
                  error={error.biometricUrl}
                  helperText={error.biometricUrl}
                />
                Biometric Login
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
                  onClick={handleRemoveUser}
                  color="secondary"
                >
                  Remove
                </Button>
              </Grid>
              <Grid item md={2} xs={3}>
                <Button
                  variant="contained"
                  style={{ width: '80%' }}
                  color="primary"
                  onClick={handleSubmitForm}
                >
                  Submit
                </Button>
              </Grid>
              <Grid item md={2} xs={3}>
                <Button
                  variant="contained"
                  style={{ width: '80%' }}
                  color="danger"
                  onClick={handleCloseModal}
                >
                  Close
                </Button>
              </Grid>
            </Grid>
            {true && <Typography className={classes.typography} variant="body1" color="secondary">* After remove user, you can not get user back</Typography>}
          </MuiPickersUtilsProvider>
        </div>
      </Modal>
    </>
  );
}

UserCRUD.propTypes = {
  // eslint-disable-next-line react/require-default-props
  openProps: bool
};
