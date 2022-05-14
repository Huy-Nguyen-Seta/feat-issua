/* eslint-disable react/forbid-prop-types */
/* eslint-disable react/require-default-props */
import React, { useState } from 'react';
import {
  Modal, Grid, Button, TextField
} from '@material-ui/core';
import { useDispatch } from 'react-redux';
import { makeStyles } from '@material-ui/core/styles';
import { func, object } from 'prop-types';
import RequestForgetInfo from '../ConfirmRequestComponent/RequestForgetInfo';
import RequestCompensationInfo from '../ConfirmRequestComponent/RequestCompensationInfo';
import { getManagerRequestCount } from '../../state/modules/user/actions';
import { statusLeaves } from '../../state/modules/requests/reducer';

import { styles } from './styles';

const useStyles = makeStyles({
  ...styles
});

export default function ConfirmReviewJustification({
  setOpenProps, openProps, handleSendRequest
}) {
  const dispatch = useDispatch();
  const classes = useStyles();

  const handleCloseModal = () => {
    setOpenProps({});
  };

  const [comment, setComment] = useState(null);

  const handleChangeComment = (e) => {
    setComment(e.target.value);
  };

  const handleSubmitRequest = (type) => () => {
    handleSendRequest({
      ...openProps,
      status: type,
      adminComment: comment
    });
    dispatch(getManagerRequestCount());
    handleCloseModal();
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
        <div className={classes.bodyModalStyles}>
          {
            openProps.requestTypeName !== 'leave'
            && (
              <>
                <Grid container spacing={8}>
                  <div className={classes.groupTitle}>
                    Request Infomation
                  </div>
                </Grid>
                <Grid container spacing={8}>
                  <Grid item xs={12}>
                    {
                      openProps.requestTypeName === 'forget' && (
                        <RequestForgetInfo
                          openProps={openProps}
                        />
                      )
                    }
                    {
                      openProps.requestTypeName === 'late/early' && (
                        <RequestCompensationInfo
                          openProps={openProps}
                        />
                      )
                    }

                  </Grid>
                </Grid>
                <Grid container spacing={8}>
                  <div className={classes.groupTitle}>
                    Review Request
                  </div>
                </Grid>
                <Grid container spacing={8}>
                  <Grid item xs={12}>
                    <TextField
                      id="outlined-required"
                      label="Comment"
                      value={comment}
                      onChange={handleChangeComment}
                      variant="outlined"
                      style={{ width: '100%' }}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                </Grid>
              </>
            )
          }

          <Grid
            container
            direction="row"
            justify="center"
            alignItems="center"
            spacing={8}
          >
            <Button
              variant="contained"
              style={{ margin: '20px 10px' }}
              color="secondary"
              onClick={handleCloseModal}
            >
              Close
            </Button>

            <Button
              variant="contained"
              style={{ margin: '20px 10px' }}
              color="primary"
              onClick={handleSubmitRequest(statusLeaves.APPROVED)}
            >
              Approve
            </Button>

            <Button
              variant="contained"
              style={{ margin: '20px 10px' }}
              onClick={handleSubmitRequest(statusLeaves.REJECTED)}
            >
              Reject
            </Button>
          </Grid>
        </div>
      </Modal>
    </>
  );
}

ConfirmReviewJustification.propTypes = {
  openProps: object,
  handleSendRequest: func,
  setOpenProps: func
};
