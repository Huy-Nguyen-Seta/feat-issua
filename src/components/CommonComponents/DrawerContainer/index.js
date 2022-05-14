import React from 'react';
import Drawer from '@material-ui/core/Drawer';
import {
  bool,
  string,
  element,
  func
} from 'prop-types';

export default function DrawerContainer({
  open,
  anchor,
  children,
  onClose
}) {
  return (
    <div>
      <React.Fragment key={anchor}>
        <Drawer anchor={anchor} open={open} onClose={onClose}>
          {children}
        </Drawer>
      </React.Fragment>
    </div>
  );
}

DrawerContainer.propTypes = {
  open: bool,
  anchor: string,
  children: element,
  onClose: func
};

DrawerContainer.defaultProps = {
  open: false,
  anchor: 'left',
  children: <></>,
  onClose: () => { }
};
