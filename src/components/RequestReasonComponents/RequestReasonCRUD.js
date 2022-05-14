/* eslint-disable react/forbid-prop-types */
/* eslint-disable array-callback-return */
import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {
  Modal, Grid, TextField,
  Button,
} from '@material-ui/core';
import { useDispatch, } from 'react-redux';

import { bool, func, object } from 'prop-types';

import { requestPostRequestReason, requestPutRequestReason } from '../../state/modules/reason/actions';
import RequestTypeComponent from '../RequestTypeComponent';
import { showNotification } from '../../state/modules/notification/actions';
import { requiredValidate, } from '../../helper/validate';
import { styles } from './styles';

const useStyles = makeStyles((theme) => ({
  ...styles(theme)
}));

const originForm = {
  description: '',
  name: '',
  requestTypeId: null,
  maxRequestDay: null,
};

const originError = {
  description: false,
  name: false,
  requestTypeId: false,
  maxRequestDay: false
};

const validateMapper = {
  name: requiredValidate,
  requestTypeId: requiredValidate,
  maxRequestDay: requiredValidate
};

export default function RequestReasonCRUD({
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
        description: infoProps && infoProps.description,
        name: infoProps && infoProps.name,
        requestTypeId: infoProps && infoProps.requestTypeId,
        maxRequestDay: infoProps && infoProps.maxRequestDay,

      };

      setFormModalValue(dataFormUpdate);
    } else {
      setFormModalValue(originForm);
      setErrorForm(originError);
    }
  }, [openProps]);

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
    const errorObj = { ...errorForm };
    // validate required
    Object.keys(errorForm).map((item) => {
      // validate when this field is not error
      if (validateMapper[item] && validateMapper[item](objValue[item])) {
        errorObj[item] = validateMapper[item](objValue[item]);
      }
    });
    const errorFlag = Object.keys(errorObj).reduce(
      (callbackVal, currentVal) => callbackVal || errorObj[currentVal],
      false
    );
    setErrorForm({ ...errorObj });
    return errorFlag;
  };

  const handleSubmitForm = () => {
    const error = validateForm(formModalValue);

    if (error) {
      return;
    }
    const dataUpdate = {
      name: formModalValue.name,
      requestTypeId: formModalValue.requestTypeId,
      maxRequestDay: formModalValue.maxRequestDay,
    };
    if (formModalValue.description) dataUpdate.description = formModalValue.description;
    if (infoProps && infoProps.id) {
      dispatch(requestPutRequestReason({
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
      dispatch(requestPostRequestReason({
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
      setFormModalValue(infoProps);
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
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <TextField
                required
                label="Name"
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
              <RequestTypeComponent
                value={formModalValue.requestTypeId}
                onChange={handleFormChangeTextField('requestTypeId')}
                displayEmpty
                style={{ width: '100%' }}
                error={errorForm.requestTypeId}
                helperText={errorForm.requestTypeId}
                required
                inputLabel="Request"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                required
                label="Max Request Days"
                InputLabelProps={{
                  shrink: true,
                }}
                type="number"
                InputProps={{
                  classes: {
                    root: classes.inputRoot,
                    disabled: classes.disabled
                  },
                }}
                style={{ width: '100%' }}
                value={formModalValue.maxRequestDay}
                onChange={handleFormChangeTextField('maxRequestDay')}
                error={errorForm.maxRequestDay}
                helperText={errorForm.maxRequestDay}
              />
            </Grid>
          </Grid>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label="Description"
                multiline
                rows={2}
                value={formModalValue.description}
                onChange={handleFormChangeTextField('description')}
                style={{ width: '100%' }}
                InputLabelProps={{
                  shrink: true,
                }}
                error={errorForm.description}
                helperText={errorForm.description}
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
        </div>
      </Modal>
    </>
  );
}

RequestReasonCRUD.propTypes = {
  openProps: bool,
  setOpenModal: func,
  infoProps: object,
  refreshListFunc: func,
};

RequestReasonCRUD.defaultProps = {
  openProps: false,
  infoProps: {},
  setOpenModal: () => { },
  refreshListFunc: () => { },
};
