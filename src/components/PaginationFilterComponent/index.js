import React from 'react';
import {
  Select, MenuItem, InputLabel
} from '@material-ui/core';
import { func, number, string } from 'prop-types';

export const paginationFilter = {
  ALL: 'All',
  15: 15,
  30: 30,
  50: 50
};

export default function PaginationFilterComponent({ inputLabel, value, onChange }) {
  return (
    <>
      <InputLabel shrink id={`pagination-${inputLabel}-label-label`}>
        {inputLabel || 'Row Per Page'}
      </InputLabel>
      <Select
        labelId={`pagination-${inputLabel}-label-label`}
        id="select-placeholder"
        value={value}
        onChange={onChange}
        displayEmpty
        style={{ width: '100%' }}
      >
        {Object.keys({ ...paginationFilter, }).map((item) => (
          <MenuItem
            key={paginationFilter[item]}
            value={paginationFilter[item]}
          >
            {paginationFilter[item]}
          </MenuItem>
        ))}
      </Select>
    </>
  );
}

PaginationFilterComponent.propTypes = {
  inputLabel: string,
  value: number,
  onChange: func
};

PaginationFilterComponent.defaultProps = {
  inputLabel: '',
  value: 1,
  onChange: () => { }
};
