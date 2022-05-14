import React,
{
  useState,
  useEffect
} from 'react';
import moment from 'moment';
import {
  useSelector,
  useDispatch
} from 'react-redux';
import { makeStyles } from '@material-ui/core/styles';
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete';
import {
  Grid,
  Chip,
  Button,
  Typography,
  Popover,
  Tooltip
} from '@material-ui/core';
import MomentUtils from '@date-io/moment';
import {
  MuiPickersUtilsProvider,
  KeyboardDatePicker,
} from '@material-ui/pickers';

import AuthenticatedContainer from '../../containers/AuthenticatedContainer';
import { HeaderWrapperComponent } from '../../components/HeaderWrapperComponent';
import {
  DayLeavesCRUD,
  // getOffTimeHour
} from '../../components/DayLeavesComponents/DayLeavesCRUD';
import { getBackToWorkDate } from '../../helper/helper';
import { LeaveReasonSelect } from '../../components/LeaveReasonComponent';
import { UserInfoComponent } from '../../components/UserInfoComponent';
import CustomTable from '../../components/CustomTable';
import { FilterComponent } from '../../components/FilterComponent';
import RequestStatusComponent from '../../components/RequestStatusComponent';

import { configSelector } from '../../state/modules/config/selector';
import { statusLeaves } from '../../state/modules/requests/reducer';
import { requestGetRequests, requestDeleteRequests } from '../../state/modules/requests/actions';
import { showNotification } from '../../state/modules/notification/actions';

import { styles } from './styles';

const useStyles = makeStyles((theme) => ({
  ...styles(theme)
}));

const originalForm = {
  fromDate: moment().startOf('year'),
  toDate: moment().endOf('year'),
  reason: '',
  status: ''
};

