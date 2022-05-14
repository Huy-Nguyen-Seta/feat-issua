import React, { useState, useEffect } from 'react';
import {
  Grid, TextField, Chip, Button, Typography,
  Popover, Tooltip
} from '@material-ui/core';
import moment from 'moment';
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete';
import { makeStyles } from '@material-ui/core/styles';
import { useSelector, useDispatch } from 'react-redux';
import AuthenticatedContainer from '../../containers/AuthenticatedContainer';
import { HeaderWrapperComponent } from '../../components/HeaderWrapperComponent';
import { configSelector } from '../../state/modules/config/selector';
import CustomTable from '../../components/CustomTable';
import { FilterComponent } from '../../components/FilterComponent';
import { requestGetHoliday, requestDeleteHoliday } from '../../state/modules/holidays/actions';
import { showNotification } from '../../state/modules/notification/actions';
import HolidayCRUD from '../../components/HolidayComponents/HolidayCRUD';

import { styles } from './styles';

const originalForm = {
  name: '',
};

const useStyles = makeStyles((theme) => ({
  ...styles(theme)
}));

function UserManagement() {
  const classes = useStyles();
  const dispatch = useDispatch();
  const { rowPerPage } = useSelector(configSelector);

  const [dataSource, setDataSource] = useState([]);
  const [pagination, setPagination] = useState({});
  const [formValue, setFormValue] = useState(originalForm);

  const [openModalProps, setOpenModalProps] = useState(false);
  const [infoModalProps, setInfoModalProps] = useState(null);

  // eslint-disable-next-line no-unused-vars
  const [anchorEl, setAnchorEl] = useState(null);

  const handleFetchHolidays = ({ filter }) => {
    dispatch(requestGetHoliday({
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

  const handleFetchReadyToFetchHolidays = (dataFilter, page) => {
    const filterObj = {};
    if (dataFilter.name) filterObj.name = dataFilter.name.trim();
    filterObj.limit = rowPerPage;
    filterObj.page = page || 1;
    handleFetchHolidays({ filter: filterObj });
  };

  const handleChangeTable = (e, page) => {
    handleFetchReadyToFetchHolidays(formValue, page);
  };

  const handleKeyDownFilter = (event) => {
    if (event.keyCode === 13) {
      handleFetchReadyToFetchHolidays(formValue, 1);
    }
  };

  useEffect(() => {
    handleFetchReadyToFetchHolidays(formValue);
  }, []);

  const handleRefeshHolidays = () => {
    handleFetchReadyToFetchHolidays(formValue, pagination.current);
  };

  const handleFormChange = (type) => (event) => {
    const dataChange = {
      ...formValue,
      [type]: event.target.value && event.target.value
    };
    setFormValue(dataChange);
  };
  const handleDeleteItemFilter = (type) => () => {
    const dataChange = { ...formValue, [type]: originalForm[type] };
    handleFetchReadyToFetchHolidays(dataChange);

    setFormValue(dataChange);
  };

  const handleAddHoliday = () => {
    setInfoModalProps({});
    setOpenModalProps(true);
  };

  const handleEditHolidayItem = (row) => () => {
    setInfoModalProps(row);
    setOpenModalProps(true);
  };

  const handleClosePopOver = () => {
    setAnchorEl(null);
  };

  const handleConfirmDeleteHolidayItem = (row) => (event) => {
    setAnchorEl({ event: event.currentTarget, id: row.id });
  };

  const handleDeleteItemHoliday = () => {
    dispatch(requestDeleteHoliday({
      payload: { id: anchorEl.id },
      callback: (res) => {
        if (res && res.data && res.data.success && res.data.success === true) {
          handleClosePopOver();
          handleRefeshHolidays();
          dispatch(showNotification('success', 'Delete successfully!',));
        } else if (res && res.error) {
          dispatch(showNotification('failed', res.error.message || res.error, true));
        }
      }
    }));
  };
  const columns = [

    {
      field: 'name',
      label: 'Holiday',
    },

    {
      field: 'startDate',
      label: 'Start Date',
      render: (text) => text && moment(text).format('DD/MM/YYYY')
    },
    {
      field: 'endDate',
      label: 'End Date',
      render: (text) => text && moment(text).format('DD/MM/YYYY')
    },
    {
      field: 'duration',
      label: 'Duration (day)'
    },
    {
      field: 'description',
      label: 'Description'
    },
    {
      field: '#',
      label: 'Action',
      render: (text, index, row) => (
        <>
          <Tooltip title="Edit">
            <EditIcon
              style={{ cursor: 'pointer' }}
              onClick={handleEditHolidayItem(row)}
            />
          </Tooltip>
          <Tooltip title="Delete">
            <DeleteIcon
              style={{ cursor: 'pointer' }}
              onClick={handleConfirmDeleteHolidayItem(row)}
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
                    onClick={handleDeleteItemHoliday}
                  >
                    Yes
                  </Button>
                </Grid>
              </Grid>

            </Typography>

          </Popover>

        </>
      )
    },

  ];
  return (
    <AuthenticatedContainer>
      <Grid container>
        <HeaderWrapperComponent
          title="Holiday Setting"
          action={(
            <Button
              variant="contained"
              color="primary"
              onClick={handleAddHoliday}
              style={{ float: 'right' }}
            >
              New Holiday
            </Button>
          )}
        />
      </Grid>
      <Grid container>
        <FilterComponent
          listFilterRender={(
            <>
              {Object.keys(formValue).map((key) => (
                <div key={key}>
                  {formValue[key] && (
                    <Chip
                      label={formValue[key].label ? formValue[key].label : formValue[key]}
                      className={classes.filterItem}
                      onDelete={handleDeleteItemFilter(key)}
                    />
                  )}
                </div>
              ))}

            </>
          )}

          formFilter={(
            <>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    id="date-picker-inline"
                    label="Name"
                    style={{ width: '100%' }}
                    value={formValue.name}
                    onChange={handleFormChange('name')}
                    InputLabelProps={{
                      shrink: true,
                    }}
                    onKeyDown={handleKeyDownFilter}
                  />

                </Grid>
              </Grid>
            </>
          )}
        />

      </Grid>
      <CustomTable
        dataSource={dataSource}
        columns={columns}
        pagination={pagination}
        onChange={handleChangeTable}
      />
      <HolidayCRUD
        openProps={openModalProps}
        infoProps={infoModalProps}
        setOpenModal={setOpenModalProps}
        refreshListFunc={handleRefeshHolidays}
      />
    </AuthenticatedContainer>
  );
}

export default UserManagement;
