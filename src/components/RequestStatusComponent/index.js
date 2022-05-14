import React from 'react';
import { InputLabel, Select, MenuItem } from '@material-ui/core';
import { string, func } from 'prop-types';

import { statusLeaves } from '../../state/modules/requests/reducer';

export default function RequestStatusComponent({ inputLabel, value, onChange }) {
  return (
    <>
      <InputLabel shrink id={`status-${inputLabel}-label-label`}>
        {inputLabel || 'Status'}
      </InputLabel>
      <Select
        labelId={`status-${inputLabel}-label-label`}
        id="select-placeholder"
        value={value}
        onChange={onChange}
        displayEmpty
        style={{ width: '100%' }}
      >
        {Object.keys({ ...statusLeaves, }).map((item) => (
          <MenuItem
            key={statusLeaves[item]}
            value={statusLeaves[item]}
          >
            {statusLeaves[item]}
          </MenuItem>
        ))}
      </Select>
    </>
  );
}

RequestStatusComponent.propTypes = {
  inputLabel: string,
  value: string,
  onChange: func
};

RequestStatusComponent.defaultProps = {
  inputLabel: '',
  value: '',
  onChange: () => { }
};
