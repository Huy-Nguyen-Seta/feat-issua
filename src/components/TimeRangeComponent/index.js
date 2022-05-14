import React, { useState, useEffect } from 'react';
import { Select, MenuItem, InputLabel } from '@material-ui/core';
import moment from 'moment';
import { string, func } from 'prop-types';

export const orginalRange = {
  thisMontth: [moment().startOf('month'), moment().endOf('month')],
  lastMonth: [moment().subtract(1, 'months').startOf('month'), moment().subtract(1, 'months').endOf('month')],
  today: [moment(), moment()],
  thisWeek: [moment().startOf('isoWeek'), moment().endOf('isoWeek')],
  lastWeek: [moment().subtract(1, 'weeks').startOf('isoWeek'), moment().subtract(1, 'weeks').endOf('isoWeek')],
  customeRange: [moment().startOf('month'), moment().endOf('month')]
};

export const rangeLabel = {
  thisMontth: 'This Month',
  lastMonth: 'Last Month',
  today: 'Today',
  thisWeek: 'This Week',
  lastWeek: 'Last Week',
  customeRange: 'Custome Range'
};

export default function TimeRangeComponent({ value, onChange }) {
  const [valueState, setValueState] = useState(value);
  useEffect(() => {
    if (value !== valueState) { setValueState(valueState); }
  }, [value]);
  const handleChangeValue = (e) => {
    setValueState(e.target.value);
    if (onChange) onChange(e);
  };

  return (
    <>
      <InputLabel shrink id="range-label-label">Range</InputLabel>
      <Select
        labelId="range-label-label"
        id="select-placeholder"
        displayEmpty
        style={{ width: '100%' }}
        value={valueState}
        onChange={handleChangeValue}
      >
        {
          Object.keys(orginalRange).map((range) => (
            <MenuItem key={range} value={range}>{rangeLabel[range]}</MenuItem>
          ))
        }

      </Select>
    </>
  );
}

TimeRangeComponent.propTypes = {
  value: string,
  onChange: func
};

TimeRangeComponent.defaultProps = {
  value: '',
  onChange: () => { }
};
