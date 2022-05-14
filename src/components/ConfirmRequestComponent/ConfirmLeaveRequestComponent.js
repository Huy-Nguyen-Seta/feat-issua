import React, { useState, useEffect } from 'react';
import moment from 'moment';
import {
  Grid,
  Chip,
  Tooltip,
  TextField
} from '@material-ui/core';
import {
  useSelector,
  useDispatch
} from 'react-redux';
import { makeStyles } from '@material-ui/core/styles';
import MomentUtils from '@date-io/moment';
import CheckCircleOutlineIcon from '@material-ui/icons/CheckCircleOutline';
import {
  MuiPickersUtilsProvider,
  KeyboardDatePicker,
} from '@material-ui/pickers';
import { bool } from 'prop-types';
import { configSelector } from '../../state/modules/config/selector';
import { userSelector } from '../../state/modules/user/selector';

import { statusLeaves } from '../../state/modules/requests/reducer';
import { requestGetRequestsForManager, requestPutRequestsLeave } from '../../state/modules/requests/actions';
import { showNotification } from '../../state/modules/notification/actions';
import { FilterComponent } from '../FilterComponent';
import CustomTable from '../CustomTable';
import { getBackToWorkDate } from '../../helper/helper';
import CommentModalComponent from './CommentModalComponent';
import { styles } from './styles';
import RequestStatusComponent from '../RequestStatusComponent';

const originalForm = {
  fromDate: moment().startOf('year'),
  toDate: moment().endOf('year')
};

const listChip = ['status', 'badgeNumber'];

const useStyles = makeStyles({
  ...styles
});

export default function ConfirmLeaveRequestComponent({ fetchFlag }) {
  const classes = useStyles();
  const dispatch = useDispatch();
  const { rowPerPage } = useSelector(configSelector);
  const { user } = useSelector(userSelector);

  const [formValue, setFormValue] = useState(originalForm);
  const [dataLeaves, setDataLeaves] = useState([]);
  const [pagination, setPagination] = useState({});
  const [openModal, setOpenModal] = useState({});

  const handleFetchDayleaves = (data, page) => {
    if (!data.fromDate || !data.toDate) return;

    if (data.fromDate.valueOf() <= data.toDate.valueOf()) {
      const filter = {
        requestTypeIds: ['6c2cc1c7-9555-49b6-89a7-debd4c10d46f'],
        fromDate: data.fromDate.format('MM/DD/YYYY'),
        toDate: data.toDate.format('MM/DD/YYYY'),
      };

      if (data.status) filter.status = data.status;
      if (data.badgeNumber) filter.badgeNumber = data.badgeNumber;

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
            setDataLeaves(res.data);
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

  const handleKeyDownFilter = (event) => {
    if (event.keyCode === 13) {
      handleFetchDayleaves(formValue, 1);
    }
  };

  const handleFormChange = (type) => (event) => {
    const dataChange = {
      ...formValue,
      [type]: type.toLowerCase().includes('date') ? moment(event) : event.target.value
    };
    if (dataChange.fromDate && dataChange.toDate && type !== 'badgeNumber') {
      handleFetchDayleaves(dataChange);
    }
    setFormValue(dataChange);
  };

  useEffect(() => {
    if (fetchFlag) {
      handleFetchDayleaves(formValue);
    }
  }, [fetchFlag]);

  const handleConfirmRequest = (data) => {
    dispatch(requestPutRequestsLeave({
      id: data.id,
      payload: {
        status: data.status,
        approveBy: user.id,
        managerComment: data.managerComment,
      },
      callback: () => {
        handleFetchDayleaves(formValue, pagination.current);
      }
    }));
  };

  const handleOpenModalComment = (data) => () => {
    // setDataConfirm({
    //   ...data,
    //   status: type,
    //   approveBy: user.id
    // });
    setOpenModal(data);
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
      field: 'startDateTime',
      label: 'Start Date',
      render: (record) => <>{record && moment(record).format('DD/MM/YYYY - HH:mm')}</>
    },
    {
      field: 'endDateTime',
      label: 'End Date',
      render: (record) => <>{record && moment(record).format('DD/MM/YYYY - HH:mm')}</>
    },
    {
      field: 'offTimeHour',
      label: 'Off-time Hours',
    },
    {
      field: 'reason',
      label: 'Request Type',
    },
    {
      field: 'endDateTime',
      label: 'Back-to-work Date',
      render: (record) => <>{record && getBackToWorkDate(record).format('DD/MM/YYYY')}</>
    },
    {
      field: 'comment',
      label: 'Reason'
    },

    {
      field: 'approveName',
      label: 'Confirm By'
    },
    {
      field: 'managerComment',
      label: 'Comment'
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
      render: (_record, _index, row) => (
        <>
          {row.status === statusLeaves.QUEUE && (
            <Tooltip title="Review">
              <CheckCircleOutlineIcon
                style={{ cursor: 'pointer' }}
                onClick={handleOpenModalComment(row, statusLeaves.APPROVED)}
              />
            </Tooltip>
          )}

        </>
      )
    },
  ];

  const handleChangeTable = (e, page) => {
    handleFetchDayleaves(formValue, page);
  };

  const handleDeteItemFilter = (type) => () => {
    const dataChange = {
      ...formValue,
      [type]: ''
    };
    handleFetchDayleaves(dataChange);
    setFormValue(dataChange);
  };

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
                      onChange={handleFormChange('badgeNumber')}
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
        dataSource={dataLeaves}
        columns={columns}
        classnameHeaderCell={classes.headerTable}
        classnameBodyCell={classes.bodyTable}
        pagination={pagination}
        onChange={handleChangeTable}
      />
      <CommentModalComponent
        openProps={openModal}
        handleSendRequest={handleConfirmRequest}
        setOpenProps={setOpenModal}

      />
    </>
  );
}

ConfirmLeaveRequestComponent.propTypes = {
  fetchFlag: bool
};

ConfirmLeaveRequestComponent.defaultProps = {
  fetchFlag: false
};
