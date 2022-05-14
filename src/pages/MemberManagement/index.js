import React, { useState, useEffect } from 'react';
import {
  Grid, TextField, Chip,
} from '@material-ui/core';
import moment from 'moment';
import { makeStyles } from '@material-ui/core/styles';
import { useSelector, useDispatch } from 'react-redux';
import AuthenticatedContainer from '../../containers/AuthenticatedContainer';
import { HeaderWrapperComponent } from '../../components/HeaderWrapperComponent';
import { configSelector } from '../../state/modules/config/selector';
import CustomTable from '../../components/CustomTable';
import { FilterComponent } from '../../components/FilterComponent';
import { requestGetListUser } from '../../state/modules/user/actions';
import { showNotification } from '../../state/modules/notification/actions';
import { userSelector } from '../../state/modules/user';

import { styles } from './styles';

const originalForm = {
  badgeNumber: '',
  title: null,
  status: '',
  managerId: ''
};

const useStyles = makeStyles({
  ...styles
});

function UserManagement() {
  const classes = useStyles();
  const dispatch = useDispatch();
  const { user } = useSelector(userSelector);

  const [pagination, setPagination] = useState({});
  const [formValue, setFormValue] = useState(originalForm);
  const [dataSource, setDataSource] = useState([]);
  const { rowPerPage } = useSelector(configSelector);

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
              count: Math.ceil(res.pagination.count / rowPerPage)
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
    filterObj.managerId = user.id;
    filterObj.limit = rowPerPage;
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

  useEffect(() => {
    handleFetchReadyToFetchUser(formValue);
  }, []);

  const handleFormChange = (type) => (event) => {
    const dataChange = {
      ...formValue,
      [type]: event.target.value && event.target.value
    };
    setFormValue(dataChange);
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
    }

  ];
  return (
    <AuthenticatedContainer>
      <Grid container>
        <HeaderWrapperComponent
          title="Member List"
        />
      </Grid>
      <Grid container>
        <FilterComponent
          listFilterRender={(
            <>
              {Object.keys(formValue).map((key) => formValue[key] && (
                <Chip
                  label={formValue[key].label ? formValue[key].label : formValue[key]}
                  className={classes.filterItem}
                  onDelete={handleDeleteItemFilter(key)}
                />
              ))}

            </>
          )}

          formFilter={(
            <>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
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

    </AuthenticatedContainer>
  );
}

export default UserManagement;
