import React from 'react';
import {
  string,
  func,
  oneOfType,
  instanceOf,
  shape
} from 'prop-types';
import OutlinedInput from '@material-ui/core/OutlinedInput';
import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
import useStyles from './styles';

function TextField({
  placeholder,
  onChange,
  onKeyDown,
  type,
  value,
  inputRef,
  error
}) {
  const classes = useStyles({ type });

  const [showPassword, setShowPassword] = React.useState(false);

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <FormControl
      error={error !== ''}
      className={`${classes.margin} ${classes.textField}`}
      variant="outlined"
      classes={{
        root: classes.viewContainer
      }}
    >
      <OutlinedInput
        type={showPassword ? 'text' : type}
        inputRef={inputRef}
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        labelWidth={70}
        classes={{
          notchedOutline: classes.notchedOutline,
          root: classes.rootbg,
          input: classes.input
        }}
        className={classes.outlinedInput}
      />
      {type === 'password' && (
        showPassword
          ? <Visibility classes={{ root: classes.eyeIcon }} onClick={handleTogglePassword} />
          : <VisibilityOff classes={{ root: classes.eyeIcon }} onClick={handleTogglePassword} />
      )}
      {error && (
        <FormHelperText id="filled-weight-helper-text">
          {error}
        </FormHelperText>
      )}
    </FormControl>
  );
}

TextField.propTypes = {
  placeholder: string,
  onChange: func.isRequired,
  onKeyDown: func,
  type: string,
  value: string,
  inputRef: oneOfType([
    func,
    shape({ current: instanceOf(Element) })
  ]),
  error: string
};

TextField.defaultProps = {
  onKeyDown: () => {},
  placeholder: '',
  type: 'text',
  value: '',
  inputRef: () => {},
  error: ''
};

export default TextField;
