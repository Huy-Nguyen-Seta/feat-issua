/* eslint-disable react/prop-types */
import React, { useEffect, useState } from 'react';
import {
  Select, FormHelperText, MenuItem, InputLabel, FormControl
} from '@material-ui/core';
import { useDispatch } from 'react-redux';
import { func, bool, string } from 'prop-types';
import { requestGetListManager } from '../../state/modules/user/actions';

export default function ManagerListComponent({
  onChange, value, labelInValue, label, inputLabel,
  required, error
}) {
  const dispatch = useDispatch();
  const [dataManagers, setdataManagers] = useState([]);
  const [valueState, setValueState] = useState('');
  useEffect(() => {
    dispatch(requestGetListManager({
      filter: {},
      callback: (res) => {
        if (res && res.data && Array.isArray(res.data)) {
          setdataManagers(res.data);
        }
      }
    }));
  }, []);

  useEffect(() => {
    if (labelInValue && value && value.value !== valueState) {
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
          target: {
            value: {
              value: changeValue.target.value,
              label: dataManagers.find((reason) => reason.id === changeValue.target.value)
                && dataManagers.find((reason) => reason.id === changeValue.target.value)[label || 'name']
            }
          }
        });
      } else {
        onChange({
          target: {
            value: changeValue.target.value
          }
        });
      }
    }
  };
  return (
    <FormControl style={{ width: '100%' }} error={Boolean(error)}>
      <InputLabel shrink id={`manager-${inputLabel}-label-label`}>
        {inputLabel || 'Manager'}
      </InputLabel>
      <Select
        labelId={`manager-${inputLabel}-label-label`}
        value={valueState}
        onChange={onChangeState}
        style={{ width: '100%' }}
        required={required}
      >
        {(dataManagers || []).map((item) => (
          <MenuItem value={item.id} key={item.id}>
            {item[label] || item.name}
          </MenuItem>
        ))}
      </Select>
      {error && (
        <FormHelperText id="filled-weight-helper-text">
          <span style={{ color: 'red' }}>
            {error}
          </span>
        </FormHelperText>
      )}
    </FormControl>
  );
}

ManagerListComponent.propTypes = {
  onChange: func,
  labelInValue: bool,
  label: string
};

ManagerListComponent.defaultProps = {
  onChange: () => { },
  labelInValue: false,
  label: ''
};
