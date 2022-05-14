/* eslint-disable import/extensions */
import React, { useState, useEffect } from 'react';
import moment from 'moment';
import {
  Grid,
  Chip,
  Tooltip,
  TextField
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { useSelector, useDispatch } from 'react-redux';
import { bool } from 'prop-types';
import MomentUtils from '@date-io/moment';
import {
  MuiPickersUtilsProvider,
  KeyboardDatePicker,
} from '@material-ui/pickers';
import CheckCircleOutlineIcon from '@material-ui/icons/CheckCircleOutline';
import { FilterComponent } from '../FilterComponent';
import CustomTable from '../CustomTable';
import CommentModalComponent from './CommentModalComponent';
import RequestStatusComponent from '../RequestStatusComponent';
import { statusLeaves } from '../../state/modules/requests/reducer';
import { showNotification } from '../../state/modules/notification/actions';
import { requestGetRequestsForManager, requestPutRequestsCompensation, requestPutRequestsForget } from '../../state/modules/requests/actions';
import { configSelector } from '../../state/modules/config/selector';
import { userSelector } from '../../state/modules/user/selector';

import { styles } from './styles';

const originalForm = {
  fromDate: moment().startOf('month'),
  toDate: moment().endOf('month')
};

const listChip = ['status', 'badgeNumber'];

const useStyles = makeStyles({
  ...styles
});

export function ConfirmJustificationComponent({ fetchFlag }) {
  const classes = useStyles();
  const dispatch = useDispatch();
  const { rowPerPage } = useSelector(configSelector);
  const { user } = useSelector(userSelector);

  const [formValue, setFormValue] = useState(originalForm);
  const [dataJustification, setDataJustification] = useState([]);
  const [pagination, setPagination] = useState({});

  const [openModal, setOpenModal] = useState({});
  // const [dataConfirm, setDataConfirm] = useState({});

  const handleFetchJutification = (dataValue, page) => {
    if (!dataValue.fromDate || !dataValue.toDate) return;
    const filter = {
      requestTypeIds: [
        '9c796106-d223-4ced-bb0c-7b0467bbc1f8',
        '187f0f75-3394-4962-92af-6efc131f8e74'
      ],
      fromDate: dataValue.fromDate.format('MM/DD/YYYY'),
      toDate: dataValue.toDate.format('MM/DD/YYYY'),
    };
    if (dataValue.status) filter.status = dataValue.status;
    if (dataValue.badgeNumber) filter.badgeNumber = dataValue.badgeNumber;

    if (dataValue.fromDate.valueOf() <= dataValue.toDate.valueOf()) {
      dispatch(requestGetRequestsForManager({
        filter: {
          ...filter,
          limit: rowPerPage,
          page: page || 1
        },
        callback: (res) => {
          if (res && res.error) {
            dispatch(showNotification('failed', res.error.message || res.error, true));
          } else {
            setDataJustification(res.data);
            if (res.pagination) {
              setPagination({
                current: res.pagination.page,
                total: res.pagination.count,
                count: Math.ceil(res.pagination.count / rowPerPage)
              });
            }
          }
        }
      }));
    }
  };

  useEffect(() => {
    if (fetchFlag) {
      handleFetchJutification(originalForm);
    }
  }, [fetchFlag]);

  const handleChangeTable = (e, page) => {
    handleFetchJutification(formValue, page);
  };

  const handleKeyDownFilter = (event) => {
    if (event.keyCode === 13) {
      handleFetchJutification(formValue, 1);
    }
  };

  const handleDeteItemFilter = (type) => () => {
    const dataChange = {
      ...formValue,
      [type]: ''
    };
    handleFetchJutification(dataChange);
    setFormValue(dataChange);
  };

  const handleFormChange = (type) => (event) => {
    const dataChange = {
      ...formValue,
      [type]: type.toLowerCase().includes('date') ? moment(event) : event.target.value
    };
    handleFetchJutification(dataChange);
    setFormValue(dataChange);
  };

  const handleOpenModalComent = (data,) => () => {
    // setDataConfirm({
    //   ...data,
    //   status: type,
    //   approveBy: user.id
    // });
    setOpenModal(data);
  };

  const handleConfirmRequest = (data) => {
    if (data.requestTypeId === '187f0f75-3394-4962-92af-6efc131f8e74') {
      dispatch(requestPutRequestsCompensation({
        id: data.id,
        payload: {
          status: data.status,
          approveBy: user.id,
          managerComment: data.managerComment,
        },
        callback: () => {
          handleFetchJutification(formValue, pagination.current);
        }
      }));
    } else {
      dispatch(requestPutRequestsForget({
        id: data.id,
        payload: {
          status: data.status,
          approveBy: user.id,
          managerComment: data.managerComment,
        },
        callback: () => {
          handleFetchJutification(formValue, pagination.current);
        }
      }));
    }
  };

  const columns = [
    {
      field: 'badgeNumber',
      label: 'ID',
    },
    {
      field: 'name',
      label: 'Member',
    },
    {
      field: 'requestDate',
      label: 'Request Date',
      render: (record) => <>{record && moment(record).format('DD/MM/YYYY')}</>
    },
    {
      field: 'requestTypeName',
      label: 'Type',
    },
    {
      field: 'compensationDate',
      label: 'Comp Date',
      render: (record) => <>{record && moment(record).format('DD/MM/YYYY')}</>

    },

    {
      field: 'errorCount',
      label: 'Error',
      render: (text) => (text ? '1' : '0')

    },
    {
      field: 'comment',
      label: 'Note'
    },
    {
      field: 'approveName',
      label: 'Confirm By'
    },
    {
      field: 'managerComment',
      label: 'Manager Comment'
    },
    {
      field: 'confirmByName',
      label: 'Review By'
    },
    {
      field: 'adminComment',
      label: 'Admin Comment'
    },
    {
      field: 'status',
      label: 'Status',
      render: (record) => {
        switch (record) {
          case statusLeaves.QUEUE:
            return (
              <Chip style={{ backgroundColor: '#1976D2', color: '#fff', textTransform: 'uppercase' }} label={record} />
            );
          case statusLeaves.APPROVED:
            return (
              <Chip label={record} style={{ textTransform: 'uppercase' }} color="primary" />
            );
          case statusLeaves.REJECTED:
            return (
              <Chip label={record} style={{ textTransform: 'uppercase' }} />
            );
          case statusLeaves.CONFIRMED:
            return (
              <Chip label={record} style={{ textTransform: 'uppercase' }} color="primary" />
            );
          default:
            return null;
        }
      }

    },
    {
      field: '#',
      label: 'Action',
      render: (record, index, row) => (
        <>
          {row.status === statusLeaves.QUEUE && (

            <Tooltip title="Review">
              <CheckCircleOutlineIcon
                style={{ cursor: 'pointer' }}
                onClick={handleOpenModalComent(row, statusLeaves.APPROVED)}
              />
            </Tooltip>

          )}

        </>
      )
    },
  ];
  return (
    <>
      <Grid container>
        <FilterComponent
          listFilterRender={(
            <>
              <Chip
                label={`From ${formValue.fromDate.format('DD/MM/YYYY')} to ${formValue.toDate.format('DD/MM/YYYY')}`}
                className={classes.filterItem}
              />
              {
                listChip.map((item) => formValue[item] && (
                  <Chip
                    label={formValue[item].label || formValue[item]}
                    className={classes.filterItem}
                    onDelete={handleDeteItemFilter(item)}
                  />
                ))
              }
            </>
          )}

          formFilter={(
            <>
              <Grid container spacing={2}>
                <MuiPickersUtilsProvider utils={MomentUtils}>
                  <Grid item xs={12} md={6}>
                    <KeyboardDatePicker
                      disableToolbar
                      variant="inline"
                      format="DD/MM/YYYY"
                      id="date-picker-inline"
                      label="From Date"
                      KeyboardButtonProps={{
                        'aria-label': 'change date',
                      }}
                      style={{ width: '100%' }}
                      value={formValue.fromDate}
                      onChange={handleFormChange('fromDate')}
                    />

                  </Grid>
                  <Grid item xs={12} md={6}>
                    <KeyboardDatePicker
                      disableToolbar
                      variant="inline"
                      format="DD/MM/YYYY"
                      id="date-picker-inline"
                      label="To Date"
                      KeyboardButtonProps={{
                        'aria-label': 'change date',
                      }}
                      style={{ width: '100%' }}
                      value={formValue.toDate}
                      onChange={handleFormChange('toDate')}
                    />

                  </Grid>

                  <Grid item xs={12} md={4}>
                    <TextField
                      id="date-picker-inline"
                      label="ID"
                      style={{ width: '100%' }}
                      value={formValue.badgeNumber}
                      InputLabelProps={{
                        shrink: true,
                      }}
                      onKeyDown={handleKeyDownFilter}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <RequestStatusComponent
                      value={formValue.status}
                      onChange={handleFormChange('status')}
                    />
                  </Grid>
                </MuiPickersUtilsProvider>
              </Grid>
            </>
          )}
        />

      </Grid>
      <CustomTable
        dataSource={dataJustification}
        columns={columns}
        classnameHeaderCell={classes.headerTable}
        classnameBodyCell={classes.bodyTable}
        pagination={pagination}
        onChange={handleChangeTable}
      />

      <CommentModalComponent
        openProps={openModal}
        setOpenProps={setOpenModal}
        // dataConfirm={dataConfirm}
        handleSendRequest={handleConfirmRequest}
      />
    </>
  );
}

ConfirmJustificationComponent.propTypes = {
  fetchFlag: bool
};

ConfirmJustificationComponent.defaultProps = {
  fetchFlag: false
};
