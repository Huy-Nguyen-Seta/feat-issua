import React, { useEffect, useState } from 'react';

import {
  Grid,
  Button,
  Tooltip,
  IconButton,
  Chip,
  TextField,
  Dialog,
  useMediaQuery,
  DialogTitle,
  DialogActions,
  Checkbox,
  DialogContent,
  Box,
} from '@material-ui/core';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import EditIcon from '@material-ui/icons/Edit';
import { useDispatch } from 'react-redux';
import { HeaderWrapperComponent } from '../../components/HeaderWrapperComponent';
import PaginationFilterComponent from '../../components/PaginationFilterComponent';
import YearFilterComponent from '../../components/YearFilterComponent';
import AuthenticatedContainer from '../../containers/AuthenticatedContainer';
import { fetchAllUserLeave, createAllUserLeave } from '../../state/modules/userLeave/actions';
import { styles } from './styles';

import { defaultLimit, maxRowPerPage } from '../../global/constants';
import CustomTable from '../../components/CustomTable';
import { FilterComponent } from '../../components/FilterComponent';
import { showNotification } from '../../state/modules/notification/actions';
import { getDaysFromHours } from '../../helper/helper';
import UpdateUserLeaveModal from '../../components/UpdateUserLeaveModal';
import { RoleListComponent } from '../../components/RoleListComponent';

const originalForm = {
  badgeNumber: '',
  name: null,
  year: new Date().getFullYear(),
  limit: defaultLimit,
  title: '',
};

const convertHourTime = (hours) => {
  const { day, hour } = getDaysFromHours(hours);
  return `${day}${day > 1 ? ' days' : ' day'} 
  ${hour}${hour > 1 ? ' hours' : ' hour'}`;
};

const useStyles = makeStyles({
  ...styles
});

