import React, { createElement } from 'react';
import MainWrapper from '../../../BaseComponents/MainWrapper';
import createPConnectComponent from '@pega/react-sdk-components/lib/bridge/react_pconnect';
import ConditionalWrapper from '../../../helpers/formatters/ConditionalWrapper';

export default function Details({ label, context, getPConnect }) {
  // Using inherited config as a test to see if this is the root Details on Claim Summary, or embedded for correct wrapping
  const inheritedConfig = getPConnect()._inheritedConfig;

  const children = getPConnect()
    .getChildren()
    .map((configObject, index) =>
      createElement(createPConnectComponent(), {
        ...configObject,
        // eslint-disable-next-line react/no-array-index-key
        key: index.toString()
      })
    );

  for (const child of children) {
    const theChildPConn = child.props.getPConnect();
    theChildPConn.setInheritedProp('displayMode', 'LABELS_LEFT');
    theChildPConn.setInheritedProp('readOnly', true);
  }
  const contextName = PCore.getContainerUtils().getActiveContainerItemName(
    `${PCore.getConstants().APP.APP}/primary`
  );
  const containerName =
    PCore.getContainerUtils().getActiveContainerItemName(`${contextName}/workarea`) || contextName;

  return (
    // Conditionally wrap in main wrapper only if we are not in a case with and open status (i.e. we are in a finished case, viewing the claim summary)
    <ConditionalWrapper
      condition={
        !PCore.getStore().getState().data[containerName].caseInfo?.status.startsWith('Open') &&
        !Object.getOwnPropertyNames(inheritedConfig).length
      }
      wrapper={childrenForWrap => <MainWrapper>{childrenForWrap}</MainWrapper>}
      childrenToWrap={
        <>
          {label && context && (
            <h1 className='govuk-heading-l'>
              {PCore.getLocaleUtils().getLocaleValue(label, 'Assignment')}
            </h1>
          )}
          {children}
        </>
      }
    ></ConditionalWrapper>
  );
}
