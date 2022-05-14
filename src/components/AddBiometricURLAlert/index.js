/* eslint-disable react/prop-types */
import React from 'react';
import Alert from '@material-ui/lab/Alert';
import { makeStyles } from '@material-ui/core/styles';
import { Button, Collapse } from '@material-ui/core';

import { styles } from './styles';

const useStyles = makeStyles((theme) => ({
  ...styles(theme)
}));

export default function AddBiometricURLAlert({ open, handleActionButton }) {
  const classes = useStyles();
  const handleClickActionBtn = () => {
    handleActionButton(false);
  };

  return (
    <>
      <div className={classes.root}>
        <Collapse in={open}>
          <Alert
            severity="error"
            action={(
              <Button
                color="inherit"
                size="small"
                onClick={handleClickActionBtn}
              >
                register
              </Button>
            )}
          >
            You haven&apos;t register biometric login.
          </Alert>
        </Collapse>
      </div>
    </>
  );
}
