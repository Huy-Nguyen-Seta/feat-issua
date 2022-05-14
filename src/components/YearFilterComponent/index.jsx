import React from 'react';
import {
  Select, MenuItem, InputLabel
} from '@material-ui/core';
import { func, number, string } from 'prop-types';

const generateYearFilter = () => {
  const year = {};
  const now = new Date().getFullYear();
  for (let i = 0; i < 10; i += 1) {
    year[now - i] = now - i;
  }
  return year;
};

export const yearFilter = generateYearFilter();

export default function YearFilterComponent({ inputLabel, value, onChange }) {
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
        {Object.keys({ ...yearFilter, }).map((item) => (
          <MenuItem
            key={yearFilter[item]}
            value={yearFilter[item]}
          >
            {yearFilter[item]}
          </MenuItem>
        ))}
      </Select>
    </>
  );
}

YearFilterComponent.propTypes = {
  inputLabel: string,
  value: number,
  onChange: func
};

YearFilterComponent.defaultProps = {
  inputLabel: '',
  value: 2022,
  onChange: () => { }
};
