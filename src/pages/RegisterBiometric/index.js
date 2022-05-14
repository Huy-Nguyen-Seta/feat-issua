import React, { useState } from 'react';
import { Grid } from '@material-ui/core';
import { useDispatch } from 'react-redux';
import { makeStyles } from '@material-ui/core/styles';
import AuthenticatedContainer from '../../containers/AuthenticatedContainer';
import { Camera } from '../../components/Camera';
import { requestRegisterByBiometric } from '../../state/modules/auth/actions';
import { showNotification } from '../../state/modules/notification/actions';

import timesheetLogo from '../../asset/images/seta.jpg';
import styles from './styles';

const useStyles = makeStyles(() => ({
  ...styles,
}));

const picCount = 5;

export default function RegisterBiometric() {
  const classes = useStyles();
  const dispatch = useDispatch();
  const construction = [
    'Please keep your face in center of the camera',
    'Please look at the left corner of your screen',
    'Please look at the right corner of your screen',
    'Please take you head about 5° up',
    'Please take you head about 5° down',
    'Please wait some minutes ...'
  ];

  const [faces, setFaces] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSubmitImages = () => {
    if (faces.length === picCount) {
      setLoading(true);
      dispatch(requestRegisterByBiometric(
        {
          faces,
          callback: (request) => {
            setLoading(false);
            if (request.success) {
              if (request.valid) {
                dispatch(showNotification('success', 'Register biometric success.'));
              } else {
                dispatch(showNotification('failed', 'Please retake your image.'), true);
                setFaces([]);
              }
            } else {
              dispatch(showNotification('failed', 'Error when register biometric. Please try again.', true));
            }
          }
        }
      ));
    } else {
      dispatch(showNotification('failed', 'You must register 5 images.', true));
    }
  };

  return (
    <AuthenticatedContainer>
      <div className={classes.container}>
        <div className={classes.wrapper}>
          <div className={classes.subTitle}>
            <img src={timesheetLogo} height={80} alt="logo" />
            <p className={classes.continuedTitle}>Register Biometric</p>
            <p>{faces.length < 5 && construction[faces.length]}</p>
            <p>{faces.length >= 5 && loading && construction[faces.length]}</p>
          </div>
          <div className={classes.formContainer}>
            <Camera
              faces={faces}
              setFaces={setFaces}
              loading={loading}
              setLoading={setLoading}
              handleSubmitImages={handleSubmitImages}
            />
          </div>
          <div className={classes.faceListContainer}>
            <Grid
              container
              direction="row"
              justify="center"
              alignItems="center"
              spacing={2}
            >
              {
                faces.map((item) => {
                  const url = URL.createObjectURL(item);
                  return (
                    <Grid item xs={2}>
                      <div
                        className={classes.facePreview}
                        style={{
                          backgroundImage: `url(${url})`
                        }}
                      />
                    </Grid>
                  );
                })
              }
            </Grid>
          </div>

        </div>
      </div>
    </AuthenticatedContainer>
  );
}
