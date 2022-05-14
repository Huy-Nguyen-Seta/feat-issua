/* eslint-disable react/prop-types */
import React, { useState, useRef } from 'react';
import _ from 'lodash';
import { useSelector } from 'react-redux';

import { makeStyles } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import List from '@material-ui/core/List';
import IconButton from '@material-ui/core/IconButton';
import NavigateNext from '@material-ui/icons/NavigateNext';
import NavigateBefore from '@material-ui/icons/NavigateBefore';

import DrawerSubcomponent from './DrawerSubcomponent';

import { useDrawerState } from '../../provider/DrawerProvider';
import { drawerFeature as drawerFeatureRaw } from '../../helper/constants';
import { userSelector } from '../../state/modules/user/selector';

import { styles } from './styles';
import verisafeLogoOpen from '../../asset/images/seta.jpg';
import verisafeLogo from '../../asset/images/0.jpeg';

const useStyles = makeStyles((theme) => ({
  ...styles(theme)
}));

export default function CustomDrawer({
  onChangeRoute,
  pathName
}) {
  const { permissions } = useSelector(userSelector);
  const drawerFeature = drawerFeatureRaw.filter(
    (menuItem) => permissions.includes(menuItem.permisstion)
  );
  const ref = useRef(null);
  const testref = useRef(null);
  const classes = useStyles();
  const { open, setOpen } = useDrawerState(true);
  const [expanded, setExpanded] = useState([]);
  const [hovering, setHovering] = useState(true);
  const [isOverflow, setOverflow] = useState(false);
  const handleMouseEnterChild = () => {
    setHovering(true);
  };
  const handleMouseLeaveChild = () => {
    setHovering(false);
  };
  const handleSetOverFlow = () => {
    console.log('offsetHeight', ref.current.offsetHeight);
    if (ref.current.offsetHeight > 800) {
      setOverflow(true);
    } else {
      setOverflow(false);
      testref.current.scrollIntoView({ behavior: 'smooth' });
    }
  };
  const handleClickDrawerItem = (item) => () => {
    if (item.subItems && item.subItems.length) {
      !_.includes(expanded, item.id)
        ? setExpanded([...expanded, item.id])
        : setExpanded(expanded.filter((itemId) => itemId !== item.id));
    } else {
      const route = item.routePath;
      onChangeRoute && onChangeRoute(route);
    }
  };
  const handleClickOpenLeftBar = () => {
    setOpen(!open);
  };
  return (
    <div className={classes.root}>
      <Drawer
        onMouseEnter={handleMouseEnterChild}
        onMouseLeave={handleMouseLeaveChild}
        variant="permanent"
        classes={{
          paper: `${classes.drawerPaper} ${!(open) && classes.drawerPaperClose} ${!(isOverflow) && classes.overFlow}`
        }}
        open={open}
      >
        <div className={classes.toolbarIcon} ref={testref}>
          {hovering && (
          <IconButton
            style={{ left: open ? 260 : 50, marginBottom: 30 }}
            edge="start"
            color="inherit"
            aria-label="open drawer"
            onClick={handleClickOpenLeftBar}
            className={classes.HoverButton}
          >
            { open ? (<NavigateBefore />) : (<NavigateNext />)}
          </IconButton>
          )}
          <div className={classes.logoHeader}>
            {open ? (
              <img
                src={verisafeLogoOpen}
                alt="VNCSS"
                className={classes.logo}
              />
            )
              : (
                <img
                  src={verisafeLogo}
                  alt="VNCSS"
                  className={classes.logo}
                />
              )}

          </div>
        </div>
        <div className={classes.listSidebar}>
          <List component="div" disablePadding ref={ref}>
            {drawerFeature.map((item) => (
              <DrawerSubcomponent
                currentPath={pathName}
                openning={open}
                subjectItem={item}
                subItemList={item.childs || []}
                onClickDrawerItem={handleClickDrawerItem}
                onClickOpenSideBar={handleClickOpenLeftBar}
                onOverFlow={handleSetOverFlow}
                key={`${item.id}_parentDrawer`}
              />
            ))}
          </List>
        </div>
      </Drawer>
    </div>
  );
}
