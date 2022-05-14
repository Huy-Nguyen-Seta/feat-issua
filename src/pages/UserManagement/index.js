import React, { useState, useEffect } from 'react';
import moment from 'moment';
import { makeStyles } from '@material-ui/core/styles';
import { useDispatch } from 'react-redux';

import {
  Grid, TextField, Chip, Button, Tooltip, IconButton
} from '@material-ui/core';
import EditIcon from '@material-ui/icons/Edit';
import VpnKeyIcon from '@material-ui/icons/VpnKey';
import AlarmIcon from '@material-ui/icons/Alarm';

import AuthenticatedContainer from '../../containers/AuthenticatedContainer';

import { HeaderWrapperComponent } from '../../components/HeaderWrapperComponent';
import CustomTable from '../../components/CustomTable';
import { FilterComponent } from '../../components/FilterComponent';
import UserCRUD from '../../components/UserManagementComponent/UserCRUD';
import { RoleListComponent } from '../../components/RoleListComponent';
import ChangePassword from '../../components/UserManagementComponent/ChangePassword';
import ManagerListComponent from '../../components/ManagerListComponent';
import WorkingScheduleSetting from '../../components/UserManagementComponent/WorkingScheduleSetting';
import { userStatusFilter } from '../../components/UserStatusFilterComponent';

import { requestGetListUser } from '../../state/modules/user/actions';
import { showNotification } from '../../state/modules/notification/actions';

import { styles } from './styles';
import PaginationFilterComponent from '../../components/PaginationFilterComponent';
import { defaultLimit, maxRowPerPage } from '../../global/constants';

const originalForm = {
  badgeNumber: '',
  title: null,
  status: '',
  managerId: '',
  email: '',
  limit: defaultLimit
};

const useStyles = makeStyles({
  ...styles
});