const UserLeaveManager = () => {
  const classes = useStyles();

  const [dataSource, setDataSource] = useState([]);
  const [pagination, setPagination] = useState({});
  const [openModal, setOpenModal] = useState(false);
  const [objEdit, setObjEdit] = useState({});
  const [checkedCarryOver, setCheckedCarryOver] = useState([]);
  const [disableCarryOver, setDisableCarryOver] = useState([]);
  const dispatch = useDispatch();

  const [limit, setLimit] = useState(defaultLimit);
  const [year, setYear] = useState(new Date().getFullYear());

  const [formValue, setFormValue] = useState({
    ...originalForm,
    limit
  });

  const handleFetchUserLeave = ({ filter }) => {
    dispatch(fetchAllUserLeave({
      filter,
      callback: (res) => {
        if (res?.error) {
          dispatch(showNotification('failed', res.error.message || res.error, true));
        } else {
          setDataSource(res.data);
          if (res.pagination) {
            setPagination({
              current: +res.pagination.page,
              total: +res.pagination.count,
              count: Math.ceil(res.pagination.count / (filter.limit || limit))
            });
          }
        }
      }
    }));
  };

  const handleFetchReadyToFetchData = (dataFilter, page) => {
    const filterObj = {};
    if (dataFilter.badgeNumber) filterObj.badgeNumber = dataFilter.badgeNumber.trim();
    if (dataFilter.name) filterObj.name = dataFilter.name.trim();
    if (dataFilter.limit) {
      filterObj.limit = dataFilter.limit;
    }
    if (dataFilter.year) {
      filterObj.year = dataFilter.year;
    }
    if (dataFilter.title?.label) {
      filterObj.title = dataFilter.title.label;
    }
    filterObj.page = page || 1;
    handleFetchUserLeave({ filter: filterObj });
  };

  useEffect(() => {
    handleFetchReadyToFetchData({
      ...originalForm,
    }, 1);
  }, []);

  const handleChangeTable = (e, page) => {
    handleFetchReadyToFetchData(formValue, page);
  };
  const handleKeyDownFilter = (event) => {
    if (event.keyCode === 13) {
      handleFetchReadyToFetchData(formValue, 1);
    }
  };
  const handleDeleteItemFilter = (type) => () => {
    const dataChange = { ...formValue, [type]: originalForm[type] };
    handleFetchReadyToFetchData(dataChange, 1);
    setFormValue(dataChange);
  };
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
    if (type === 'year') {
      const newYear = Number(event.target.value) || new Date().getFullYear();
      dataChange.year = newYear;
      setYear(newYear);
    }
    setFormValue(dataChange);
    if (type === 'name'
      || type === 'year'
      || type === 'limit'
      || type === 'title') {
      handleFetchReadyToFetchData(dataChange, 1);
    }
  };
  const handleEditUserLeave = (row) => {
    setObjEdit(row);
    setOpenModal(true);
  };
  const carryUserCheckbox = (row) => () => {
    if (checkedCarryOver.includes(row)) {
      setCheckedCarryOver((prev) => prev.filter((el) => el.userId !== row.userId));
    } else {
      setCheckedCarryOver((prev) => [...prev, row]);
    }
  };
  const handleDeleteChip = (row) => () => {
    setCheckedCarryOver((prev) => prev.filter((el) => el.userId !== row.userId));
  };
  const columns = [
    {
      label: 'Select',
      field: 'select',
      render: (_, __, row) => (
        <Tooltip title={row.badgeNumber}>
          <Checkbox
            checked={checkedCarryOver.includes(row)}
            onChange={carryUserCheckbox(row)}
            disabled={!disableCarryOver ? true : disableCarryOver.includes(row.userId)}
            color="primary"
          />
        </Tooltip>
      )
    },
    {
      field: 'badgeNumber',
      label: 'ID',
    },
    {
      field: 'name',
      label: 'Full Name',
    },
    {
      field: 'title',
      label: 'Grant'
    },
    {
      field: 'totalLeave',
      label: 'Total Leave',
      render: (hour) => convertHourTime(hour)
    },
    {
      field: 'totalRemain',
      label: 'Total Leave Remain',
      render: (hour) => convertHourTime(hour)
    },
    {
      field: 'carryOver',
      label: 'Carry Over',
      render: (hour) => convertHourTime(hour)
    },
    {
      field: 'carryOverRemain',
      label: 'Carry Over Remain',
      render: (hour) => convertHourTime(hour)
    },
    {
      field: 'year',
      label: 'Year'
    },
    {
      label: 'Edit',
      render: (text, index, row) => (
        <>
          <Tooltip title="Edit">
            <IconButton
              size="small"
              onClick={() => handleEditUserLeave(row)}
              color="primary"
              aria-label="delete"
              className={classes.actionButton}
            >
              <EditIcon />
            </IconButton>

          </Tooltip>
        </>
      )
    },
  ];
  const refreshList = () => {
    handleFetchReadyToFetchData(formValue, pagination.current);
  };
  const [openDialog, setOpenDialog] = React.useState(false);
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const handleClickOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleCreateUserLeave = () => {
    dispatch(createAllUserLeave({
      payload: checkedCarryOver.length > 0 && {
        data: checkedCarryOver.reduce(
          (prevArr, currValue) => [...prevArr, currValue.userId],
          []
        ),
      },
      callback: (res) => {
        if (res?.error) {
          dispatch(showNotification('failed', 'Error Server', true));
        } else {
          if (checkedCarryOver.length === 0) {
            setDisableCarryOver(undefined);
          } else {
            setDisableCarryOver((prev) => [
              ...prev,
              ...checkedCarryOver.reduce((prevArr, currValue) => [...prevArr, currValue.userId], [])
            ]);
          }
          setCheckedCarryOver([]);
          handleCloseDialog();
          handleFetchReadyToFetchData(formValue, 1);
          dispatch(showNotification('success', 'Create/Update all user leave successfully!',));
        }
      }
    }));
  };
  return (
    <AuthenticatedContainer>
      <Grid container>
        <HeaderWrapperComponent
          title="User Leave Management"
          action={(
            <>
              <Button
                variant="contained"
                color="primary"
                style={{ float: 'right', marginLeft: 10 }}
                onClick={handleClickOpenDialog}
              >
                {checkedCarryOver.length === 0
                  ? 'Carry All Users'
                  : `Carry ${checkedCarryOver.length} ${
                    checkedCarryOver.length === 1 ? 'User' : 'Users'
                  }`}
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
                <Grid item xs={12} md={3}>
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
                <Grid item xs={12} md={3}>
                  <RoleListComponent
                    value={formValue.title}
                    onChange={handleFormChange('title')}
                    displayEmpty
                    style={{ width: '100%' }}
                    labelInValue
                    inputLabel="Role"
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <YearFilterComponent
                    value={year}
                    onChange={handleFormChange('year')}
                    displayEmpty
                    style={{ width: '100%' }}
                    labelInValue
                    inputLabel="Year"
                  />
                </Grid>
                <Grid item xs={12} md={12}>
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
      <UpdateUserLeaveModal
        openModal={openModal}
        setOpenModal={setOpenModal}
        objEdit={objEdit}
        refreshList={refreshList}
        setObjEdit={setObjEdit}
      />

      <Dialog
        fullScreen={fullScreen}
        open={openDialog}
        onClose={handleCloseDialog}
        aria-labelledby="responsive-dialog-title"
      >
        <DialogTitle id="responsive-dialog-title">Do you want to update Leave Day?</DialogTitle>
        {checkedCarryOver.length !== 0 && (
          <DialogContent>
            <Box style={{ display: 'flex', gap: '3px', flexWrap: 'wrap' }}>
              {checkedCarryOver.map((row) => (
                <Chip label={`${row.name} - ${row.badgeNumber}`} onDelete={handleDeleteChip(row)} color="primary" />
              ))}
            </Box>
          </DialogContent>
        ) }
        <DialogActions>
          <Button autoFocus onClick={handleCloseDialog} color="primary">
            Disagree
          </Button>
          <Button onClick={handleCreateUserLeave} color="primary" autoFocus>
            {checkedCarryOver.length === 0 ? 'Carry All User' : 'Carry Selected User' }
          </Button>
        </DialogActions>
      </Dialog>
    </AuthenticatedContainer>
  );
};

export default UserLeaveManager;
