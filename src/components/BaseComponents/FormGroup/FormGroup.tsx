import React, { useContext, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import ConditionalWrapper from '../../helpers/formatters/ConditionalWrapper';
import HintTextComponent from '../../helpers/formatters/ParsedHtml';
import { DefaultFormContext, ErrorMsgContext } from '../../helpers/HMRCAppContext';
import { checkErrorMsgs, removeRedundantString } from '../../helpers/utils';
import InstructionTextComponent from '../../override-sdk/template/DefaultForm/InstructionTextComponent';
import { useTranslation } from 'react-i18next';

function makeHintId(identifier) {
  return `${identifier}-hint`;
}
function makeErrorId(identifier) {
  return `${identifier}-error`;
}
function makeItemId(index, identifier) {
  return `${identifier}${index > 0 ? `-${index}` : ''}`;
}

export default function FormGroup({
  labelIsHeading = false,
  label,
  errorText,
  hintText,
  name,
  fieldId,
  extraLabelClasses = '',
  children,
  testProps = {},
  parentManagedError = false
}) {
  const { instructionText } = useContext(DefaultFormContext);
  const { errorMsgs } = useContext(ErrorMsgContext);
  const [errMessage, setErrorMessage] = useState(errorText);

  const { t } = useTranslation();

  useEffect(() => {
    if (parentManagedError) return;
    const found = checkErrorMsgs(errorMsgs, fieldId, name);

    if (found && !errorText) setErrorMessage(found?.message.message);

    if (!found || errorText) {
      setErrorMessage(errorText);
    }
  }, [errorText, errorMsgs]);

  const formGroupDivClasses =
    `govuk-form-group ${errMessage ? 'govuk-form-group--error' : ''}`.trim();
  const labelClasses =
    `govuk-label ${labelIsHeading ? 'govuk-label--l' : extraLabelClasses}`.trim();

  return (
    <div className={formGroupDivClasses} {...testProps}>
      <ConditionalWrapper
        condition={labelIsHeading}
        wrapper={child => {
          return <h1 className='govuk-label-wrapper govuk-heading-l'>{child}</h1>;
        }}
        childrenToWrap={
          <label className={labelClasses} htmlFor={fieldId}>
            {label}
          </label>
        }
      />
      {instructionText && labelIsHeading && (
        <InstructionTextComponent instructionText={instructionText} />
      )}
      {hintText && (
        <div id={makeHintId(fieldId)} className='govuk-hint'>
          <HintTextComponent htmlString={hintText} />
        </div>
      )}
      {errMessage && (
        <p id={makeErrorId(fieldId)} className='govuk-error-message'>
          <span className='govuk-visually-hidden'>{t('ERROR')}:</span>
          {removeRedundantString(errMessage)}
        </p>
      )}
      {children}
    </div>
  );
}

FormGroup.propTypes = {
  label: PropTypes.string,
  labelIsHeading: PropTypes.bool,
  hintText: PropTypes.string,
  errorText: PropTypes.string,
  children: PropTypes.node,
  extraLabelClasses: PropTypes.string,
  fieldId: PropTypes.string,
  parentManagedError: PropTypes.bool
};

export { makeErrorId, makeHintId, makeItemId };
