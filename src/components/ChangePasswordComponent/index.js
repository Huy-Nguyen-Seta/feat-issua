/* eslint-disable array-callback-return */
/* eslint-disable react/prop-types */
import React, { useState, } from 'react';
import {
  Grid, InputAdornment, IconButton, TextField
} from '@material-ui/core';
import { useDispatch } from 'react-redux';
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
import SaveIcon from '@material-ui/icons/Save';
import EditIcon from '@material-ui/icons/Edit';
import CancelIcon from '@material-ui/icons/Cancel';
import {
  requiredValidate,
  rePasswordValidate,
  passwordValidate
} from '../../helper/validate';
import { requestPutUserPassword } from '../../state/modules/user/actions';
import { showNotification } from '../../state/modules/notification/actions';
import { routePath } from '../../helper/constants';

const originalShowPassword = {
  showPasswordOld: false,
  showPasswordNew: false,
  showPasswordAgain: false,
};

const originalForm = {
  oldPassword: '',
  newPassword: '',
  reNewPassword: ''
};

const originalError = {
  oldPassword: false,
  newPassword: false,
  reNewPassword: false
};

const validateMapper = {
  oldPassword: passwordValidate,
  newPassword: passwordValidate,
  reNewPassword: requiredValidate
};

export default function ChangePasswordComponent({ className, editItem, setEditItem }) {
  const dispatch = useDispatch();

  const [formValue, setFormValue] = useState(originalForm);
  const [showPassword, setShowPassword] = useState(originalShowPassword);
  const [error, setError] = useState(originalError);

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  const handleClickShowPassword = (type) => {
    setShowPassword({
      ...showPassword,
      [type]: !showPassword[type]
    });
  };

  // eslint-disable-next-line no-unused-vars
  const validateForm = (objValue) => {
    let errorObj = { ...error };
    Object.keys(error).map((item) => {
      if (validateMapper[item] && validateMapper[item](objValue[item])) {
        errorObj[item] = validateMapper[item](objValue[item]);
      } else errorObj[item] = false;
    });
    if (objValue.oldPassword && objValue.newPassword
      && objValue.oldPassword === objValue.newPassword) {
      errorObj = {
        ...error,
        newPassword: 'New password must be different from old password'
      };
    }
    if (!errorObj.reNewPassword && objValue.reNewPassword) {
      const rePasswordVal = rePasswordValidate(objValue.reNewPassword, objValue.newPassword);
      if (rePasswordVal) {
        errorObj = {
          ...error,
          reNewPassword: rePasswordVal
        };
      }
    }
    const errorFlag = Object.keys(error).reduce(
      (callbackVal, currentVal) => callbackVal || error[currentVal],
      false
    );
    setError({ ...errorObj });
    return errorFlag;
  };

  const handleChangeValue = (type) => (event) => {
    const dataChange = {
      ...formValue,
      [type]: event.target.value
    };
    let errorObj = {
      ...error,
      [type]: validateMapper[type]
        ? validateMapper[type](event.target.value)
        : false,
    };
    if (dataChange.oldPassword && dataChange.newPassword) {
      errorObj = {
        ...errorObj,
        newPassword: dataChange.oldPassword === dataChange.newPassword
          ? 'New password must be different from old password' : ''
      };
    }
    if (type !== 'oldPassword' && dataChange.reNewPassword && dataChange.newPassword) {
      errorObj = {
        ...errorObj,
        reNewPassword: rePasswordValidate(dataChange.reNewPassword, dataChange.newPassword)
      };
    }
    setError(errorObj);
    setFormValue(dataChange);
  };

  const handleSetEditItem = () => {
    setEditItem('changepass');
  };
  const handleCancelChangePassWord = () => {
    setEditItem('');
    setShowPassword(originalShowPassword);
    setFormValue(originalForm);
    setError(originalError);
  };

  const handleLogout = () => {
    window.location.href = routePath.SIGN_IN_PATH;
  };

  const handleSubmitChangePassword = () => {
    const errorForm = validateForm(formValue);

    if (errorForm) return;

    const dataSubmit = {
      oldPassword: formValue.oldPassword,
      newPassword: formValue.newPassword,
    };

    dispatch(requestPutUserPassword({
      payload: dataSubmit,
      callback: (res) => {
        if (res.success) {
          handleLogout();
        } else {
          dispatch(showNotification('failed', res.error.message || res.error, true));
        }
      }
    }));
  };

  return (
    <>
      <Grid
        container
        classes={className.classGrid}
        direction="row"
        alignItems="center"
      >
        <Grid item xs={6} md={3}>
          <div className={className.changePassWordTitle}>
            CHANGE PASSWORD
          </div>
        </Grid>
        <Grid item xs={6} md={3}>
          {
            editItem === 'changepass'
              ? (
                <>
                  <SaveIcon
                    className={className.infoItemIcon}
                    onClick={handleSubmitChangePassword}
                  />
                  {'   '}
                  <CancelIcon
                    className={className.infoItemIcon}
                    onClick={handleCancelChangePassWord}
                  />
                </>

              )
              : (
                <EditIcon
                  className={className.infoItemIcon}
                  onClick={handleSetEditItem}
                />
              )
          }
        </Grid>
      </Grid>
      {
        editItem === 'changepass' && (
          <Grid container classes={className.classGrid} spacing={2}>
            <Grid item xs={12} md={4} classes={className.classGrid}>
              <TextField
                style={{ width: '90%' }}
                type={showPassword.showPasswordOld ? 'text' : 'password'}
                label="Old password"
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() => handleClickShowPassword('showPasswordOld')}
                        onMouseDown={handleMouseDownPassword}
                      >
                        {showPassword.showPasswordOld ? <Visibility /> : <VisibilityOff />}
                      </IconButton>
                    </InputAdornment>
                  ),
                  autocomplete: 'new-password',

                }}
                value={formValue.oldPassword}
                onChange={handleChangeValue('oldPassword')}
                error={error.oldPassword}
                helperText={error.oldPassword}
              />
            </Grid>
            <Grid item xs={12} md={4} classes={className.classGrid}>
              <TextField
                type={showPassword.showPasswordNew ? 'text' : 'password'}
                label="New Password"
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() => handleClickShowPassword('showPasswordNew')}
                        onMouseDown={handleMouseDownPassword}
                      >
                        {showPassword.showPasswordNew ? <Visibility /> : <VisibilityOff />}
                      </IconButton>
                    </InputAdornment>
                  ),
                  autocomplete: 'new-password',

                }}
                style={{ width: '90%' }}
                value={formValue.newPassword}
                onChange={handleChangeValue('newPassword')}
                error={error.newPassword}
                helperText={error.newPassword}
              />
            </Grid>
            <Grid item xs={12} md={4} classes={className.classGrid}>

              <TextField
                style={{ width: '90%' }}
                InputLabelProps={{ shrink: true }}
                type={showPassword.showPasswordAgain ? 'text' : 'password'}
                label="New Password Again"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() => handleClickShowPassword('showPasswordAgain')}
                        onMouseDown={handleMouseDownPassword}
                      >
                        {showPassword.showPasswordAgain ? <Visibility /> : <VisibilityOff />}
                      </IconButton>
                    </InputAdornment>
                  ),
                  autocomplete: 'new-password',
                }}
                value={formValue.reNewPassword}
                onChange={handleChangeValue('reNewPassword')}
                error={error.reNewPassword}
                helperText={error.reNewPassword}
              />

            </Grid>
          </Grid>

        )

      }
    </>
  );
}
