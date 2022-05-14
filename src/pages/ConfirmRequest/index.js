/* eslint-disable react/forbid-prop-types */
/* eslint-disable react/require-default-props */
import React from 'react';
import {
  Grid,
  Paper,
  Tabs,
  Tab,
  // Box,
  // Typography
} from '@material-ui/core';
import PropTypes from 'prop-types';
import AuthenticatedContainer from '../../containers/AuthenticatedContainer';
import { HeaderWrapperComponent } from '../../components/HeaderWrapperComponent';
import * as confirmComponent from '../../components/ConfirmRequestComponent/ConfirmJustificationComponent';
import ConfirmLeaveRequestComponent from '../../components/ConfirmRequestComponent/ConfirmLeaveRequestComponent';

function TabPanel(props) {
  const {
    children, value, index, ...other
  } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`full-width-tabpanel-${index}`}
      aria-labelledby={`full-width-tab-${index}`}
      {...other}
    >
      {value === index && children}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.any.isRequired,
  value: PropTypes.any.isRequired,
};

function a11yProps(index) {
  return {
    id: `full-width-tab-${index}`,
    'aria-controls': `full-width-tabpanel-${index}`,
  };
}

function MyRequest() {
  const [valueTabs, setValueTabs] = React.useState(0);

  const handleChangeTabs = (event, newValue) => {
    setValueTabs(newValue);
  };

  const { ConfirmJustificationComponent } = confirmComponent;

  return (
    <AuthenticatedContainer>
      <Grid container>
        <HeaderWrapperComponent
          title="Approve Request "
        />
      </Grid>
      <Paper square>
        <Tabs
          value={valueTabs}
          indicatorColor="primary"
          textColor="primary"
          onChange={handleChangeTabs}
          aria-label="disabled tabs example"
          variant="fullWidth"
        >
          <Tab label="Late/Early and Forget" />
          <Tab label="Leave" />
        </Tabs>
        <TabPanel value={valueTabs} index={0} {...a11yProps(0)}>
          <ConfirmJustificationComponent fetchFlag={valueTabs === 0} />
        </TabPanel>
        <TabPanel value={valueTabs} index={1} {...a11yProps(1)}>
          <ConfirmLeaveRequestComponent fetchFlag={valueTabs === 1} />
        </TabPanel>
      </Paper>
    </AuthenticatedContainer>
  );
}

export default MyRequest;
