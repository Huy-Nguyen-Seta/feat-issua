/* eslint-disable react/prop-types */
import React, { useEffect, useState } from 'react';
import {
  Select, MenuItem, FormHelperText, InputLabel
} from '@material-ui/core';
import { useDispatch } from 'react-redux';
import { func, bool, string } from 'prop-types';
import * as reasonActions from '../../state/modules/reason/actions';

const { requestGetRequestReasonAll } = reasonActions;

export function LeaveReasonSelect({
  onChange, value, labelInValue, label, error, inputLabel
}) {
  const dispatch = useDispatch();
  const [dataReasons, setDataReasons] = useState([]);
  const [valueState, setValueState] = useState('');
  useEffect(() => {
    dispatch(requestGetRequestReasonAll({
      filter: { requestTypeId: '6c2cc1c7-9555-49b6-89a7-debd4c10d46f' },
      callback: (res) => {
        if (res && res.data && Array.isArray(res.data)) {
          setDataReasons(res.data);
        }
      }
    }));
  }, []);
  useEffect(() => {
    if (labelInValue && value.value !== valueState) {
      setValueState(value.value);
    } else if (!labelInValue && value !== valueState) {
      setValueState(value);
    }
  }, [value]);

  const onChangeState = (changeValue) => {
    setValueState(changeValue.target.value);
    if (onChange) {
      if (labelInValue) {
        onChange({
          value: changeValue.target.value,
          label: dataReasons.find((reason) => reason.id === changeValue.target.value)
            && dataReasons.find((reason) => reason.id === changeValue.target.value)[label]
        });
      } else {
        onChange(changeValue.target.value);
      }
    }
  };
  return (
    <>
      <InputLabel shrink id={`reason-${inputLabel}-label-label`}>
        {inputLabel || 'Request Type'}
      </InputLabel>
      <Select
        labelId={`reason-${inputLabel}-label-label`}
        value={valueState}
        onChange={onChangeState}
        style={{ width: '100%' }}
      >
        {(dataReasons || []).map((item) => (
          <MenuItem value={item.id}>{item[label] || item.name}</MenuItem>
        ))}
      </Select>
      {error && (
        <FormHelperText id="filled-weight-helper-text">
          <span style={{ color: 'red' }}>
            {error}
          </span>
        </FormHelperText>
      )}
    </>
  );
}

LeaveReasonSelect.propTypes = {
  onChange: func,
  labelInValue: bool,
  label: string
};

LeaveReasonSelect.defaultProps = {
  onChange: () => { },
  labelInValue: false,
  label: ''
};