function DayLeaves() {
  const dispatch = useDispatch();
  const classes = useStyles();
  const { rowPerPage } = useSelector(configSelector);

  const [formValue, setFormValue] = useState(originalForm);
  const [openModalProps, setOpenModalProps] = useState(false);
  const [editModalProps, setEditModalProps] = useState({});

  const [dataSource, setDataSource] = useState([]);
  const [pagination, setPagination] = useState({});

  const [anchorEl, setAnchorEl] = useState(null);

  const handleFetchDayleaves = ({ filter }) => {
    dispatch(requestGetRequests({
      filter,
      callback: (res) => {
        if (res && res.error) {
          dispatch(showNotification('failed', res.error.message || res.error, true));
        } else {
          setDataSource(res.data);
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
  };

  const setFilterDayLeaves = (data, page) => {
    const payload = {};
    if (data.fromDate) payload.fromDate = data.fromDate.format('YYYY-MM-DD');
    if (data.toDate) payload.toDate = data.toDate.format('YYYY-MM-DD');
    if (data.reason && data.reason.value) payload.reasonId = data.reason.value;
    if (data.status) payload.status = data.status;
    payload.limit = rowPerPage;
    payload.page = page || 1;
    if (data.fromDate.valueOf() <= data.toDate.valueOf()) {
      handleFetchDayleaves({
        filter: {
          requestTypeIds: ['6c2cc1c7-9555-49b6-89a7-debd4c10d46f'],
          ...payload
        }
      });
    } else {
      dispatch(showNotification('failed', 'FromDate must be greater than ToDate', true));
    }
  };

  useEffect(() => {
    setFilterDayLeaves(formValue);
  }, []);

  const handleFormChange = (type) => (event) => {
    const dataChange = {
      ...formValue,
      [type]: type.toLowerCase().includes('date') ? moment(event) : event.target.value
    };
    setFormValue(dataChange);
    if (dataChange.fromDate.isValid() && dataChange.fromDate.isValid()) {
      setFilterDayLeaves(dataChange);
    }
  };

  const handleFormChangeValue = (type) => (event) => {
    setFormValue({
      ...formValue,
      [type]: event
    });
    setFilterDayLeaves({
      ...formValue,
      [type]: event
    });
  };

  const handleOpenModalProps = () => {
    setOpenModalProps(true);
  };

  const handleAddLeaveRequest = () => {
    setEditModalProps({});
    handleOpenModalProps();
  };

  const handleEditLeaveItem = (record) => () => {
    setEditModalProps(record);
    handleOpenModalProps();
  };

  const handleChangeTable = (e, page) => {
    setFilterDayLeaves(formValue, page);
  };

  const refreshListDayLeave = () => {
    setFilterDayLeaves(formValue, pagination.current);
  };

  const handleConfirmDeleteItem = (row) => (event) => {
    setAnchorEl({ event: event.currentTarget, id: row.id });
  };

  const handleClosePopOver = () => {
    setAnchorEl(null);
  };

  const handleDeleteItemLeave = () => {
    dispatch(requestDeleteRequests({
      payload: { id: anchorEl.id },
      callback: (res) => {
        if (res && res.success && res.success === true) {
          handleClosePopOver();
          refreshListDayLeave();
          dispatch(showNotification('success', 'Delete successfully!',));
        } else if (res && res.error) {
          dispatch(showNotification('failed', res.error.message || res.error, true));
        }
      }
    }));
  };

  const columns = [
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
      field: '#1',
      label: 'Back-to-work Date',
      render: (record, index, row) => <>{row && row.endDateTime && getBackToWorkDate(row.endDateTime).format('DD/MM/YYYY')}</>
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
            <div>
              <Tooltip title="Edit">
                <EditIcon style={{ cursor: 'pointer' }} onClick={handleEditLeaveItem(row)} />
              </Tooltip>
              <Tooltip title="Delete">
                <DeleteIcon
                  style={{ cursor: 'pointer' }}
                  onClick={handleConfirmDeleteItem(row)}
                />
              </Tooltip>

              <Popover
                open={anchorEl && anchorEl.event && Boolean(anchorEl.event)}
                anchorEl={anchorEl && anchorEl.event}
                onClose={handleClosePopOver}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'center',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'center',
                }}
              >
                <Typography className={classes.typography}>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <span>
                        Do you want to delete this request ?
                      </span>

                    </Grid>
                  </Grid>
                  <Grid
                    container
                    spacing={2}
                    direction="row"
                    justify="flex-end"
                    alignItems="center"
                  >
                    <Grid item xs={3}>
                      <Button
                        size="small"
                        variant="contained"
                        onClick={handleClosePopOver}

                      >
                        No
                      </Button>
                    </Grid>
                    <Grid item xs={4}>
                      <Button
                        size="small"
                        variant="contained"
                        color="primary"
                        onClick={handleDeleteItemLeave}
                      >
                        Yes
                      </Button>
                    </Grid>
                  </Grid>

                </Typography>

              </Popover>
            </div>
          )}

        </>
      )
    },
  ];

  const handleDeteItemFilter = (type) => {
    const dataChange = { ...formValue, [type]: '' };
    setFilterDayLeaves(dataChange);
    setFormValue(dataChange);
  };
  return (
    <AuthenticatedContainer>
      <Grid container>
        <HeaderWrapperComponent
          title="My Leave"
          action={(
            <Button
              variant="contained"
              color="primary"
              onClick={handleAddLeaveRequest}
              style={{ float: 'right' }}
            >
              New Leave Request
            </Button>
          )}
        />
      </Grid>
      <UserInfoComponent />

      {/* <LeaveInfo /> */}
      <Grid container>
        <FilterComponent
          listFilterRender={(
            <>
              {
                formValue.fromDate && formValue.toDate && (
                  <Chip
                    label={`From ${formValue.fromDate.format('DD/MM/YYYY')} to ${formValue.toDate.format('DD/MM/YYYY')}`}
                    className={classes.filterItem}
                  />
                )
              }
              {
                formValue.status && (
                  <Chip
                    key="status-chip"
                    label={formValue.status}
                    onDelete={() => handleDeteItemFilter('status')}
                    className={classes.filterItem}
                  />
                )
              }
              {
                formValue.reason && (
                  <Chip
                    key="reason-chip"
                    label={formValue.reason.label}
                    onDelete={() => handleDeteItemFilter('reason')}
                    className={classes.filterItem}
                  />
                )
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
                  <Grid item xs={12} md={6}>
                    <LeaveReasonSelect
                      value={formValue.reason}
                      onChange={handleFormChangeValue('reason')}
                      labelInValue
                      label="name"
                      inputLabel="Reason"

                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
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
        dataSource={dataSource}
        columns={columns}
        classnameHeaderCell={classes.headerTable}
        classnameBodyCell={classes.bodyTable}
        pagination={pagination}
        onChange={handleChangeTable}

      />

      <DayLeavesCRUD
        openProps={openModalProps}
        refreshListFunc={refreshListDayLeave}
        setOpenPropsModal={setOpenModalProps}
        editModal={editModalProps}
        setEditModal={setEditModalProps}
      />
    </AuthenticatedContainer>
  );
}
export default DayLeaves;
