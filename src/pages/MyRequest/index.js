import React, { useState, useEffect } from 'react';
import moment from 'moment';
import {
  Grid, Tooltip,
  Chip, Popover, Typography, Button
} from '@material-ui/core';
import { useDispatch, useSelector } from 'react-redux';
import MomentUtils from '@date-io/moment';
import {
  MuiPickersUtilsProvider,
  KeyboardDatePicker,
} from '@material-ui/pickers';

import { makeStyles } from '@material-ui/core/styles';
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete';
import { configSelector } from '../../state/modules/config/selector';
import { requestGetTimesheet } from '../../state/modules/timesheet/actions';
import AuthenticatedContainer from '../../containers/AuthenticatedContainer';
import CustomTable from '../../components/CustomTable';
import { LateEarlyModalComponent } from '../../components/LateEarlyModalComponent';
import { ForgetModalComponent } from '../../components/ForgetModalComponent';
import { HeaderWrapperComponent } from '../../components/HeaderWrapperComponent';
import { FilterComponent } from '../../components/FilterComponent';
import { UserInfoComponent } from '../../components/UserInfoComponent';
import TimeRangeComponent, { orginalRange } from '../../components/TimeRangeComponent';
import { statusLeaves } from '../../state/modules/requests/reducer';
import {
  requestGetRequests,
  requestDeleteRequests
} from '../../state/modules/requests/actions';
import { showNotification } from '../../state/modules/notification/actions';

import { styles } from './styles';

const useStyles = makeStyles((theme) => ({
  ...styles(theme)
}));

const originalForm = {
  fromDate: moment().startOf('month'),
  toDate: moment().endOf('month'),
  rangeDate: 'thisMontth'
};

