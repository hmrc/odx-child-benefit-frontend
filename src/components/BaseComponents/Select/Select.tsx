import React from 'react';
import PropTypes from 'prop-types';
import FormGroup, { makeErrorId, makeHintId } from '../FormGroup/FormGroup';
import FieldSet from '../FormGroup/FieldSet';

export default function Select(props) {
  const { name, onChange, value, children, errorText, hintText, fieldId } = props;

  const describedbyIds =
    `${hintText ? makeHintId(fieldId) : ''} ${errorText ? makeErrorId(fieldId) : ''}`.trim();
  const ariaDescBy = describedbyIds.length !== 0 ? { 'aria-describedby': describedbyIds } : {};

  const selectCompoment = () => {
    return (
      <select
        className='govuk-select'
        id={fieldId}
        name={name}
        onChange={onChange}
        value={value}
        {...ariaDescBy}
      >
        {children}
      </select>
    );
  };

  return <FormGroup {...props}>{selectCompoment()}</FormGroup>;
}

Select.propTypes = {
  ...FieldSet.propTypes,
  name: PropTypes.string,
  fieldId: PropTypes.string,
  children: PropTypes.node,
  onChange: PropTypes.func,
  value: PropTypes.string
};
