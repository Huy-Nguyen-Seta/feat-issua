/* eslint-disable react/prop-types */
import React, { useEffect, useState } from 'react';
import {
  Select, MenuItem, FormHelperText, InputLabel
} from '@material-ui/core';
import { useDispatch } from 'react-redux';
import { func, bool, string } from 'prop-types';
import { requestGetRequestType } from '../../state/modules/requests/actions';

export default function RequestTypeComponent({
  onChange, value, labelInValue, label, inputLabel,
  required,
  helperText,
  error
}) {
  const dispatch = useDispatch();
  const [dataRequestType, setDataRequestType] = useState([]);
  const [valueState, setValueState] = useState('');
  useEffect(() => {
    dispatch(requestGetRequestType({
      callback: (res) => {
        if (res && res.data && Array.isArray(res.data)) {
          setDataRequestType(res.data);
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
              label: dataRequestType.find((role) => role.id === changeValue.target.value)
                && dataRequestType.find((role) => role.id === changeValue.target.value)[label || 'name']
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
    <>
      <InputLabel shrink id={`request-type-${inputLabel}-label-label`}>
        {inputLabel || 'Request Type'}
      </InputLabel>
      <Select
        labelId={`request-type-${inputLabel}-label-label`}
        value={valueState}
        onChange={onChangeState}
        style={{ width: '100%' }}
        required={required}
        helperText={helperText}
        error={error}
      >
        {(dataRequestType || []).map((item) => (
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
    </>
  );
}

RequestTypeComponent.propTypes = {
  onChange: func,
  labelInValue: bool,
  label: string
};

RequestTypeComponent.defaultProps = {
  onChange: () => { },
  labelInValue: false,
  label: ''
};
