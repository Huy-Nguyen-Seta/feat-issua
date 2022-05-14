import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Button from '@material-ui/core/Button';
import { makeStyles } from '@material-ui/core/styles';
import InputAdornment from '@material-ui/core/InputAdornment';
import IconButton from '@material-ui/core/IconButton';
import TextField from '@material-ui/core/TextField';
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
import { useHistory } from 'react-router-dom';
import { requestSignIn, requestSignInByBiometric } from '../../state/modules/auth/actions';
import { routePath } from '../../helper/constants';
import styles from './styles';
import Mirror from '../../components/VideoMirror';
import {
  startVerifying,
  verifySelector,
  stopVerifying
} from '../../state/modules/faceCapturing';
import { bootedApp } from '../../state/modules/app/actions';
import { showNotification } from '../../state/modules/notification/actions';
import { validateNumber, requiredValidate } from '../../helper/validate';
import timesheetLogo from '../../asset/images/seta.jpg';

const useStyles = makeStyles(() => ({
  ...styles,
}));

const STEP = {
  EMAIL: 1,
  PASSWORD: 2,
  FACEVERIFY: 3
};

const originalError = {
  badgeNumber: '',
  password: '',
  fromApi: '',
};

const validateMapper = {
  badgeNumber: validateNumber,
  password: requiredValidate,
};
export default function SignInPage() {
  const classes = useStyles();
  const dispatch = useDispatch();
  const { stream } = useSelector(verifySelector);

  const history = useHistory();
  const [formValues, setFormValues] = useState({
    badgeNumber: localStorage.getItem('badgeNumber') || '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(originalError);
  const [step, setStep] = useState(STEP.EMAIL);

  const handleChange = (type) => (e) => {
    setError({
      ...error,
      fromApi: '',
      [type]: validateMapper[type](e.target.value),
    });
    setFormValues({ ...formValues, [type]: e.target.value });
    if (type === 'badgeNumber') {
      localStorage.setItem('badgeNumber', e.target.value);
    }
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  const signInCallBack = (res) => {
    if (res && res.data) {
      history.push(routePath.TIMESHEET_PATH);
    } else {
      setError({ ...error, fromApi: res.error });
      dispatch(showNotification('failed', 'Wrong email or password. Please try again.', true));
    }
    dispatch(bootedApp());
    localStorage.clear('badgeNumber');
  };

  const handleSubmit = (nextStep) => {
    if (step === STEP.EMAIL) {
      const badgeNumberValidate = validateNumber(formValues.badgeNumber);
      if (badgeNumberValidate) {
        setError({ ...error, fromApi: '', badgeNumber: badgeNumberValidate });
        return;
      }
    }
    if (nextStep === STEP.FACEVERIFY) {
      dispatch(startVerifying({
        loop: 1,
        callback: ((res) => {
          if (res.error) {
            setStep(STEP.PASSWORD);
          } else {
            dispatch(requestSignInByBiometric({
              badgeNumber: formValues.badgeNumber,
              avatar: res
            }, signInCallBack));
          }
        })
      }));
    }
    if (nextStep === STEP.PASSWORD) {
      dispatch(stopVerifying());
      if (step === STEP.FACEVERIFY) {
        stream && stream.getTracks().forEach((track) => {
          track.stop();
        });
      }
      setError(originalError);
      setShowPassword(false);
      setFormValues({ ...formValues, password: '', });
    }
    setStep(nextStep);
  };

  const handleChangeStepToEmail = () => {
    if (step === STEP.FACEVERIFY) {
      stream && stream.getTracks().forEach((track) => {
        track.stop();
      });
    }
    setError(originalError);
    setShowPassword(false);
    setFormValues({ ...formValues, password: '', });
    setStep(STEP.EMAIL);
  };
  const handleSignInByPassword = () => {
    const passwordValidate = requiredValidate(formValues.password);
    if (passwordValidate) {
      setError({ ...error, password: passwordValidate });
      return;
    }
    dispatch(requestSignIn(formValues, signInCallBack));
  };

  const handlePassworkKeyDown = (e) => {
    if (e && e.keyCode === 13) {
      handleSignInByPassword();
    }
  };

  const handlePassworkKeyDownBadgeNumber = (e) => {
    if (e && e.keyCode === 13) {
      handleSubmit(STEP.FACEVERIFY);
    }
  };

  return (
    <>
      <div className={classes.container}>
        <div className={classes.wrapper}>
          <div className={classes.subTitle}>

            <img src={timesheetLogo} height={80} alt="logo" />
            {step === STEP.EMAIL && <p className={classes.continuedTitle}>Continue to Timesheet</p>}
            {' '}
            {[STEP.PASSWORD, STEP.FACEVERIFY].includes(step) && (
              <p>
                Welcome
                {' '}
                <span
                  onClick={handleChangeStepToEmail}
                  className={classes.emailTitle}
                  aria-hidden="true"
                >
                  {formValues.badgeNumber}
                </span>
                {' !'}
              </p>
            )}
          </div>
          <div className={classes.formContainer}>
            {step === STEP.EMAIL && (
              <TextField
                autoFocus
                id="outlined-input"
                label="Enter your ID"
                onKeyDown={handlePassworkKeyDownBadgeNumber}
                InputLabelProps={{ shrink: true }}
                variant="outlined"
                className={classes.accountInput}
                value={formValues.badgeNumber}
                onChange={handleChange('badgeNumber')}
                error={error.badgeNumber}
                inputProps={{
                  autocomplete: 'no',
                }}
                helperText={error.badgeNumber}

              />
            )}

            {step === STEP.PASSWORD && (
              <>
                <TextField
                  autoFocus
                  label="Enter your password"
                  type={showPassword ? 'text' : 'password'}
                  variant="outlined"
                  className={classes.accountInput}
                  value={formValues.password}
                  onChange={handleChange('password')}
                  helperText={error.password}
                  error={error.password}
                  onKeyDown={handlePassworkKeyDown}
                  InputLabelProps={{ shrink: true }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={handleClickShowPassword}
                          onMouseDown={handleMouseDownPassword}
                        >
                          {showPassword ? <Visibility /> : <VisibilityOff />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                <div className={classes.forgotEmail}>Forgot password ? </div>
              </>

            )}

            {step === STEP.FACEVERIFY && (
              <Mirror
                faceLandmarks={[]}
                videoSrcObject={stream}
                isActivated
              />
            )}
            {error.fromApi && (
              <div className={classes.errorFromApi} style={step === STEP.FACEVERIFY && { textAlign: 'center' }}>{error.fromApi}</div>
            )}
          </div>

          <div className={classes.submitWrapper}>
            {
              step === STEP.FACEVERIFY && (
                <>
                  <Button
                    variant="contained"
                    color="primary"
                    className={classes.submitButton}
                    onClick={() => handleSubmit(STEP.PASSWORD)}
                  >
                    Password Verify
                  </Button>
                </>
              )
            }
            {step === STEP.EMAIL && (
              <Button
                variant="contained"
                color="primary"
                className={classes.submitButton}
                onClick={() => handleSubmit(STEP.FACEVERIFY)}
              >
                Face Verify
              </Button>
            )}
            {step === STEP.PASSWORD && (
              <Button
                variant="contained"
                color="primary"
                className={classes.submitButton}
                onClick={() => handleSignInByPassword()}
              >
                Sign In
              </Button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
