/* eslint-disable react/forbid-prop-types */
/* eslint-disable react/require-default-props */
import React, { useState, } from 'react';
import {
  Modal, TextField, Grid, Button
} from '@material-ui/core';
import { useDispatch } from 'react-redux';
import { makeStyles } from '@material-ui/core/styles';
import { bool, func } from 'prop-types';
import RequestForgetInfo from './RequestForgetInfo';
import RequestCompensationInfo from './RequestCompensationInfo';
import { getManagerRequestCount } from '../../state/modules/user/actions';
import { statusLeaves } from '../../state/modules/requests/reducer';

import { styles } from './styles';

const useStyles = makeStyles({
  ...styles
});

export default function CommentModalComponent({
  setOpenProps, openProps, handleSendRequest
}) {
  const dispatch = useDispatch();
  const classes = useStyles();

  const [commentValue, setCommentValue] = useState('');
  const [commentError, setCommentError] = useState('');

  const handleCloseModal = () => {
    setCommentValue('');
    setCommentError('');
    setOpenProps({});
  };

  const validateForm = () => {
    if (!commentValue) {
      setCommentError('Comment is required');
      return false;
    }
    return true;
  };

  const handleChangeComment = (e) => {
    setCommentError('');
    setCommentValue(e.target.value);
  };

  const handleSubmitRequest = (type) => () => {
    if (validateForm()) {
      handleSendRequest({
        ...openProps,
        managerComment: commentValue,
        status: type,
      });
      dispatch(getManagerRequestCount());
      handleCloseModal();
    }
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
              </>
            )
          }

          <Grid container spacing={8}>
            <div className={classes.groupTitle}>
              Review Request
            </div>
          </Grid>
          <Grid container spacing={8}>
            <Grid item xs={12}>
              <TextField
                required
                id="outlined-required"
                label="Comment"
                value={commentValue}
                onChange={handleChangeComment}
                variant="outlined"
                style={{ width: '100%' }}
                error={commentError}
                helperText={commentError}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
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
              onClick={handleSubmitRequest(statusLeaves.REJECTED)}
            >
              Reject
            </Button>
            <Button
              variant="contained"
              style={{ margin: '20px 10px' }}
              color="primary"
              onClick={handleSubmitRequest(statusLeaves.CONFIRMED)}
            >
              Confirm
            </Button>

          </Grid>
        </div>
      </Modal>
    </>
  );
}

CommentModalComponent.propTypes = {
  openProps: bool,
  handleSendRequest: func,
  setOpenProps: func
};
