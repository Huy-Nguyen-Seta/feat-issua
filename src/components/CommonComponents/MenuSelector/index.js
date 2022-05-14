import React from 'react';
import {
  arrayOf,
  string,
  func
} from 'prop-types';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import useStyles from './styles';

function MenuSelector({
  onClickItem,
  label,
  data = [],
  fieldName,
  selectedValue,
}) {
  const classes = useStyles();
  function handleToggle(event) {
    const id = event.target.value;
    onClickItem && onClickItem(id);
  }
  function getLabel(item) {
    return `${item[fieldName]}`;
  }
  return (
    <form className={classes.form} noValidate>
      <FormControl className={classes.formControl}>
        <InputLabel htmlFor={label} classes={{ root: classes.inputLabel }}>{label}</InputLabel>
        <Select
          autoFocus={false}
          value={selectedValue}
          onChange={handleToggle}
          classes={{ root: classes.selectTitle }}
        >
          {data.map((item) => (
            <MenuItem value={item.id} classes={{ root: classes.selectTitle }}>
              {getLabel(item)}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </form>
  );
}

MenuSelector.propTypes = {
  onClickItem: func.isRequired,
  data: arrayOf(Object).isRequired,
  label: string.isRequired,
  fieldName: string.isRequired,
  selectedValue: string.isRequired
};
export default MenuSelector;
