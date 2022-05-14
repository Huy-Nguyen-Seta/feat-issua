import React, { useState, useEffect } from 'react';
import moment from 'moment';
import { useDispatch } from 'react-redux';
import {
  Grid, Chip,
  TextField, Button, CircularProgress
} from '@material-ui/core';
import MomentUtils from '@date-io/moment';
import {
  MuiPickersUtilsProvider,
  KeyboardDatePicker,
} from '@material-ui/pickers';
import GetAppIcon from '@material-ui/icons/GetApp';
import { makeStyles } from '@material-ui/core/styles';
import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx';
import AuthenticatedContainer from '../../containers/AuthenticatedContainer';
import { HeaderWrapperComponent } from '../../components/HeaderWrapperComponent';
import CustomTable from '../../components/CustomTable';
import { FilterComponent } from '../../components/FilterComponent';
import TimeRangeComponent, { orginalRange } from '../../components/TimeRangeComponent';
import { getRealTimeWorking } from '../../helper/helper';
import { requestGetAllUserTimesheet, requestGetExportAllUserTimesheet } from '../../state/modules/timesheet/actions';
import { showNotification } from '../../state/modules/notification/actions';
import { styles } from './styles';
import { defaultLimit, maxRowPerPage } from '../../global/constants';
import PaginationFilterComponent, { paginationFilter } from '../../components/PaginationFilterComponent';

const useStyles = makeStyles({
  ...styles
});

const originalForm = {
  fromDate: moment(),
  toDate: moment(),
  badgeNumber: '',
  rangeDate: 'today',
  limit: defaultLimit
};

const fileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const fileExtension = '.xlsx';

const dataMoment = ['fromDate', 'toDate'];

