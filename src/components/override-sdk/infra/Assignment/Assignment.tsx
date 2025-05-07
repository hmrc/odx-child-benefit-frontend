import React, { useState, useEffect, useContext } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import {
  getServiceShutteredStatus,
  scrollToTop,
  shouldRemoveFormTagForReadOnly,
  removeRedundantString,
  isCHBJourney,
  isEduStartJourney
} from '../../../helpers/utils';
import ErrorSummary from '../../../BaseComponents/ErrorSummary/ErrorSummary';
import {
  DateErrorFormatter,
  DateErrorTargetFields
} from '../../../helpers/formatters/DateErrorFormatter';
import Button from '../../../BaseComponents/Button/Button';
import setPageTitle from '../../../helpers/setPageTitleHelpers';
import { SdkComponentMap } from '@pega/react-sdk-components/lib/bridge/helpers/sdk_component_map';
import useIsOnlyField from '../../../helpers/hooks/QuestionDisplayHooks';
import MainWrapper from '../../../BaseComponents/MainWrapper';
import ShutterServicePage from '../../../AppComponents/ShutterService/ShutterServicePage';
import { ErrorMsgContext } from '../../../helpers/HMRCAppContext';
import useServiceShuttered from '../../../helpers/hooks/useServiceShuttered';
import StoreContext from '@pega/react-sdk-components/lib/bridge/Context/StoreContext';
import AppContextEducation from '../../../../samples/EducationStart/reuseables/AppContextEducation'; // TODO: Once this code exposed to common folder, we will remove this import from EducationStart
import AppContext from '../../../../samples/HighIncomeCase/reuseables/AppContext';
import dayjs from 'dayjs';

export interface ErrorMessageDetails {
  message: string;
  fieldId: string;
  pageRef: string;
  clearMessageProperty: string;
}

interface OrderedErrorMessage {
  message: ErrorMessageDetails;
  displayOrder: string;
}

