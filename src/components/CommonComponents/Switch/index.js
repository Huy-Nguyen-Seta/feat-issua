import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Switch from '@material-ui/core/Switch';
import { bool, func, number } from 'prop-types';

const useStyles = makeStyles((theme) => ({
  root: ({ width, height }) => ({
    width,
    height,
    padding: 0,
    colorSecondary: 'FFF000'
  }),
  switchBase: {
    padding: 1,
    '&$checked': {
      transform: 'translateX(16px)',
      color: theme.palette.common.white,
      '& + $track': {
        backgroundColor: '#52d869',
        opacity: 1,
        border: 'none',
      },
    },
    '&$focusVisible $thumb': {
      color: '#52d869',
      border: '6px solid #fff',
    },
  },
  thumb: ({ height }) => ({
    width: height - 2,
    height: height - 2,
  }),
  track: ({ height }) => ({
    borderRadius: height / 2,
    border: `0px solid ${theme.palette.grey[400]}`,
    backgroundColor: '#E9E9E9',
    opacity: 1,
    transition: theme.transitions.create(['background-color', 'border']),
  }),
  checked: {},
  focusVisible: {},
}));
function IOSSwitch(props) {
  const classes = useStyles({ ...props });
  return (
    <Switch
      focusVisibleClassName={classes.focusVisible}
      disableRipple
      classes={{
        root: classes.root,
        switchBase: classes.switchBase,
        thumb: classes.thumb,
        track: classes.track,
        checked: classes.checked,
      }}
      {...props}
    />
  );
}

export default function CustomizedSwitches({
  checked,
  onChange,
  width,
  height
}) {
  return (
    <IOSSwitch
      checked={checked}
      onClick={onChange}
      value="checkedB"
      width={width}
      height={height}
    />
  );
}

CustomizedSwitches.propTypes = {
  checked: bool.isRequired,
  onChange: func.isRequired,
  width: number,
  height: number
};

CustomizedSwitches.defaultProps = {
  width: 42,
  height: 26
};
