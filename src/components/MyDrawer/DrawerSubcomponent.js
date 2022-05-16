/* eslint-disable react/prop-types */
import React, { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {
  Badge, Button, List, ListItem, ListItemIcon, ListItemText, Popover
} from '@material-ui/core';
import { useSelector } from 'react-redux';
import { userSelector } from '../../state/modules/user';
import { routePath, } from '../../helper/constants';
import { styles } from './styles';

const useStyles = makeStyles((theme) => ({
  popover: {
    pointerEvents: 'none',
  },
  popoverContent: {
    pointerEvents: 'auto',
  },
  ...styles(theme)
}));
function DrawerSubcomponent({
  currentPath,
  openning,
  subjectItem = {},
  subItemList = [],
  onClickDrawerItem,
  onOverFlow
}) {
  const { unapprovedRequest } = useSelector(userSelector);
  const [openSubItem, setOpenSubItem] = useState(false);
  const [hoverSubIcon, setHoverSubIcon] = useState(false);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [hoverPopver, setHoverPopver] = useState(false);
  const classes = useStyles();
  const highlighting = ({ highlightRoute = [] }) => highlightRoute.includes(currentPath);
  const handleClickOpenItem = () => {
    setOpenSubItem(!openSubItem);
  };
  const handleHoverIcon = (event) => {
    if (!openning) {
      setHoverSubIcon(true);
      console.log('hover', anchorEl);
      console.log('hover', hoverSubIcon);
      setAnchorEl(event.currentTarget);
      console.log(hoverSubIcon);
    }
  };
  const handleHoverLeaveIcon = () => {
    console.log(hoverSubIcon);
    setHoverSubIcon(false);
    console.log('Leave', anchorEl);
  };
  const handleHoverPopover = () => {
    setHoverPopver(true);
  };
  const handleHoverLeavePopover = () => {
    setHoverPopver(false);
    console.log('hover icon', hoverSubIcon);
    console.log('Leave popover');
  };
  useEffect(() => {
    onOverFlow();
    return () => {
    };
  });
  return (
    <div className={classes.listSidebar}>
      <List component="div" disablePadding>
        <ListItem
          className={classes.eachItemSideBar}
          style={{ backgroundColor: openSubItem || subItemList.filter((item) => highlighting(item) === true).length > 0 ? '#3651d4' : '' }}
          aria-owns={hoverSubIcon ? 'mouse-over-popover' : undefined}
          aria-haspopup="true"
        >
          {openning ? (
            <ListItemText
              primary={subjectItem.label}
              classes={{ primary: classes.sidbarPrimary }}
              onClick={handleClickOpenItem}
            />
          )
            : (
              <ListItemIcon key={`${subjectItem.id}_listItemIcon`} onMouseEnter={handleHoverIcon} onMouseLeave={handleHoverLeaveIcon} className={classes.darkblue} onClick={handleClickOpenItem}>
                {subjectItem.icon}
              </ListItemIcon>
            )}
          <Popover
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'left',
            }}
            anchorEl={anchorEl}
            transition
            open={hoverSubIcon || hoverPopver}
            disableRestoreFocus
            PaperProps={{ onMouseEnter: handleHoverPopover, onMouseLeave: handleHoverLeavePopover }}
            className={classes.popover}
            classes={{
              paper: classes.popoverContent,
            }}
          >
            <div className={classes.ContainerPopoverCustom}>
              {subItemList.map((item) => (
                <div className={classes.popoverCustom}>
                  <Button onClick={onClickDrawerItem(item)}>
                    <p>
                      {item.label}
                    </p>
                  </Button>
                </div>
              ))}
            </div>
          </Popover>
        </ListItem>
      </List>
      {openning
      && (openSubItem || subItemList.filter((item) => highlighting(item) === true).length > 0) && (
      <List component="div" disablePadding>
        {subItemList.map((item) => (
          <List key={`${item.id}_list`} component="div" disablePadding>
            <ListItem
              className={
                highlighting(item) ? classes.highlight : null
              }
              button
              onClick={onClickDrawerItem(item)}
              style={openning ? { paddingLeft: 40 } : null}
              key={`${item.id}_listItem`}
            >
              <ListItemIcon key={`${item.id}_listItemIcon`} className={classes.darkblue}>
                {item.icon}
              </ListItemIcon>
              <ListItemText
                classes={{ primary: classes.sidbarPrimary }}
                primary={item.label}
                key={`${item.id}_listItemText`}
              />
              {
                openning && item.routePath === routePath.REQUEST_MANAGEMENT_PATH
                && unapprovedRequest > 0 && (
                  <Badge
                    color="primary"
                    badgeContent={unapprovedRequest}
                    classes={{ badge: classes.badge }}
                  />
                )

              }
            </ListItem>
          </List>
        ))}
      </List>
      )}
    </div>
  );
}

DrawerSubcomponent.propTypes = {
};

export default DrawerSubcomponent;
