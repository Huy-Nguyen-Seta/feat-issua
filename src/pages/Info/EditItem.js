/* eslint-disable react/prop-types */
import React from 'react';
import {
  Grid,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import SaveIcon from '@material-ui/icons/Save';
import EditIcon from '@material-ui/icons/Edit';
import { styles } from './styles';

const useStyles = makeStyles((theme) => ({
  ...styles(theme)
}));

export function EditGrid({
  label, type, data, defaultValue, children, handleSetEditItem, handleSaveItem, editItem
}) {
  const classes = useStyles();

  return (
    <Grid item xs={12} md={6}>
      <Grid container classes={{ root: classes.infoItem }}>
        <Grid item xs={12} md={3}>
          {`${label}:`}
        </Grid>
        <Grid item xs={10} md={7}>
          {editItem === type
            ? children
            : <div className={classes.infoContent}>{data}</div>}
        </Grid>
        <Grid item xs={2} md={1}>
          {editItem !== type
            ? (
              <EditIcon
                classes={{ root: classes.infoItemIcon }}
                onClick={handleSetEditItem(type, defaultValue)}
              />
            ) : (
              <SaveIcon
                classes={{ root: classes.infoItemIcon }}
                onClick={handleSaveItem(type)}
              />
            )}
        </Grid>
      </Grid>
    </Grid>
  );
}

export const ReadOnlyGrid = ({ label, data }) => {
  const classes = useStyles();

  return (
    <Grid item xs={12} md={6}>
      <Grid container classes={{ root: classes.infoItem }}>
        <Grid item xs={12} md={3}>
          {`${label}:`}
        </Grid>
        <Grid item xs={12} md={9}>
          <div style={{ fontWeight: 600 }}>{data}</div>
        </Grid>
      </Grid>
    </Grid>
  );
};
