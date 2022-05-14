/* eslint-disable import/named */
/* eslint-disable import/no-cycle */
import React, { useState, useEffect } from 'react';
import moment from 'moment';
import { useDispatch, } from 'react-redux';
import {
  Grid, Chip, Tooltip,
  IconButton
} from '@material-ui/core';

import MomentUtils from '@date-io/moment';
import {
  MuiPickersUtilsProvider,
  KeyboardDatePicker,
} from '@material-ui/pickers';
import AvTimerIcon from '@material-ui/icons/AvTimer';
import SnoozeIcon from '@material-ui/icons/Snooze';
import { makeStyles } from '@material-ui/core/styles';
import AuthenticatedContainer from '../../containers/AuthenticatedContainer';
import { HeaderWrapperComponent } from '../../components/HeaderWrapperComponent';
import { UserInfoComponent } from '../../components/UserInfoComponent';
import CustomTable from '../../components/CustomTable';
import { FilterComponent } from '../../components/FilterComponent';
import TimeRangeComponent, { orginalRange } from '../../components/TimeRangeComponent';
import { requestGetTimesheet } from '../../state/modules/timesheet/actions';
import { showNotification } from '../../state/modules/notification/actions';
import { LateEarlyModalComponent } from '../../components/LateEarlyModalComponent';
import { ForgetModalComponent } from '../../components/ForgetModalComponent';
import { requestGetLeaveInfo, } from '../../state/modules/requests/actions';
import { convertHourTime } from '../../helper/helper';

import { styles } from './styles';

const useStyles = makeStyles((theme) => ({
  ...styles(theme)
}));

const originalForm = {
  fromDate: moment().startOf('month'),
  toDate: moment().endOf('month'),
  rangeDate: 'thisMontth'
};
const rowPerPage = 50;