function TimesheetAllUser() {
  const dispatch = useDispatch();
  const classes = useStyles();

  const [formValue, setFormValue] = useState(originalForm);

  const [pagination, setPagination] = useState({});
  const [dataSource, setDataSource] = useState([]);
  const [limit, setLimit] = useState(defaultLimit);

  const [loadingExport, setLoadingExport] = useState(false);

  const handleFetchTimesheetAll = ({ filter }) => {
    dispatch(requestGetAllUserTimesheet({
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
              count: Math.ceil(res.pagination.count / (filter.limit || defaultLimit))
            });
          }
        }
      }
    }));
  };

  const handleSetFilterFetchTimesheet = (dataFilter, page) => {
    const filterObj = {};
    if (dataFilter.badgeNumber) filterObj.badgeNumber = dataFilter.badgeNumber.trim();
    if (dataFilter.fromDate) filterObj.fromDate = dataFilter.fromDate.format('YYYY-MM-DD');
    if (dataFilter.fromDate) filterObj.toDate = dataFilter.toDate.format('YYYY-MM-DD');
    filterObj.limit = dataFilter.limit || limit;
    filterObj.page = page || 1;
    if (filterObj.fromDate.valueOf() <= filterObj.toDate.valueOf()) {
      handleFetchTimesheetAll({ filter: filterObj });
    } else {
      dispatch(showNotification('failed', 'FromDate must be greater than ToDate', true));
    }
  };

  useEffect(() => {
    handleSetFilterFetchTimesheet(formValue, 1);
  }, []);

  const handleFormChange = (type) => (event) => {
    let dataChange = {
      ...formValue,
      [type]: dataMoment.includes(type) ? moment(event) : event.target.value
    };
    if (type === 'limit') {
      const newLimit = Number(event.target.value) || maxRowPerPage;
      dataChange.limit = newLimit;
      setLimit(newLimit);
    }
    if (type === 'rangeDate') {
      dataChange = {
        ...dataChange,
        fromDate: orginalRange[event.target.value][0],
        toDate: orginalRange[event.target.value][1]
      };
    }
    if (type !== 'badgeNumber') {
      handleSetFilterFetchTimesheet(dataChange, 1);
    }
    setFormValue(dataChange);
  };

  const handleKeyDownFilter = (event) => {
    if (event.keyCode === 13) {
      handleSetFilterFetchTimesheet(formValue, 1);
    }
  };

  const handleChangeTable = (e, page) => {
    handleSetFilterFetchTimesheet(formValue, page);
  };

  const handleGetClassNameCell = (record, index, row) => {
    if (row.checkIn === null && row.checkOut === null && row.date
      && [6, 7].includes(moment(row.date).isoWeekday())) return `${classes.leaveItem} ${classes.paddingCell}`;
    return classes.paddingCell;
  };

  const handleGetLackClassNameCell = (record, index, row) => {
    if (row.checkIn === null && row.checkOut === null && row.date
      && [6, 7].includes(moment(row.date).isoWeekday())) return `${classes.leaveItem} ${classes.paddingCell}`;
    if (record && record !== '00:00:00') { return `${classes.lateItem} ${classes.lackItem} ${classes.paddingCell}`; }
  };

  const handleGetCompClassNameCell = (record, index, row) => {
    if (row.checkIn === null && row.checkOut === null && row.date
      && [6, 7].includes(moment(row.date).isoWeekday())) return `${classes.leaveItem} ${classes.paddingCell}`;
    if (record && record !== '00:00:00') { return `${classes.earlyItem} ${classes.paddingCell}`; }
  };

  const exportDataToCSV = (csvData, fileName) => {
    const ws = XLSX.utils.aoa_to_sheet(csvData);
    const wb = { Sheets: { data: ws }, SheetNames: ['data'] };
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: fileType });
    FileSaver.saveAs(data, fileName + fileExtension);
  };

  const handleExportCSV = () => {
    setLoadingExport(true);
    const filter = {};
    if (formValue.badgeNumber) filter.badgeNumber = formValue.badgeNumber.trim();
    if (formValue.fromDate) filter.fromDate = formValue.fromDate.format('YYYY-MM-DD');
    if (formValue.fromDate) filter.toDate = formValue.toDate.format('YYYY-MM-DD');
    dispatch(requestGetExportAllUserTimesheet({
      filter,
      callback: (res) => {
        if (res && res.error) {
          dispatch(showNotification('failed', 'Cannot export data.Please try again later.', true));
        } else if (res && res.data) {
          // need to fix filter to weekend that not having checkIn, checkOut
          const dataResult = res.data && res.data.filter(
            (item) => !([6, 7].includes(moment(item.date).isoWeekday())
              && !item.checkIn && !item.checkOut)
          );

          if (!dataResult.length) {
            dispatch(showNotification('failed', 'No data to export', false));
            setLoadingExport(false);
            return;
          }

          const dataExportHeader = ['AC-No.', 'Name', 'Date', 'Timetable', 'On duty', 'Off duty', 'Clock In', 'Clock Out',
            'Normal', 'Real time', 'Late', 'Early', 'Absent', 'OT Time', 'Work Time', 'Exception', 'Off Time Hours', 'Must C/In', 'Must C/Out',
            'Department', 'NDays', 'WeekEnd', 'Holiday', 'ATT_Time', 'NDays_OT', 'WeekEnd_OT', 'Holiday_OT'
          ];

          const dataExport = dataResult.map((item) => {
            let { workTime } = item;
            let checkIn = '';
            let checkOut = '';
            if (
              item.requestTypeName === 'late/early'
              && item.status === 'aprroved'
              && item.comp
            ) {
              workTime = '08:00:00';
            } else if (
              item.requestTypeName === 'forget'
              && item.status === 'aprroved'
            ) {
              if (!checkIn) checkIn = item.fromTime;
              if (!checkOut) checkOut = item.toTime;
            }

            return [
              item.badgeNumber,
              item.name,
              item.date && moment(item.date).format('DD/MM/YYYY'),
              `CaHC-SX(${moment.utc(item.fromTime, 'HH:mm:ss').local().format('HH:mm')}-${moment.utc(item.toTime, 'HH:mm:ss').local().format('HH:mm')})`,
              moment.utc(item.fromTime, 'HH:mm:ss').local().format('HH:mm'),
              moment.utc(item.toTime, 'HH:mm:ss').local().format('HH:mm'),
              item.checkIn && (checkIn || moment(item.checkIn).format('HH:mm')),
              item.checkOut && (checkOut || moment(item.checkOut).format('HH:mm')),
              '1',
              `${getRealTimeWorking(item.workTime)}`,
              item.late && moment(item.late, 'HH:mm:ss').format('HH:mm'),
              item.early && moment(item.early, 'HH:mm:ss').format('HH:mm'),
              !item.checkIn && !item.checkOut ? 'True' : '',
              item.overTime && moment(item.overTime, 'HH:mm:ss').format('HH:mm'),
              item.workTime && moment(workTime || item.workTime, 'HH:mm:ss').format('HH:mm'),
              item.requestType,
              item.offTimeHour,
              'True',
              'True',
              'US TEAM',
              `${getRealTimeWorking(item.workTime)}`,
              item.date && [6, 7].includes(moment(item.date).isoWeekday()) ? 'True' : '',
              item.holidayId ? 'True' : '',
              item.inOffice && moment(item.inOffice, 'HH:mm:ss').format('HH:mm'),
              '', '', ''
            ];
          });
          exportDataToCSV([dataExportHeader, ...dataExport], `Export Timesheet ${moment().format('DD-MM-YYYY')}`);
          setLoadingExport(false);
        }
      }
    }));
  };

  const columns = [
    {
      field: 'date',
      label: 'Date',
      render: (record) => (
        <>
          {`${record && moment(record).format('DD/MM/YYYY')} | ${record && moment(record).format('ddd')}`}
        </>
      ),
      classNameCell: handleGetClassNameCell
    },
    {
      field: 'badgeNumber',
      label: 'ID',
      classNameCell: handleGetClassNameCell

    },
    {
      field: 'name',
      label: 'Member',
      classNameCell: handleGetClassNameCell

    },
    {
      field: 'checkIn',
      label: 'Checkin',
      render: (record,) => record && <>{moment(record).format('HH:mm')}</>,
      classNameCell: handleGetClassNameCell
    },
    {
      field: 'checkOut',
      label: 'Checkout',
      render: (record,) => record && <>{moment(record).format('HH:mm')}</>,
      classNameCell: handleGetClassNameCell
    },
    {
      field: 'late',
      label: 'Late',
      render: (record,) => (record && record !== '00:00:00' && (
        <div
          className={`${classes.lateItem}`}
        >
          {record && moment(record, 'HH:mm:ss').format('HH:mm')}
        </div>
      )),
      classNameCell: handleGetClassNameCell

    },
    {
      field: 'early',
      label: 'Early',
      render: (record,) => (record && record !== '00:00:00' && (
        <div
          className={`${classes.lateItem}`}
        >
          {record && moment(record, 'HH:mm:ss').format('HH:mm')}

        </div>
      )),
      classNameCell: handleGetClassNameCell

    },
    {
      field: 'inOffice',
      label: 'In Office',
      render: (record,) => record && record !== '00:00:00' && (<>{moment(record, 'HH:mm:ss').format('HH:mm')}</>),
      classNameCell: handleGetClassNameCell

    },
    {
      field: 'overTime',
      label: 'Overtime',
      render: (record,) => (record && record !== '00:00:00' && (<>{moment(record, 'HH:mm:ss').format('HH:mm')}</>)),
      classNameCell: handleGetClassNameCell

    },
    {
      field: 'workTime',
      label: 'Worktime',
      render: (record,) => (record && record !== '00:00:00' && (<>{moment(record, 'HH:mm:ss').format('HH:mm')}</>)),
      classNameCell: handleGetClassNameCell
    },

    {
      field: 'lack',
      label: 'Lack',
      render: (record,) => (record && record !== '00:00:00' && (
        <>
          {record && moment(record, 'HH:mm:ss').format('HH:mm')}
        </>
      )),
      classNameCell: handleGetLackClassNameCell
    },
    {
      field: 'comp',
      label: 'Comp',
      render: (record,) => record && record !== '00:00:00' && (<>{record && moment(record, 'HH:mm:ss').format('HH:mm')}</>),
      classNameCell: handleGetCompClassNameCell

    },
    {
      field: 'adminNote',
      label: 'AdminNote',
      classNameCell: handleGetClassNameCell
    },
    {
      field: 'requestType',
      label: 'Requested',
      render: (record, row) => (record && ![6, 7].includes(moment(row.date).isoWeekday()) && (
        <div
          className={`${classes.requestItem}`}
        >
          {record}
        </div>
      )),
      classNameCell: handleGetClassNameCell

    }
  ];

  const handleDeleteItemFilter = (type) => {
    const dataChange = { ...formValue, [type]: '' };
    handleSetFilterFetchTimesheet(dataChange, 1);
    setFormValue(dataChange);
  };

  return (
    <AuthenticatedContainer>
      <HeaderWrapperComponent
        title="User Timesheet"
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

              <Grid item xs={3}>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={(
                    <>

                      {loadingExport ? (
                        <CircularProgress
                          size={20}
                          color="#fff"
                        />
                      ) : <GetAppIcon />}
                    </>
                  )}

                  onClick={handleExportCSV}
                >
                  Export
                </Button>
              </Grid>
            </Grid>
          </>
        )}
      />
      <Grid container>
        <FilterComponent
          listFilterRender={(
            <>
              <Chip
                label={`From ${formValue.fromDate.format('DD/MM/YYYY')} to ${formValue.toDate.format('DD/MM/YYYY')}`}
                className={classes.filterItem}
              />
              {
                formValue.badgeNumber && (
                  <Chip
                    key="badgeNumber-chip"
                    label={formValue.badgeNumber}
                    onDelete={() => handleDeleteItemFilter('badgeNumber')}
                    className={classes.filterItem}
                  />
                )
              }
              {
                formValue.limit && (
                  <Chip
                    key="limit-chip"
                    label={maxRowPerPage === formValue.limit
                      ? paginationFilter.ALL : formValue.limit}
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
                  <Grid item xs={12} md={4}>
                    <TextField
                      id="standard-required"
                      label="ID"
                      InputLabelProps={{
                        shrink: true,
                      }}
                      value={formValue.badgeNumber}
                      onChange={handleFormChange('badgeNumber')}
                      style={{ width: '100%' }}
                      onKeyDown={handleKeyDownFilter}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TimeRangeComponent
                      value={formValue.rangeDate}
                      onChange={handleFormChange('rangeDate')}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <PaginationFilterComponent
                      value={limit}
                      onChange={handleFormChange('limit')}
                      displayEmpty
                      style={{ width: '100%' }}
                      labelInValue
                      inputLabel="Row Per Page"
                    />

                  </Grid>
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
    </AuthenticatedContainer>
  );
}
export default TimesheetAllUser;
