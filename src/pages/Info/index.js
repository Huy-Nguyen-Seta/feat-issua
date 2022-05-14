/* eslint-disable react/prop-types */
/* eslint-disable import/extensions */
import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import moment from 'moment';
import { useDispatch, useSelector } from 'react-redux';
import {
  Grid, Avatar, TextField, MenuItem, Select,
} from '@material-ui/core';
import EditIcon from '@material-ui/icons/Edit';
import { useHistory, } from 'react-router-dom';

import {
  MuiPickersUtilsProvider,
  KeyboardDatePicker,
} from '@material-ui/pickers';
import MomentUtils from '@date-io/moment';
import { userSelector } from '../../state/modules/user/selector';
import { requestGetCurrentUser, requestPutUser } from '../../state/modules/user/actions';
import AuthenticatedContainer from '../../containers/AuthenticatedContainer';
import ChangePasswordComponent from '../../components/ChangePasswordComponent';
import { EditGrid, ReadOnlyGrid } from './EditItem';
import { routePath } from '../../helper/constants';

import { styles } from './styles';

const useStyles = makeStyles((theme) => ({
  ...styles(theme)
}));

const originalForm = {
  name: '',
  phone: '',
  birthDay: null,
  gender: ''
};

function Info() {
  const classes = useStyles();
  const dispatch = useDispatch();
  const { user } = useSelector(userSelector);
  const history = useHistory();

  const [editItem, setEditItem] = useState('');
  const [valueEditing, setValueEditing] = useState(originalForm);

  useEffect(() => {
    dispatch(requestGetCurrentUser());
  }, []);
  const handleSetEditItem = (type, value) => () => {
    if (!editItem) {
      setEditItem(type);
      setValueEditing({ ...valueEditing, [type]: value });
    }
  };

  const handleSaveItem = () => () => {
    if (valueEditing[editItem]) {
      dispatch(requestPutUser({
        payload: {
          id: user.id,
          [editItem]: editItem === 'birthDay' ? valueEditing[editItem].format('MM/DD/YYYY') : valueEditing[editItem]
        },
        callback: () => {
          dispatch(requestGetCurrentUser());
        }
      }));
      setEditItem('');
      setValueEditing(originalForm);
    }
  };

  const handleChangeItem = (e) => {
    setValueEditing({
      ...valueEditing,
      [editItem]: e.target.value
    });
  };
  const handleChangeItemDate = (e) => {
    setValueEditing({
      ...valueEditing,
      [editItem]: moment(e)
    });
  };

  const hanleChangeBiometricURL = () => {
    if (!editItem) {
      history.push(routePath.REGISTER_BIOMETRIC);
    }
  };

  return (
    <AuthenticatedContainer>
      <Grid container spacing={2}>
        <Grid item xs={12} md={3}>
          <div className={classes.userAvatar}>
            <Avatar className={classes.userAvatarItem} />
            <div className={classes.userFullname}>
              {`${user && user.name} (ID: ${user && user.badgeNumber})`}
            </div>
            <div>
              {`${user && user.title}`}
            </div>
          </div>
        </Grid>
        <Grid item xs={12} md={9}>
          <MuiPickersUtilsProvider utils={MomentUtils}>
            <div className={classes.infoWrapper} style={{ marginTop: 20 }}>
              <Grid container classes={{ root: classes.infoItem }}>
                <ReadOnlyGrid label="ID" data={user && user.badgeNumber} />
                <EditGrid
                  label="Fullname"
                  type="name"
                  defaultValue={user && user.name}
                  data={user && user.name}
                  editItem={editItem}
                  handleSetEditItem={handleSetEditItem}
                  handleSaveItem={handleSaveItem}
                >
                  <TextField
                    required
                    key="name"
                    id="name"
                    style={{ width: '100%' }}
                    value={valueEditing.name}
                    onChange={handleChangeItem}
                  />
                </EditGrid>
                <ReadOnlyGrid label="Email" data={user && user.email} />
                <EditGrid
                  label="Phone"
                  type="phone"
                  data={user && user.phone}
                  defaultValue={user && user.phone}
                  editItem={editItem}
                  handleSetEditItem={handleSetEditItem}
                  handleSaveItem={handleSaveItem}
                >
                  <TextField
                    required
                    key="phone"
                    id="phone"
                    style={{ width: '100%' }}
                    value={valueEditing.phone}
                    onChange={handleChangeItem}
                  />
                </EditGrid>
                <EditGrid
                  label="Birthday"
                  type="birthDay"
                  data={user && user.birthDay && moment(user.birthDay).format('DD/MM/YYYY')}
                  defaultValue={user && user.birthDay && moment(user.birthDay)}
                  handleSetEditItem={handleSetEditItem}
                  handleSaveItem={handleSaveItem}
                  editItem={editItem}
                >
                  <KeyboardDatePicker
                    disableToolbar
                    variant="inline"
                    format="DD/MM/YYYY"
                    id="date-picker-inline"
                    KeyboardButtonProps={{
                      'aria-label': 'change date',
                    }}
                    key="birthDay"
                    style={{ width: '100%' }}
                    value={valueEditing.birthDay}
                    onChange={handleChangeItemDate}

                  />
                </EditGrid>
                <EditGrid
                  label="Gender"
                  type="gender"
                  data={user && user.gender}
                  defaultValue={user && user.gender}
                  handleSetEditItem={handleSetEditItem}
                  handleSaveItem={handleSaveItem}
                  editItem={editItem}
                >
                  <Select
                    id="demo-simple-select"
                    key="gender"
                    style={{ width: '100%' }}
                    value={valueEditing.gender}
                    onChange={handleChangeItem}
                  >
                    <MenuItem value="male">male</MenuItem>
                    <MenuItem value="female">female</MenuItem>
                  </Select>
                </EditGrid>
                <ReadOnlyGrid label="Hired Date" data={user && user.hired_date && moment(user.hired_date).format('DD/MM/YYYY')} />
                <ReadOnlyGrid label="Status" data={user && user.status} />
              </Grid>
            </div>
          </MuiPickersUtilsProvider>
        </Grid>
      </Grid>
      <Grid container spacing={2}>
        <Grid item xs={12} md={3} />
        <Grid item xs={12} md={9}>
          <ChangePasswordComponent
            editItem={editItem}
            setEditItem={setEditItem}
            className={{
              classGrid: {
                root: classes.infoItem,
              },
              infoItemIcon: classes.infoItemIcon,
              changePassWordTitle: classes.changePassWordTitle,
            }}
          />

        </Grid>
      </Grid>
      <Grid
        container
        spacing={2}
      >
        <Grid item xs={12} md={3} />
        <Grid item xs={12} md={9}>
          <Grid
            container
            classes={classes.classGrid}
            direction="row"
            alignItems="center"
          >
            <Grid item xs={12} md={3}>
              <div className={classes.changePassWordTitle}>
                CHANGE BIOMETRIC
              </div>
            </Grid>
            <Grid item xs={12} md={3}>
              <EditIcon
                className={classes.infoItemIcon}
                onClick={hanleChangeBiometricURL}
              />
            </Grid>

          </Grid>
        </Grid>

      </Grid>

    </AuthenticatedContainer>
  );
}
export default Info;