declare const PCore: any;
export default function Assignment(props) {
  const { getPConnect, children, itemKey, isCreateStage, containerItemName } = props;
  const thePConn = getPConnect();
  const [arSecondaryButtons, setArSecondaryButtons] = useState([]);
  const [actionButtons, setActionButtons] = useState<any>({});
  const { t } = useTranslation();
  const serviceShuttered = useServiceShuttered();
  const { setAssignmentPConnect }: any = useContext(StoreContext);
  const { appBacklinkProps } = useContext(AppContext);
  const { appBacklinkProps: appBacklinkPropsEducation, serviceParam } =
    useContext(AppContextEducation); // TODO: Once this code exposed to common folder, we will refer AppContext from reuseable components

  const AssignmentCard = SdkComponentMap.getLocalComponentMap().AssignmentCard
    ? SdkComponentMap.getLocalComponentMap().AssignmentCard
    : SdkComponentMap.getPegaProvidedComponentMap().AssignmentCard;

  const actionsAPI = thePConn.getActionsApi();
  const localizedVal = PCore.getLocaleUtils().getLocaleValue;
  const localeCategory = 'Assignment';
  const localeReference =
    `${getPConnect().getCaseInfo().getClassName()}!CASE!${getPConnect().getCaseInfo().getName()}`.toUpperCase();

  // store off bound functions to above pointers
  const finishAssignment = actionsAPI.finishAssignment.bind(actionsAPI);
  const navigateToStep = actionsAPI.navigateToStep.bind(actionsAPI);
  const cancelAssignment = actionsAPI.cancelAssignment.bind(actionsAPI);
  const saveAssignment = actionsAPI.saveAssignment?.bind(actionsAPI);
  const cancelCreateStageAssignment = actionsAPI.cancelCreateStageAssignment.bind(actionsAPI);

  const isOnlyFieldDetails = useIsOnlyField(null, children); // .isOnlyField;
  const [errorMessages, setErrorMessages] = useState<OrderedErrorMessage[]>([]);
  const [serviceShutteredStatus, setServiceShutteredStatus] = useState(serviceShuttered);

  const [hasAutoCompleteError, setHasAutoCompleteError] = useState('');

  const [isChildSummaryScreen, setIsChildSummaryScreen] = useState(false);
  const context = getPConnect().getContextName();

  interface ResponseType {
    CurrentStepId: string;
  }

  // Register/Deregister this Pconnect Object to AssignmentPConn context value, for use in Portal scope
  useEffect(() => {
    setAssignmentPConnect(getPConnect());
    return () => setAssignmentPConnect(null);
  }, [containerItemName]);

  useEffect(() => {
    setServiceShutteredStatus(serviceShuttered);
  }, [serviceShuttered]);

  useEffect(() => {
    if (sessionStorage.getItem('isChildSummaryScreen') === 'true') {
      setTimeout(() => {
        setIsChildSummaryScreen(true);
      }, 100);
    } else {
      setIsChildSummaryScreen(false);
    }
  });

  const callLocalActionSilently = async () => {
    const { invokeRestApi, invokeCustomRestApi, getCancelTokenSource, isRequestCanceled } =
      PCore.getRestClient();
    const cancelTokenSource = getCancelTokenSource();
    const lang = sessionStorage.getItem('rsdk_locale')?.substring(0, 2) || 'en';
    const LOCAL_ACTION_NAME = lang === 'en' ? 'SwitchLanguageToEnglish' : 'SwitchLanguageToWelsh';

    const caseID = thePConn.getCaseInfo()?.getKey();
    const actionContext = thePConn.getContextName();

    try {
      const response = await invokeRestApi('caseWideActions', {
        queryPayload: {
          caseID,
          actionID: LOCAL_ACTION_NAME
        },
        // passing cancel token so that we can cancel the request using cancelTokenSource
        cancelTokenSource: cancelTokenSource.token
      });
      // get etag
      let updatedEtag = response.headers.etag;

      const response2 = await invokeCustomRestApi(
        `/api/application/v2/cases/${caseID}/actions/${LOCAL_ACTION_NAME}?excludeAdditionalActions=true&viewType=form`,
        {
          method: 'PATCH',
          headers: {
            'if-match': updatedEtag
          }
        },
        actionContext
      );
      // get etag
      updatedEtag = response2.headers.etag;

      // update the etag in the case context
      PCore.getContainerUtils().updateCaseContextEtag(actionContext, updatedEtag);
    } catch (error) {
      // handle error
      if (isRequestCanceled(error)) {
        cancelTokenSource.cancel();
      }
    }
  };

  async function refreshView() {
    // this will refresh the case view and load all required translations
    try {
      await thePConn
        .getActionsApi()
        .refreshCaseView(thePConn.getCaseInfo()?.getKey(), '', thePConn.getPageReference(), {
          autoDetectRefresh: true
        });

      await callLocalActionSilently();

      // emit this event to reload the react component forcefully
      PCore.getPubSubUtils().publish('forceRefreshRootComponent');
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error in refreshView: ', error);
    }
  }

  useEffect(() => {
    PCore.getPubSubUtils().subscribe(
      'languageToggleTriggered',
      refreshView,
      'languageToggleTriggered'
    );

    PCore.getPubSubUtils().subscribe(
      'callLocalActionSilently',
      callLocalActionSilently,
      'callLocalActionSilently'
    );

    return () => {
      PCore.getPubSubUtils().unsubscribe('languageToggleTriggered', 'languageToggleTriggered');
      PCore.getPubSubUtils().unsubscribe('callLocalActionSilently', 'callLocalActionSilently');
    };
  }, [getPConnect]);

  useEffect(() => {
    const updateErrorTimeOut = setTimeout(() => {
      setPageTitle(errorMessages.length > 0);
    }, 500);
    return () => {
      clearTimeout(updateErrorTimeOut);
    };
  }, [errorMessages]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      // Perform actions before the component unloads
      sessionStorage.setItem('isAutocompleteRendered', 'false');
      sessionStorage.setItem('currentURL', window.location.pathname);

      const assignmentID = thePConn.getCaseInfo().getAssignmentID();
      sessionStorage.setItem('assignmentID', assignmentID);

      PCore.getContainerUtils().closeContainerItem(
        PCore.getContainerUtils().getActiveContainerItemContext('app/primary'),
        { skipDirtyCheck: true }
      );

      PCore.getPubSubUtils().unsubscribe('autoCompleteFieldPresent', errorMessage => {
        setHasAutoCompleteError(errorMessage);
      });
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  let containerName;

  const caseInfo = thePConn.getDataObject().caseInfo;

  if (caseInfo?.assignments?.length > 0) {
    containerName = caseInfo.assignments[0].name;
  }

  useEffect(() => {
    if (children && children.length > 0) {
      const oWorkItem = children[0].props.getPConnect();
      const oWorkData = oWorkItem.getDataObject();
      const oData = thePConn.getDataObject();

      if (oWorkData?.caseInfo && oWorkData.caseInfo.assignments !== null) {
        const oCaseInfo = oData.caseInfo;

        if (oCaseInfo && oCaseInfo.actionButtons) {
          setActionButtons(oCaseInfo.actionButtons);
        }
      }
    }
  }, [children]);

  function checkErrorMessages() {
    const errorStateProps = [];
    const formFields = PCore.getContextTreeManager().getFieldsList(context);

    for (const [, value] of formFields) {
      const {
        propertyName,
        pageReference,
        componentName: type,
        label,
        index: displayOrder
      } = value.props;

      const errorMessagesList = PCore.getMessageManager().getMessages({
        property: propertyName,
        pageReference,
        context,
        type: 'error'
      });

      let validateMessage = '';
      if (errorMessagesList.length > 0) {
        validateMessage = errorMessagesList
          .map(error => localizedVal(removeRedundantString(error.message), 'Messages'))
          .join('. ');
      }

      // eslint-disable-next-line no-continue
      if (!validateMessage) continue;

      const formattedPropertyName = propertyName.includes('.')
        ? propertyName.split('.').pop()
        : null;
      let fieldId = formattedPropertyName;

      if (type === 'Date') {
        const DateErrorTargetFieldId = DateErrorTargetFields(validateMessage);
        fieldId = `${formattedPropertyName}-day`;
        if (DateErrorTargetFieldId.includes('month')) {
          fieldId = `${formattedPropertyName}-month`;
        } else if (DateErrorTargetFieldId.includes('year')) {
          fieldId = `${formattedPropertyName}-year`;
        }
        validateMessage = DateErrorFormatter(validateMessage, label);
      } else if (type === 'Checkbox') {
        const formattedPageReference = pageReference.split('.').pop();
        fieldId = `${formattedPageReference}-${fieldId}`;
      }

      errorStateProps.push({
        message: {
          message: localizedVal(validateMessage),
          pageReference,
          fieldId,
          propertyName
        },
        displayOrder
      });
    }
    setErrorMessages([...errorStateProps]);
  }

  function clearErrors() {
    errorMessages.forEach(error =>
      PCore.getMessageManager().clearMessages({
        property: error.message.clearMessageProperty,
        pageReference: error.message.pageRef,
        category: 'Property',
        context,
        type: 'error'
      })
    );
  }

  // When screen has autocomplete it is re-rendered to present field errors. This means the error is missed in the error summary.
  // Using the subscription below it checks for an error and if present sets the auto complete error.
  PCore.getPubSubUtils().subscribe('autoCompleteFieldPresent', errorMessage => {
    setHasAutoCompleteError(errorMessage);
  });

  // Fetches and filters any validatemessages on fields on the page, ordering them correctly based on the display order set in DefaultForm.
  // Also adds the relevant fieldID for each field to allow error summary links to move focus when clicked. This process uses the
  // name prop on the input field in most cases, however where there is a deviation (for example, in Date component, where the first field
  // has -day appended), a fieldId stateprop will be defined and this will be used instead.
  useEffect(() => {
    checkErrorMessages();
  }, [children, hasAutoCompleteError]);

  useEffect(() => {
    if (errorMessages.length === 0) {
      const bodyfocus: any = document.getElementsByClassName('govuk-template__body')[0];
      bodyfocus.focus();
    }
  }, [children]);

  function showErrorSummary() {
    setErrorMessages([]);
    checkErrorMessages();
  }

  function onSaveActionSuccess(data) {
    actionsAPI.cancelAssignment(itemKey).then(() => {
      PCore.getPubSubUtils().publish(
        PCore.getConstants().PUB_SUB_EVENTS.CASE_EVENTS.CREATE_STAGE_SAVED,
        data
      );
    });
  }

  function handleBackLinkforInvalidDate() {
    const childPconnect = children[0]?.props?.getPConnect();
    const dateField = PCore.getFormUtils()
      .getEditableFields(childPconnect.getContextName())
      .filter(field => field.type.toLowerCase() === 'date');
    if (dateField) {
      dateField?.forEach(field => {
        const childPagRef = childPconnect.getPageReference();
        const pageRef =
          thePConn.getPageReference() === childPagRef ? thePConn.getPageReference() : childPagRef;
        const storedRefName = field.name?.replace(pageRef, '');
        const storedDateValue = childPconnect.getValue(`.${storedRefName}`);
        if (!dayjs(storedDateValue, 'YYYY-MM-DD', true).isValid()) {
          childPconnect.setValue(`.${storedRefName}`, '');
        }
      });
    }
  }

  function navigateToStepId(event, stepId) {
    event.preventDefault();
    const pConn = getPConnect();
    const actions = pConn.getActionsApi();
    const navigateToStepPromise = actions.navigateToStep(stepId, context);
    navigateToStepPromise
      .then(() => {
        //  navigate to step success handling
        // eslint-disable-next-line no-console
        console.log('navigation to CYA successful');
      })
      .catch(error => {
        // navigate to step failure handling
        // eslint-disable-next-line no-console
        console.log('CYA Navigation failed', error);
      });
  }

  function getUniqueValueForEveryScreen() {
    const contextWorkarea = PCore.getContainerUtils().getActiveContainerItemName(
      `${PCore.getConstants().APP.APP}/primary`
    );
    const flowActionId = PCore.getStoreValue(
      '.ID',
      'caseInfo.assignments[0].actions[0]',
      contextWorkarea
    );
    const screenContext =
      PCore.getStoreValue('.context', 'caseInfo.assignments[0]', contextWorkarea) || '';
    const uniqueValueForEveryScreen = flowActionId + screenContext;
    return uniqueValueForEveryScreen;
  }

  useEffect(() => {
    const isEditMode = sessionStorage.getItem('isEditMode');
    if (isEditMode === 'true') {
      sessionStorage.setItem('isEditMode', 'false');
      const uniqueValueForEveryScreen = getUniqueValueForEveryScreen();
      sessionStorage.setItem('uniqueValueForEveryScreen', uniqueValueForEveryScreen);
    }
  });

  async function buttonPress(sAction: string, sButtonType: string) {
    if (sButtonType === 'secondary') {
      switch (sAction) {
        case 'navigateToStep': {
          handleBackLinkforInvalidDate(); // clears the date value if there is invalid date, allowing back btn click(ref bug-7756)
          const navigatePromise = navigateToStep('previous', itemKey);

          clearErrors();

          navigatePromise
            .then(() => {
              scrollToTop();
            })
            .catch(() => {
              scrollToTop();
              showErrorSummary();
            });

          break;
        }

        case 'saveAssignment': {
          const caseID = thePConn.getCaseInfo().getKey();
          const assignmentID = thePConn.getCaseInfo().getAssignmentID();
          const savePromise = saveAssignment(itemKey);

          savePromise
            .then(() => {
              sessionStorage.removeItem('assignmentID');
              const caseType = thePConn
                .getCaseInfo()
                .c11nEnv.getValue(PCore.getConstants().CASE_INFO.CASE_TYPE_ID);
              onSaveActionSuccess({ caseType, caseID, assignmentID });
              scrollToTop();
            })
            .catch(() => {
              scrollToTop();
              showErrorSummary();
            });

          break;
        }

        case 'cancelAssignment': {
          // check if create stage (modal)
          const { PUB_SUB_EVENTS } = PCore.getConstants();
          const { publish } = PCore.getPubSubUtils();
          if (isCreateStage) {
            const cancelPromise = cancelCreateStageAssignment(itemKey);

            cancelPromise
              .then(data => {
                publish(PUB_SUB_EVENTS.EVENT_CANCEL, data);
                scrollToTop();
              })
              .catch(() => {
                scrollToTop();
                showErrorSummary();
              });
          } else {
            const cancelPromise = cancelAssignment(itemKey);

            cancelPromise
              .then(data => {
                publish(PUB_SUB_EVENTS.EVENT_CANCEL, data);
                scrollToTop();
              })
              .catch(() => {
                scrollToTop();
                showErrorSummary();
              });
          }
          break;
        }

        default:
          break;
      }
    } else if (sButtonType === 'primary') {
      // eslint-disable-next-line sonarjs/no-small-switch
      switch (sAction) {
        case 'finishAssignment': {
          const status = await getServiceShutteredStatus();
          if (status) {
            setServiceShutteredStatus(status);
          } else {
            const finishPromise = finishAssignment(itemKey);

            finishPromise
              .then(() => {
                sessionStorage.removeItem('assignmentID');
                scrollToTop();
                PCore.getPubSubUtils().publish('CustomAssignmentFinished');
              })
              .catch(() => {
                scrollToTop();
                showErrorSummary();
              });
          }
          break;
        }

        default:
          break;
      }
    }
  }
  function _onButtonPress(sAction: string, sButtonType: string) {
    buttonPress(sAction, sButtonType);
  }
  useEffect(() => {
    if (actionButtons) {
      setArSecondaryButtons(actionButtons.secondary);
    }
  }, [actionButtons]);

  // This is for declaration and interruption page of education start as pega have limitation
  const contextWorkarea = PCore.getContainerUtils().getActiveContainerItemName(
    `${PCore.getConstants().APP.APP}/primary`
  );
  const currentFlowActionId = PCore.getStoreValue(
    '.ID',
    'caseInfo.assignments[0].actions[0]',
    contextWorkarea
  );

  const arrEduStartPagesForStepIds = ['declaration', 'checkdata'];
  const isEduStartPagesForStepIdsExist = arrEduStartPagesForStepIds?.includes(
    currentFlowActionId?.toLowerCase()
  );

  useEffect(() => {
    if (isEduStartPagesForStepIdsExist && isEduStartJourney()) {
      const options = {
        invalidateCache: true
      };

      PCore.getDataPageUtils()
        .getPageDataAsync(
          'D_GetStepIdByApplicationAndAction',
          'root',
          {
            FlowActionName: currentFlowActionId,
            CaseID: thePConn.getCaseSummary().content.pyID,
            ...(isEduStartJourney() && { ApplicationName: 'EDStart' })
          },
          options
        )
        .then((pageData: ResponseType) => {
          const stepIDCYA = pageData?.CurrentStepId;
          if (stepIDCYA) {
            sessionStorage.setItem('stepIDCYA', stepIDCYA);
            sessionStorage.setItem('isComingFromEduStartPages', 'true');
          }
        })
        .catch(err => {
          // eslint-disable-next-line no-console
          console.error(err);
        });
    }
  }, [isEduStartPagesForStepIdsExist]);

  function renderAssignmentCard() {
    return (
      <ErrorMsgContext.Provider
        value={{
          errorMsgs: errorMessages
        }}
      >
        <AssignmentCard
          getPConnect={getPConnect}
          itemKey={itemKey}
          actionButtons={actionButtons}
          onButtonPress={buttonPress}
          errorMsgs={errorMessages}
        >
          {children}
        </AssignmentCard>
      </ErrorMsgContext.Provider>
    );
  }

  function navigate(e, sButton) {
    e.preventDefault();
    sessionStorage.removeItem('assignmentID');
    const storedStepIDCYA = sessionStorage.getItem('stepIDCYA');
    const currentUniqueValueForEveryScreen = getUniqueValueForEveryScreen();

    const storedUniqueValueForEveryScreen = sessionStorage.getItem('uniqueValueForEveryScreen');
    const isComingFromPortal = sessionStorage.getItem('isComingFromPortal');
    const isComingFromTasklist = sessionStorage.getItem('isComingFromTasklist');
    // This is for chb tactical solution only
    const stepIdTasklist = 'SubProcessSF7_AssignmentSF1';

    if (
      (isCHBJourney() || isEduStartJourney()) &&
      currentUniqueValueForEveryScreen === storedUniqueValueForEveryScreen
    ) {
      clearErrors();
      handleBackLinkforInvalidDate();
      if (isComingFromTasklist === 'true') {
        // coming from tasklist
        navigateToStepId(e, stepIdTasklist);
      } else if (isComingFromPortal === 'true') {
        // coming from portal
        PCore.getPubSubUtils().publish('showPortalScreenOnBackPress', {});
      } else if (storedStepIDCYA) {
        // coming from cya
        navigateToStepId(e, storedStepIDCYA);
      } else {
        // For inflight cases, None of above then move to tasklist as of now, will change this code in furure enhancement
        navigateToStepId(e, stepIdTasklist);
      }
    } else if (sButton) {
      _onButtonPress(sButton.jsAction, 'secondary');
    } else {
      navigateToStep('previous', itemKey);
    }
  }

  function triggerBack() {
    if (typeof appBacklinkProps.appBacklinkAction === 'function') {
      appBacklinkProps.appBacklinkAction();
    }
    if (typeof appBacklinkPropsEducation.appBacklinkAction === 'function') {
      appBacklinkPropsEducation.appBacklinkAction();
    }
  }

  const shouldRemoveFormTag = shouldRemoveFormTagForReadOnly(containerName);

  return (
    <>
      {serviceShutteredStatus ? (
        <ShutterServicePage />
      ) : (
        <div id='Assignment'>
          {arSecondaryButtons?.map(sButton =>
            sButton.name === 'Previous' &&
            sessionStorage.getItem('isTasklistScreen') !== 'true' &&
            !isChildSummaryScreen ? (
              <Button
                variant='backlink'
                onClick={e => {
                  e.target.blur();
                  navigate(e, sButton);
                }}
                key={sButton.actionID}
                attributes={{ type: 'link' }}
              ></Button>
            ) : null
          )}

          {arSecondaryButtons?.findIndex(button => button.name === 'Previous') === -1 &&
          (isCHBJourney() || isEduStartJourney()) &&
          sessionStorage.getItem('isTasklistScreen') !== 'true' &&
          !isChildSummaryScreen ? (
            <Button
              variant='backlink'
              onClick={event => {
                navigate(event, null);
              }}
              key='createMissingBacklink'
            >
              {t('BACK')}
            </Button>
          ) : null}
          {
            // If there is no previous action button, and a 'appcontext' backlink action is set, show a backlink that performs the appcontext backlink action
            arSecondaryButtons?.findIndex(button => button.name === 'Previous') === -1 &&
              (appBacklinkProps.appBacklinkAction ||
                appBacklinkPropsEducation.appBacklinkAction) && (
                <Button
                  variant='backlink'
                  onClick={triggerBack}
                  key='createstagebacklink'
                  attributes={{ type: 'link' }}
                >
                  {t(
                    (appBacklinkProps.appBacklinkText as string) ||
                      (appBacklinkPropsEducation.appBacklinkText as string)
                  )}
                </Button>
              )
          }
          <MainWrapper serviceParam={serviceParam}>
            {errorMessages.length > 0 && (
              <ErrorSummary
                errors={errorMessages.map(item =>
                  localizedVal(item.message, localeCategory, localeReference)
                )}
              />
            )}
            {!isOnlyFieldDetails.isOnlyField &&
            (containerName
              ?.toLowerCase()
              .includes('opt-in to start receiving child benefit payments') ||
              containerName
                ?.toLowerCase()
                .includes('opt-out to stop receiving child benefit payments'))
              ? null
              : (!isOnlyFieldDetails.isOnlyField ||
                  containerName?.toLowerCase().includes('check your answer') ||
                  containerName?.toLowerCase().includes('declaration')) && (
                  <h1 className='govuk-heading-l'>
                    {localizedVal(
                      containerName,
                      'Assignment',
                      '@BASECLASS!GENERIC!PYGENERICFIELDS'
                    )}
                  </h1>
                )}
            {shouldRemoveFormTag ? renderAssignmentCard() : <form>{renderAssignmentCard()}</form>}
            <p className='govuk-body'>
              <a
                href='https://www.tax.service.gov.uk/ask-hmrc/chat/child-benefit'
                className='govuk-link'
                rel='noreferrer noopener'
                target='_blank'
              >
                {t('ASK_HMRC_ONLINE')} {t('OPENS_IN_NEW_TAB')}
              </a>
            </p>
          </MainWrapper>
        </div>
      )}
    </>
  );
}

Assignment.propTypes = {
  children: PropTypes.node.isRequired,
  getPConnect: PropTypes.func.isRequired,
  itemKey: PropTypes.string,
  isCreateStage: PropTypes.bool
};

Assignment.defaultProps = {
  itemKey: null,
  isCreateStage: false
};