function Timesheet() {
  const classes = useStyles();
  const [formValue, setFormValue] = useState(originalForm);
  const dispatch = useDispatch();
  const [dataTimesheet, setDataTimesheet] = useState([]);
  // const [pagination, setPagination] = useState({});

  const [openModalPropsEarlyLate, setOpenModalPropsEarlyLate] = useState(false);
  const [infoModalPropsEarlyLate, setInfoModalPropsEarlyLate] = useState(null);

  const [openModalPropsForget, setOpenModalPropsForget] = useState(false);
  const [infoModalPropsForget, setInfoModalPropsForget] = useState(null);
  const handleFetchTimeSheets = ({ filter }) => {
    if (filter.fromDate.valueOf() <= filter.toDate.valueOf()) {
      dispatch(requestGetTimesheet({
        filter,
        callback: (res) => {
          if (res && res.error) {
            dispatch(showNotification('failed', res.error.message || res.error, true));
          } else {
            setDataTimesheet(res.data);
            // if (res.pagination) {
            //   setPagination({
            //     current: res.pagination.page,
            //     total: res.pagination.count,
            //     count: Math.ceil(res.pagination.count / rowPerPage)
            //   });
            // }
          }
        }
      }));
    } else {
      dispatch(showNotification('failed', 'FromDate must be greater than ToDate', true));
    }
  };

  const handleSetFilterAndFetchTimesheets = (data,) => {
    handleFetchTimeSheets({
      filter: {
        fromDate: data.fromDate.format('YYYY-MM-DD'),
        toDate: data.toDate.format('YYYY-MM-DD'),
        limit: rowPerPage,
        // page: page || 1
      },
    });
  };
  useEffect(() => {
    handleSetFilterAndFetchTimesheets(originalForm);
  }, []);

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
    handleSetFilterAndFetchTimesheets(tempValue);

    setFormValue(tempValue);
  };

  const setOpenEarlyLateModal = () => {
    setOpenModalPropsEarlyLate(false);
  };

  const setOpenForgetModal = () => {
    setOpenModalPropsForget(false);
  };

  const handleCreateLateEarlyRequest = (row) => {
    setInfoModalPropsEarlyLate(row);
    setOpenModalPropsEarlyLate(true);
  };

  const handleCreateForgetRequest = (row) => {
    setInfoModalPropsForget(row);
    setOpenModalPropsForget(true);
  };

  const handleCreateRequest = (type, row) => () => {
    let dataProps = {};
    if (row && row.requestId) {
      dispatch(requestGetLeaveInfo({
        payload: {
          id: row && row.requestId,
        },
        callback: (res) => {
          if (res && res.data && res.data.id) {
            if (type === 'forget') {
              dataProps = {
                ...row,
                errorCount: res.data.errorCount,
                comment: res.data.comment,
                id: res.data.id,
                status: res.data.status,
                startDateTime: res.data.startDateTime,
                endDateTime: res.data.endDateTime,
              };
              handleCreateForgetRequest(dataProps);
            } else if (type === 'late/early') {
              dataProps = {
                ...row,
                errorCount: res.data.errorCount,
                comment: res.data.comment,
                id: res.data.id,
                status: res.data.status,
                comp: res.data.compensationDate
              };
              handleCreateLateEarlyRequest(dataProps);
            }
          }
        }
      }));
    } else if (type === 'forget') {
      handleCreateForgetRequest(row);
    } else if (type === 'late/early') {
      handleCreateLateEarlyRequest(row);
    }
  };

  const handleRefeshTimeSheet = () => {
    handleSetFilterAndFetchTimesheets(formValue,);
  };

  // const handleChangeTable = (e, page) => {
  //   handleSetFilterAndFetchTimesheets(formValue, page);
  // };

  const handleGetClassNameCell = (record, index, row) => {
    if (row.checkIn === null && row.checkOut === null && row.date
      && [6, 7].includes(moment(row.date).isoWeekday())) {
      return `${classes.leaveItem} ${classes.paddingCell}`;
    }
    return classes.paddingCell;
  };

  const handleGetClassNameCellAction = (record, index, row) => {
    if (row.checkIn === null && row.checkOut === null && row.date
      && [6, 7].includes(moment(row.date).isoWeekday())) {
      return `${classes.leaveItem} ${classes.paddingCell}`;
    }
    return classes.paddingCellNone;
  };

  const handleGetLackClassNameCell = (record, index, row) => {
    if (row.checkIn === null && row.checkOut === null && row.date
      && [6, 7].includes(moment(row.date).isoWeekday())) {
      return `${classes.leaveItem} ${classes.paddingCell}`;
    }
    if (record && record !== '00:00:00') { return `${classes.lateItem} ${classes.lackItem} ${classes.paddingCell}`; }
  };

  const handleGetCompClassNameCell = (record, index, row) => {
    if (row.checkIn === null && row.checkOut === null && row.date
      && [6, 7].includes(moment(row.date).isoWeekday())) {
      return `${classes.leaveItem} ${classes.paddingCell}`;
    }
    if (record && record !== '00:00:00') { return `${classes.earlyItem} ${classes.paddingCell}`; }
  };

  const handleCheckMakeJutification = (row) => {
    if (row && row.lack && row.lack !== '00:00:00') return true;
    if ((!row.checkIn || !row.checkOut)
      && ![6, 7].includes(moment(row.date).isoWeekday())
    ) {
      return true;
    }
    return false;
  };

  const handleCheckMakeDateForgetRequest = (row) => {
    if (!row.date) return false;
    // if (row.requestTypeName && row.requestTypeName === 'forget') return true;
    let duringCheck = 3;
    if ([1, 2, 3].includes(moment().isoWeekday())) duringCheck += 2;
    const todayDate = moment();
    const checkDate = moment(row.date);
    if (todayDate.diff(checkDate, 'days') <= duringCheck) return true;
    return false;
  };

  const handleDisabledForgetRequest = (row) => {
    if (!handleCheckMakeDateForgetRequest(row)) return true;
    if (!row.requestTypeName) return false;
    return row.requestTypeName
    && (row.requestStatus === 'confirmed' || row.requestStatus === 'approved');
  };

  const handleDisabledCompensationRequest = (row) => {
    if (!(row.checkOut && row.checkIn)) return true;
    if (!row.requestTypeName) return false;
    return row.requestTypeName
    && (row.requestStatus === 'confirmed' || row.requestStatus === 'approved');
  };

  const handleGetClassNameRowAction = (row, type) => {
    if (row.requestTypeName === type) {
      if (row.requestStatus === 'new') return `${classes.actionIcon} ${classes.createdIcon}`;
      return `${classes.actionIcon} ${classes.approvedIcon}`;
    }

    return classes.actionIcon;
  };

  const columns = [
    {
      field: 'date',
      label: 'Date',
      render: (record, _index, row) => {
        const date = row.checkIn || row.checkOut || record;
        return (
          <>
            {`${date && moment.utc(date, 'YYYY-MM-DDTHH:mm:ssZ').local().format('DD/MM/YYYY')} | ${date && moment(date).format('ddd')}`}
          </>
        );
      },
      classNameCell: handleGetClassNameCell
    },
    {
      field: 'checkIn',
      label: 'Checkin',
      render: (record) => record && <>{convertHourTime(record)}</>,

      classNameCell: handleGetClassNameCell
    },
    {
      field: 'checkOut',
      label: 'Checkout',
      // render: (record) => record && moment(record).format('HH:mm'),
      render: (record) => record && <>{convertHourTime(record)}</>,
      classNameCell: handleGetClassNameCell
    },
    {
      field: 'late',
      label: 'Late',
      render: (record) => (record && record !== '00:00:00' && (
        <div
          className={`${classes.lateItem}`}
        >
          {/* {record && moment(record, 'HH:mm:ss').format('HH:mm')} */}
          {convertHourTime(record)}
        </div>
      )),
      classNameCell: handleGetClassNameCell

    },
    {
      field: 'early',
      label: 'Early',
      render: (record) => (record && record !== '00:00:00' && (
        <div
          className={`${classes.lateItem}`}
        >
          {/* {record && moment(record, 'HH:mm:ss').format('HH:mm')} */}
          {convertHourTime(record)}

        </div>
      )),
      classNameCell: handleGetClassNameCell

    },
    {
      field: 'inOffice',
      label: 'In Office',
      render: (record) => record && record !== '00:00:00'
        && (<>{convertHourTime(record)}</>),
      classNameCell: handleGetClassNameCell

    },
    {
      field: 'overTime',
      label: 'Overtime',
      render: (record) => (record && record !== '00:00:00'
        && convertHourTime(record)),
      classNameCell: handleGetClassNameCell

    },
    {
      field: 'workTime',
      label: 'Worktime',
      render: (record) => record && record !== '00:00:00'
        && convertHourTime(record),
      classNameCell: handleGetClassNameCell
    },

    {
      field: 'lack',
      label: 'Lack',
      render: (record) => (record && record !== '00:00:00' && convertHourTime(record)),
      classNameCell: handleGetLackClassNameCell
    },
    {
      field: 'comp',
      label: 'Comp',
      render: (record) => record && record !== '00:00:00'
        && convertHourTime(record),
      classNameCell: handleGetCompClassNameCell

    },
    {
      field: 'adminNote',
      label: 'AdminNote',
      classNameCell: handleGetClassNameCell
    },
    {
      field: '#',
      label: 'Action',
      render: (record, index, row) => (
        <>
          {
            handleCheckMakeJutification(row)
            && (
              <>
                {
                  <Tooltip title="Late/Early">
                    <IconButton
                      className={handleGetClassNameRowAction(row, 'late/early')}
                      onClick={handleCreateRequest('late/early', row)}
                      disabled={handleDisabledCompensationRequest(row)}
                    >
                      <SnoozeIcon />
                    </IconButton>

                  </Tooltip>
                }
                {

                  <Tooltip title="Forget">
                    <IconButton
                      onClick={handleCreateRequest('forget', row)}
                      className={handleGetClassNameRowAction(row, 'forget')}
                      disabled={handleDisabledForgetRequest(row)}
                    >
                      <AvTimerIcon />
                    </IconButton>

                  </Tooltip>

                }

              </>
            )
          }

        </>
      ),
      classNameCell: handleGetClassNameCellAction
    },
  ];

  return (
    <AuthenticatedContainer>
      <HeaderWrapperComponent
        title="Timesheet"
        action={(
          <>
            <Grid
              container
              spacing={2}
              direction="row"
              justify="flex-end"
              alignItems="center"
            >
              <Grid item xs={1}><div className={classes.leaveExplain} /></Grid>
              <Grid item xs={2}><span>Weekend</span></Grid>
            </Grid>
          </>
        )}
      />
      <UserInfoComponent />
      <Grid container>
        <FilterComponent
          listFilterRender={(
            <Chip
              label={`From ${formValue.fromDate.format('DD/MM/YYYY')} to ${formValue.toDate.format('DD/MM/YYYY')}`}
              className={classes.filterItem}
            />
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
        dataSource={dataTimesheet}
        columns={columns}
        classnameHeaderCell={classes.headerTable}
        classnameBodyCell={classes.bodyTable}
      // pagination={pagination}
      // onChange={handleChangeTable}
      />
      <LateEarlyModalComponent
        openProps={openModalPropsEarlyLate}
        infoProps={infoModalPropsEarlyLate}
        setOpenModal={setOpenEarlyLateModal}
        refreshListFunc={handleRefeshTimeSheet}
        setInfoModal={setInfoModalPropsEarlyLate}

      />
      <ForgetModalComponent
        openProps={openModalPropsForget}
        infoProps={infoModalPropsForget}
        setOpenModal={setOpenForgetModal}
        refreshListFunc={handleRefeshTimeSheet}
        setInfoModal={setInfoModalPropsForget}

      />
    </AuthenticatedContainer>
  );
}
export default Timesheet;