function UserManagement() {
  const classes = useStyles();
  const dispatch = useDispatch();
  const [limit, setLimit] = useState(defaultLimit);

  const [editUser, setEditUser] = useState({});

  const [dataSource, setDataSource] = useState([]);
  const [pagination, setPagination] = useState({});

  const [formValue, setFormValue] = useState({
    ...originalForm,
    // status: userStatusFilter.ACTIVE,
    limit
  });

  const [openModalProps, setOpenModalProps] = useState(false);

  const [openModalChangePassProps, setOpenModalChangePassProps] = useState({});

  const [openModalWorkingScheduleProps, setOpenModalWorkingScheduleProps] = useState({});

  const handleFetchUsers = ({ filter }) => {
    dispatch(requestGetListUser({
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
              count: Math.ceil(res.pagination.count / (filter.limit || limit))
            });
          }
        }
      }
    }));
  };

  const handleFetchReadyToFetchUser = (dataFilter, page) => {
    const filterObj = {};
    if (dataFilter.badgeNumber) filterObj.badgeNumber = dataFilter.badgeNumber.trim();
    if (dataFilter.email) filterObj.email = dataFilter.email.trim();
    if (dataFilter.title && dataFilter.title.label) {
      filterObj.title = dataFilter.title.label;
    }
    if (dataFilter.managerId && dataFilter.managerId.value) {
      filterObj.managerId = dataFilter.managerId.value;
    }
    if (dataFilter.status) {
      filterObj.status = dataFilter.status;
    }
    if (dataFilter.limit) {
      filterObj.limit = dataFilter.limit;
    }
    filterObj.page = page || 1;
    handleFetchUsers({ filter: filterObj });
  };

  const handleChangeTable = (e, page) => {
    handleFetchReadyToFetchUser(formValue, page);
  };

  const handleKeyDownFilter = (event) => {
    if (event.keyCode === 13) {
      handleFetchReadyToFetchUser(formValue, 1);
    }
  };

  const refreshListUser = () => {
    handleFetchReadyToFetchUser(formValue, pagination.current);
  };

  useEffect(() => {
    handleFetchReadyToFetchUser({
      ...originalForm,
      status: userStatusFilter.ACTIVE,
    }, 1);
  }, []);

  const handleFormChange = (type) => (event) => {
    const dataChange = {
      ...formValue,
      [type]: event.target.value && event.target.value,
    };
    if (type === 'limit') {
      const newLimit = Number(event.target.value) || maxRowPerPage;
      dataChange.limit = newLimit;
      setLimit(newLimit);
    }
    setFormValue(dataChange);
    if (type === 'title'
      || type === 'managerId'
      || type === 'status'
      || type === 'limit') {
      handleFetchReadyToFetchUser(dataChange, 1);
    }
  };

  const handleAddUser = () => {
    setEditUser({});
    setOpenModalProps(true);
  };

  const handleEditUser = (data) => () => {
    setEditUser(data);
    setOpenModalProps(true);
  };

  const handleEditPasswordUser = (data) => () => {
    setOpenModalChangePassProps(data);
  };

  const handleEditWorkingSchedule = (data) => () => {
    setOpenModalWorkingScheduleProps(data);
  };

  const handleDeleteItemFilter = (type) => () => {
    const dataChange = { ...formValue, [type]: originalForm[type] };
    handleFetchReadyToFetchUser(dataChange, 1);
    setFormValue(dataChange);
  };
  const columns = [
    {
      field: 'badgeNumber',
      label: 'ID',
    },
    {
      field: 'name',
      label: 'Fullname',
    },
    {
      field: 'phone',
      label: 'Phone'
    },
    {
      field: 'birthDay',
      label: 'Birthday',
      render: (text) => text && moment(text).format('DD/MM/YYYY')
    },
    {
      field: 'email',
      label: 'Email'
    },
    {
      field: 'title',
      label: 'Grant'
    },
    {
      field: 'managerName',
      label: 'Manager',
      render: (text, index, row) => <span>{`${text || '//'} - ${row.managerBadgeNumber || '//'}`}</span>
    },
    {
      field: 'hiredDate',
      label: 'Start Date',
      render: (text) => text && moment(text).format('DD/MM/YYYY')
    },

    // {
    //   field: 'status',
    //   label: 'Status'
    // },
    {
      label: 'Action',
      render: (text, index, row) => (
        <>
          <Tooltip title="Edit">
            <IconButton
              size="small"
              onClick={handleEditUser(row)}
              color="#000"
              aria-label="delete"
              className={classes.actionButton}
            >
              <EditIcon />
            </IconButton>

          </Tooltip>
          <IconButton
            size="small"
            onClick={handleEditPasswordUser(row)}
            color="#000"
            className={classes.actionButton}
            disabled={row.title === 'admin'}
          >
            <Tooltip title="Change Password">
              <VpnKeyIcon />
            </Tooltip>

          </IconButton>
          <IconButton
            size="small"
            onClick={handleEditWorkingSchedule(row)}
            color="#000"
            className={classes.actionButton}
          >
            <Tooltip title="Working Schedule">
              <AlarmIcon />
            </Tooltip>

          </IconButton>
        </>
      )
    },
  ];
  return (
    <AuthenticatedContainer>
      <Grid container>
        <HeaderWrapperComponent
          title="User Management"
          action={(
            <>
              <Button
                variant="contained"
                color="primary"
                style={{ float: 'right', marginLeft: 10 }}
                onClick={handleAddUser}
              >
                Add User
              </Button>
            </>
          )}
        />
      </Grid>
      <Grid container>
        <FilterComponent
          listFilterRender={(
            <>
              {Object.keys(formValue).map((key) => (
                formValue[key] && (
                  <Chip
                    label={formValue[key].label ? formValue[key].label : formValue[key]}
                    className={classes.filterItem}
                    onDelete={handleDeleteItemFilter(key)}
                  />
                )
              ))}

            </>
          )}

          formFilter={(
            <>
              <Grid container spacing={2}>
                <Grid item xs={12} md={3}>
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
                <Grid item xs={12} md={6}>
                  <TextField
                    id="date-picker-inline"
                    label="Email"
                    style={{ width: '100%' }}
                    value={formValue.email}
                    onChange={handleFormChange('email')}
                    InputLabelProps={{
                      shrink: true,
                    }}
                    onKeyDown={handleKeyDownFilter}
                  />

                </Grid>
                <Grid item xs={12} md={3}>
                  <PaginationFilterComponent
                    value={limit}
                    onChange={handleFormChange('limit')}
                    displayEmpty
                    style={{ width: '100%' }}
                    labelInValue
                    inputLabel="Row Per Page"
                  />

                </Grid>
              </Grid>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <RoleListComponent
                    value={formValue.title}
                    onChange={handleFormChange('title')}
                    displayEmpty
                    style={{ width: '100%' }}
                    labelInValue
                    inputLabel="Grant"
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <ManagerListComponent
                    value={formValue.managerId}
                    onChange={handleFormChange('managerId')}
                    displayEmpty
                    style={{ width: '100%' }}
                    labelInValue
                    inputLabel="Manager"
                  />

                </Grid>

                {/* <Grid item xs={12} md={4}>
                  <UserStatusFilterComponent
                    value={formValue.status}
                    onChange={handleFormChange('status')}
                    style={{ width: '100%' }}
                    inputLabel="Status"
                  />

                </Grid> */}
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
      <UserCRUD
        openProps={openModalProps}
        setOpenPropsModal={setOpenModalProps}
        refreshListUser={refreshListUser}
        editUser={editUser}

      />

      <ChangePassword
        openProps={openModalChangePassProps}
        setOpenPropsModal={setOpenModalChangePassProps}
      />

      <WorkingScheduleSetting
        openProps={openModalWorkingScheduleProps}
        setOpenPropsModal={setOpenModalWorkingScheduleProps}
      />

    </AuthenticatedContainer>
  );
}

export default UserManagement;
