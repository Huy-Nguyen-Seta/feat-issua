import React from 'react';
import { string, bool, func } from 'prop-types';
import Button from '@material-ui/core/Button';
import useStyles from './styles';
import 'react-intl-tel-input/dist/main.css';

function ButtonWrapper({
  label,
  isDisable,
  isActive,
  onClick,
  ...remains
}) {
  const classes = useStyles({ ...remains });
  return (
    <Button
      className={classes.buttonWrapper}
      disabled={isDisable}
      variant={isActive ? 'contained' : 'outlined'}
      color="primary"
      classes={{
        disabled: classes.buttonDisable,
        root: classes.textButton,
      }}
      onClick={onClick}
    >
      {label}
    </Button>
  );
}

ButtonWrapper.propTypes = {
  label: string.isRequired,
  isActive: bool.isRequired,
  isDisable: bool,
  onClick: func.isRequired
};
ButtonWrapper.defaultProps = {
  isDisable: false
};
export default ButtonWrapper;
