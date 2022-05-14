import React from 'react';
import { InputLabel, Select, MenuItem } from '@material-ui/core';
import { string, func } from 'prop-types';

export const userStatusFilter = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',

};

export default function UserStatusFilterComponent({ inputLabel, value, onChange }) {
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
        {Object.keys({ ...userStatusFilter, }).map((item) => (
          <MenuItem
            key={userStatusFilter[item]}
            value={userStatusFilter[item]}
          >
            {userStatusFilter[item]}
          </MenuItem>
        ))}
      </Select>
    </>
  );
}

UserStatusFilterComponent.propTypes = {
  inputLabel: string,
  value: string,
  onChange: func
};

UserStatusFilterComponent.defaultProps = {
  inputLabel: '',
  value: '',
  onChange: () => { }
};