function MyRequest() {
  const classes = useStyles();
  const dispatch = useDispatch();
  const { rowPerPage } = useSelector(configSelector);

  const [formValue, setFormValue] = useState(originalForm);
  const [dataSource, setDataSource] = useState([]);
  const [pagination, setPagination] = useState({});

  const [openModalPropsEarlyLate, setOpenModalPropsEarlyLate] = useState(false);
  const [infoModalPropsEarlyLate, setInfoModalPropsEarlyLate] = useState(null);

  const [openModalPropsForget, setOpenModalPropsForget] = useState(false);
  const [infoModalPropsForget, setInfoModalPropsForget] = useState(null);

  const [anchorEl, setAnchorEl] = useState(null);

  const handleFetchJustification = ({ filter }) => {
    if (filter.fromDate.valueOf() <= filter.toDate.valueOf()) {
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
    } else {
      dispatch(showNotification('failed', 'FromDate must be greater than ToDate', true));
    }
  };

  const handleSetFilterAndFetchData = (data, page) => {
    const filter = {
      fromDate: data.fromDate.format('YYYY-MM-DD'),
      toDate: data.toDate.format('YYYY-MM-DD'),
      limit: rowPerPage,
      page: page || 1,
      requestTypeIds: ['9c796106-d223-4ced-bb0c-7b0467bbc1f8', '187f0f75-3394-4962-92af-6efc131f8e74']
    };
    handleFetchJustification({ filter });
  };

  useEffect(() => {
    handleSetFilterAndFetchData(formValue);
  }, []);

  const handleRefeshJustification = () => {
    handleSetFilterAndFetchData(formValue, pagination.current);
  };

  const handleFormChange = (type) => (event) => {
    let tempValue = {
      ...formValue,
      [type]: type !== 'rangeDate' ? moment(event) : event.target.value
    };
    if (type === 'rangeDate') {
      tempValue = {
        ...tempValue,
        fromDate: orginalRange[event.target.value][0],
        toDate: orginalRange[event.target.value][1]
      };
    }
    handleSetFilterAndFetchData(tempValue);
    setFormValue(tempValue);
  };

  const handleChangeTable = (e, page) => {
    handleSetFilterAndFetchData(formValue, page);
  };

  const handleEditItemJustification = (data) => () => {
    const filter = {
      fromDate: data.requestDate && moment(data.requestDate).startOf('day').toISOString(),
      toDate: data.requestDate && moment(data.requestDate).endOf('day').toISOString(),
      limit: 1,
      page: 1
    };
    dispatch(requestGetTimesheet({
      filter,
      callback: (res) => {
        if (res && res.error) {
          dispatch(showNotification('failed', res.error.message || res.error, true));
        } else if (res.data && res.data[0]) {
          const dataTimesheet = res.data[0];

          if (data.requestTypeName === 'late/early') {
            const dataUpdateLE = {
              date: moment(data.requestDate),
              checkIn: dataTimesheet.checkIn,
              checkOut: dataTimesheet.checkOut,
              early: dataTimesheet.early,
              late: dataTimesheet.late,
              lack: dataTimesheet.lack,
              comp: data.compensationDate,
              comment: data.comment,
              id: data.id,
              status: data.status,
            };
            setInfoModalPropsEarlyLate(dataUpdateLE);
            setOpenModalPropsEarlyLate(true);
          }
          if (data.requestTypeName === 'forget') {
            const dataUpdateF = {
              date: moment(data.requestDate),
              checkIn: dataTimesheet.checkIn,
              checkOut: dataTimesheet.checkOut,
              early: dataTimesheet.early,
              late: dataTimesheet.late,
              lack: dataTimesheet.lack,
              errorCount: data.errorCount,
              comment: data.comment,
              id: data.id,
              status: data.status,
            };
            setInfoModalPropsForget(dataUpdateF);
            setOpenModalPropsForget(true);
          }
        }
      }
    }));
  };

  const handleClosePopOver = () => {
    setAnchorEl(null);
  };

  const handleDeleteItemJustification = () => {
    dispatch(requestDeleteRequests({
      payload: { id: anchorEl.id },
      callback: (res) => {
        if (res && res.success && res.success === true) {
          handleRefeshJustification();
          handleClosePopOver();
          dispatch(showNotification('success', 'Delete successfully!',));
        } else if (res && res.error) {
          dispatch(showNotification('failed', res.error.message || res.error, true));
        }
      }
    }));
  };

  const handleConfirmDeleteItem = (row) => (event) => {
    setAnchorEl({ event: event.currentTarget, id: row.id });
  };

  const columns = [
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
            <div>
              <Tooltip title="Edit">
                <EditIcon
                  style={{ cursor: 'pointer' }}
                  onClick={handleEditItemJustification(row)}
                />

              </Tooltip>
              <Tooltip title="Delete">
                <DeleteIcon
                  style={{ cursor: 'pointer' }}
                  onClick={handleConfirmDeleteItem(row)}
                />
              </Tooltip>

              <Popover
                id={anchorEl ? 'simple-popover' : undefined}
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
                        onClick={handleDeleteItemJustification}
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

  return (
    <AuthenticatedContainer>
      <Grid container>
        <HeaderWrapperComponent
          title="Justification"
        />
      </Grid>
      <UserInfoComponent />
      <Grid container>
        <FilterComponent
          listFilterRender={(
            <>
              <Chip
                label={`From ${formValue.fromDate.format('DD/MM/YYYY')} to ${formValue.toDate.format('DD/MM/YYYY')}`}
                className={classes.filterItem}
              />
            </>
          )}

          formFilter={(
            <>
              <Grid container spacing={2}>
                <span className={classes.filterTitle}>
                  Absoluted Range:
                </span>
              </Grid>
              <Grid container spacing={2}>

                <TimeRangeComponent
                  value={formValue.rangeDate}
                  onChange={handleFormChange('rangeDate')}
                />
              </Grid>
              <Grid container spacing={2}>
                <span className={classes.filterTitle}>
                  Custome Range:
                </span>
              </Grid>
              <Grid container spacing={2}>
                <MuiPickersUtilsProvider utils={MomentUtils}>
                  <Grid item xs={12} md={6}>
                    <KeyboardDatePicker
                      disabled={formValue.rangeDate !== 'customeRange'}
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
                      disabled={formValue.rangeDate !== 'customeRange'}
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

      <LateEarlyModalComponent
        openProps={openModalPropsEarlyLate}
        infoProps={infoModalPropsEarlyLate}
        setOpenModal={setOpenModalPropsEarlyLate}
        refreshListFunc={handleRefeshJustification}
        setInfoModal={setInfoModalPropsEarlyLate}
      />
      <ForgetModalComponent
        openProps={openModalPropsForget}
        infoProps={infoModalPropsForget}
        setOpenModal={setOpenModalPropsForget}
        refreshListFunc={handleRefeshJustification}
        setInfoModal={setInfoModalPropsForget}

      />
    </AuthenticatedContainer>
  );
}

export default MyRequest;
