/* eslint-disable no-unused-vars */
import React from 'react';
import Paper from '@material-ui/core/Paper';
import { func, number } from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import { useHistory } from 'react-router-dom';
import { tabLabel } from '../../../helper/constants';
import images from '../../../asset/images';

const useStyles = makeStyles({
  tabContainer: {
    flexGrow: 1,
    width: '100%',
    position: 'absolute',
    bottom: 0,
    height: 62,
    background: '#F9F9F9',
    borderTop: '1px solid #C8C8C8',
    boxShadow: 'none'
  },
  gridContainer: {
    height: '100%'
  },
  tab: {
    textTransform: 'none',
    color: 'rgb(153,153,153)',
  },
  label: {
    fontFamily: '-apple-system, SF Pro Display, sans-serif;',
    fontStyle: 'normal',
    fontWeight: '600',
    fontSize: '10px',
    lineHeight: '18px',
    letterSpacing: '0.522px',
    color: '#999999'
  },
  selected: {
    color: '#007AFF'
  },
  gridItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabItem: {
    textAlign: 'center'
  },

});

export default function IconLabelTabs({
  onChangeTab,
  tabValue
}) {
  const classes = useStyles();
  const [value, setValue] = React.useState(false);
  const history = useHistory();
  const handleChange = (newValue) => () => {
    setValue(newValue);
    const { route } = tabLabel[newValue];
    history.push(route);
    if (value !== newValue) {
      setValue(newValue);
      onChangeTab && onChangeTab({ value: newValue, route });
    }
  };

  React.useEffect(() => {
    if (tabValue !== undefined) {
      setValue(tabValue);
    }
  }, [tabValue]);

  return (
    <Paper square className={classes.tabContainer}>
      <Grid className={classes.gridContainer} container>
        {tabLabel.map(({
          id,
          label,
          icon,
          selected
        }, index) => (
          <Grid className={classes.gridItem} key={id} item xs onClick={handleChange(index)}>
            <div className={classes.tabItem}>
              <img src={value === index ? images[selected] : images[icon]} alt="tab-icon" />
              <div className={`${classes.label} ${value === index ? classes.selected : ''} `}>{label}</div>
            </div>
          </Grid>
        ))}
      </Grid>
    </Paper>
  );
}

IconLabelTabs.propTypes = {
  onChangeTab: func,
  tabValue: number.isRequired
};

IconLabelTabs.defaultProps = {
  onChangeTab: () => { }
};
