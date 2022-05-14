/* eslint-disable react/prop-types */
import React, { useEffect, useState } from 'react';
import {
  Select, MenuItem, FormHelperText, InputLabel, FormControl
} from '@material-ui/core';
import { useDispatch } from 'react-redux';
import { func, bool, string } from 'prop-types';
import { requestGetListRole } from '../../state/modules/user/actions';

export function RoleListComponent({
  onChange, value, labelInValue, label, inputLabel,
  required,
  helperText,
  error
}) {
  const dispatch = useDispatch();
  const [dataRoles, setdataRoles] = useState([]);
  const [valueState, setValueState] = useState('');
  useEffect(() => {
    dispatch(requestGetListRole({
      filter: {},
      callback: (res) => {
        if (res && res.data && Array.isArray(res.data)) {
          setdataRoles(res.data);
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
              label: dataRoles.find((role) => role.id === changeValue.target.value)
                && dataRoles.find((role) => role.id === changeValue.target.value)[label || 'name']
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
      <InputLabel shrink id={`role-${inputLabel}-label-label`}>{inputLabel || 'Grant'}</InputLabel>
      <Select
        labelId={`role-${inputLabel}-label-label`}
        id="select-placeholder"
        value={valueState}
        onChange={onChangeState}
        style={{ width: '100%' }}
        required={required}
        helperText={helperText}
        error={error}
      >
        {(dataRoles || []).map((item) => (
          <MenuItem value={item.id}>
            <span style={{ textTransform: 'capitalize' }}>
              {item[label] || item.name}
            </span>
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

RoleListComponent.propTypes = {
  onChange: func,
  labelInValue: bool,
  label: string
};

RoleListComponent.defaultProps = {
  onChange: () => { },
  labelInValue: false,
  label: ''
};
