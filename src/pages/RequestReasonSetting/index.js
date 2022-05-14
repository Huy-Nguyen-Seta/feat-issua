import React, { useState, useEffect } from 'react';
import {
  Grid, TextField, Chip, Button, Typography,
  Popover, Tooltip
} from '@material-ui/core';
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete';
import { makeStyles } from '@material-ui/core/styles';
import { useSelector, useDispatch } from 'react-redux';
import AuthenticatedContainer from '../../containers/AuthenticatedContainer';
import { HeaderWrapperComponent } from '../../components/HeaderWrapperComponent';
import { configSelector } from '../../state/modules/config/selector';
import CustomTable from '../../components/CustomTable';
import { FilterComponent } from '../../components/FilterComponent';
import { requestDeleteRequestReason, requestGetRequestReason } from '../../state/modules/reason/actions';
import { showNotification } from '../../state/modules/notification/actions';
import RequestReasonCRUD from '../../components/RequestReasonComponents/RequestReasonCRUD';

import { styles } from './styles';

const originalForm = {
  name: '',
};

const useStyles = makeStyles((theme) => ({
  ...styles(theme)
}));

function RequestReasonSetting() {
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

  const handleFetchReason = ({ filter }) => {
    dispatch(requestGetRequestReason({
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

  const handleFetchReadyToFetchReasons = (dataFilter, page) => {
    const filterObj = {};
    if (dataFilter.name) filterObj.name = dataFilter.name.trim();
    filterObj.limit = rowPerPage;
    filterObj.page = page || 1;
    handleFetchReason({ filter: filterObj });
  };

  const handleChangeTable = (e, page) => {
    handleFetchReadyToFetchReasons(formValue, page);
  };

  const handleKeyDownFilter = (event) => {
    if (event.keyCode === 13) {
      handleFetchReadyToFetchReasons(formValue, 1);
    }
  };

  useEffect(() => {
    handleFetchReadyToFetchReasons(formValue);
  }, []);

  const handleRefeshRequestReason = () => {
    handleFetchReadyToFetchReasons(formValue, pagination.current);
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
    handleFetchReadyToFetchReasons(dataChange);

    setFormValue(dataChange);
  };

  const handleAddRequestReason = () => {
    setInfoModalProps({});
    setOpenModalProps(true);
  };

  const handleEditRequestReasonItem = (row) => () => {
    setInfoModalProps(row);
    setOpenModalProps(true);
  };

  const handleClosePopOver = () => {
    setAnchorEl(null);
  };

  const handleConfirmDeleteRequestReasonItem = (row) => (event) => {
    setAnchorEl({ event: event.currentTarget, id: row.id });
  };

  const handleDeleteItemRequestReason = () => {
    dispatch(requestDeleteRequestReason({
      payload: { id: anchorEl.id },
      callback: (res) => {
        if (res && res.success === true) {
          handleClosePopOver();
          handleRefeshRequestReason();
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
      label: 'Name',
    },

    {
      field: 'requestTypeName',
      label: 'Request Type',
    },
    {
      field: 'maxRequestDay',
      label: 'Max Request',
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
              onClick={handleEditRequestReasonItem(row)}
            />

          </Tooltip>
          <Tooltip title="Delete">
            <DeleteIcon
              style={{ cursor: 'pointer' }}
              onClick={handleConfirmDeleteRequestReasonItem(row)}
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
                    onClick={handleDeleteItemRequestReason}
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
          title="Request Reason Setting"
          action={(
            <Button
              variant="contained"
              color="primary"
              onClick={handleAddRequestReason}
              style={{ float: 'right' }}
            >
              New Request Reason
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
      <RequestReasonCRUD
        openProps={openModalProps}
        infoProps={infoModalProps}
        setOpenModal={setOpenModalProps}
        refreshListFunc={handleRefeshRequestReason}
      />
    </AuthenticatedContainer>
  );
}

export default RequestReasonSetting;
