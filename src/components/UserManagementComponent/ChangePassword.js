/* eslint-disable array-callback-return */
/* eslint-disable react/forbid-prop-types */
import React, { useState } from 'react';
import {
  Modal, Grid, TextField, Button
} from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { useDispatch } from 'react-redux';
import { object, func } from 'prop-types';
import { requiredValidate, rePasswordValidate, passwordValidate } from '../../helper/validate';
import { showNotification } from '../../state/modules/notification/actions';
import { requestPutUser } from '../../state/modules/user/actions';

import { styles } from './styles';

const useStyles = makeStyles((theme) => ({ ...styles(theme) }));

const originalForm = {
  password: '',
  rePassword: ''
};

const originalError = {
  password: false,
  rePassword: false
};

const validateMapper = {
  password: passwordValidate,
  rePassword: requiredValidate
};

export default function ChangePassword({ openProps, setOpenPropsModal }) {
  const classes = useStyles();
  const dispatch = useDispatch();
  const [formValues, setFormValues] = useState(originalForm);
  const [error, setError] = useState(originalError);
  const handleCloseModal = () => {
    setFormValues(originalForm);
    setError(originalError);
    setOpenPropsModal({});
  };
  const handleChange = (type) => (e) => {
    const valueObj = {
      ...formValues,
      [type]: e.target.value
    };
    let errorObj = {
      ...error,
      [type]: validateMapper[type]
        ? validateMapper[type](e.target.value)
        : false,
    };
    if ((type === 'password' || type === 'rePassword') && valueObj.rePassword) {
      errorObj = {
        ...errorObj,
        rePassword: rePasswordValidate(valueObj.rePassword, valueObj.password)
      };
    }
    setError(errorObj);
    setFormValues(valueObj);
  };

  const validateForm = () => {
    let errorObj = error;
    // eslint-disable-next-line array-callback-return
    Object.keys(errorObj).map((item) => {
      if ((item === 'rePassword') && formValues.rePassword) {
        errorObj = {
          ...errorObj,
          rePassword: rePasswordValidate(formValues.rePassword, formValues.password)
        };
      } else {
        errorObj = {
          ...errorObj,
          [item]: validateMapper[item] ? validateMapper[item](formValues[item]) : false,
        };
      }
    });
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
      id: openProps.id,
      password: formValues.password
    };

    dispatch(requestPutUser({
      payload: { ...dataSend, },
      callback: (res) => {
        if (res && res.error) {
          dispatch(showNotification('failed', res.error.message || res.error, true));
        } else {
          handleCloseModal();
        }
      }
    }));
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
          style={{ width: '25%' }}
        >
          <Grid container spacing={2}>
            <div className={classes.groupTitle} style={{ marginTop: 0 }}>
              Change Password of
              {' '}
              {`${openProps.name} - ${openProps.badgeNumber || '//'}`}
            </div>
          </Grid>
          <Grid
            container
            spacing={2}
          >
            <Grid item xs={12}>
              <TextField
                required
                label="Password"
                type="password"
                inputProps={{
                  autocomplete: 'new-password',
                }}
                className={classes.accountInput}
                value={formValues.password}
                onChange={handleChange('password')}
                InputLabelProps={{
                  shrink: true,
                }}
                error={error.password}
                helperText={error.password}
              />
            </Grid>
          </Grid>
          <Grid
            container
            spacing={2}
          >
            <Grid item xs={12}>
              <TextField
                required
                label="Re-password"
                type="password"
                inputProps={{
                  autocomplete: 'new-password',
                }}
                className={classes.accountInput}
                value={formValues.rePassword}
                onChange={handleChange('rePassword')}
                InputLabelProps={{
                  shrink: true,
                }}
                error={error.rePassword}
                helperText={error.rePassword}
              />
            </Grid>
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
                  onClick={handleCloseModal}
                  color="secondary"

                >
                  Close
                </Button>
              </Grid>
              <Grid item md={3} xs={3}>
                <Button
                  variant="contained"
                  style={{ width: '80%' }}
                  color="primary"
                  onClick={handleSubmitForm}
                >
                  Submit
                </Button>
              </Grid>
            </Grid>
          </Grid>
        </div>

      </Modal>
    </>
  );
}

ChangePassword.propTypes = {
  openProps: object,
  setOpenPropsModal: func
};

ChangePassword.defaultProps = {
  openProps: {},
  setOpenPropsModal: () => { }
};
