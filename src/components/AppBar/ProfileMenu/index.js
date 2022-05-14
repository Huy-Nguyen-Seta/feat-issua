import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';

import IconButton from '@material-ui/core/IconButton';
import Avatar from '@material-ui/core/Avatar';
import Tooltip from '@material-ui/core/Tooltip';
import { string, } from 'prop-types';
import Popover from '@material-ui/core/Popover';
import InnerProfileMenu from './InnerProfileMenu';
import { styles } from './styles';

const useStyles = makeStyles({
  ...styles
});

export default function ProfileMenu({ tooltipTitle, }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const classes = useStyles();
  const openProfileMenu = (e) => {
    setAnchorEl(e.currentTarget);
  };

  const handleCloseProfileMenu = () => {
    setAnchorEl(null);
  };

  return (
    <div>
      <Tooltip title={tooltipTitle || ''} disableFocusListener>
        <IconButton
          data-vncss-element="profile-menu-button"
          onClick={openProfileMenu}
        >
          <Avatar
            className={classes.avatarHeader}
            style={{ height: 30, width: 30 }}
          />
        </IconButton>
      </Tooltip>
      <Popover
        disableRestoreFocus
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center'
        }}
        onClose={handleCloseProfileMenu}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center'
        }}
        className={classes.popover}
      >
        <InnerProfileMenu />
      </Popover>
    </div>
  );
}

ProfileMenu.propTypes = {
  tooltipTitle: string,

};

ProfileMenu.defaultProps = {
  tooltipTitle: 'Profile'
};
