import React, { useState, } from 'react';
import FilterListIcon from '@material-ui/icons/FilterList';
import { makeStyles } from '@material-ui/core/styles';
import { element } from 'prop-types';
import { Popover } from '@material-ui/core';

import { styles } from './styles';

const useStyles = makeStyles({
  ...styles
});

export function FilterComponent({ listFilterRender, formFilter }) {
  const classes = useStyles();
  const [anchorElFilterPopover, setAnchorElFilterPopover] = useState(null);

  const handleOpenFilterPopover = (event) => {
    setAnchorElFilterPopover(event.currentTarget);
  };

  const handleCloseFilterPopover = () => {
    setAnchorElFilterPopover(null);
  };

  return (
    <div className={classes.helperWrapper} style={{ marginTop: 30 }}>
      <div className={classes.listFilter}>
        {listFilterRender}
      </div>
      <div className={classes.filterContainer}>
        <FilterListIcon style={{ color: '#000', cursor: 'pointer' }} onClick={handleOpenFilterPopover} />
        <Popover
          open={Boolean(anchorElFilterPopover)}
          anchorEl={anchorElFilterPopover}
          onClose={handleCloseFilterPopover}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'center',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'center',
          }}
          PaperProps={{
            style: {
              height: 'min-content',
              overflow: 'hidden'

            }
          }}
        >
          <div className={classes.filterArea}>
            {formFilter}
          </div>
          <div className={classes.buttonArea}> </div>
        </Popover>
      </div>
    </div>
  );
}

FilterComponent.propTypes = {
  listFilterRender: element,
  formFilter: element,
};

FilterComponent.defaultProps = {
  listFilterRender: <div />,
  formFilter: <div />,
};
