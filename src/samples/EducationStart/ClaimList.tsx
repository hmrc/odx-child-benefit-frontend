import React from 'react';
import PropTypes from 'prop-types';
import { scrollToTop, getServiceShutteredStatus } from '../../components/helpers/utils';
import { useTranslation } from 'react-i18next';
import Button from '../../components/BaseComponents/Button/Button';
import WarningText from '../../components/BaseComponents/GDSWarningText/WarningText';
import useDateTimeFormatter from '../../components/helpers/hooks/useDateTimeFormatter';

declare const PCore: any;

type NoticeDetailsType = {
  DocumentContentHTML: string;
};

export default function ClaimsList(props) {
  const {
    thePConn,
    cases,
    title,
    fieldType,
    rowClickAction,
    setShutterServicePage,
    setShowLandingPage
  } = props;
  const { t } = useTranslation();
  const { formatDate, getFormattedDate } = useDateTimeFormatter();

  const containerManger = thePConn?.getContainerManager();
  const locale = PCore.getEnvironmentInfo().locale.replaceAll('-', '_');
  const docIDForDecisionNotice = locale.toLowerCase() !== 'en_gb' ? 'ESDN0002' : 'ESDN0001';

  function viewDecisionWindow(e: React.MouseEvent<HTMLAnchorElement>, currentCaseId: string) {
    e.preventDefault();

    const options = {
      invalidateCache: true
    };
    PCore.getDataPageUtils()
      .getPageDataAsync(
        'D_DocumentContent',
        'root',
        {
          DocumentID: docIDForDecisionNotice,
          Locale: locale,
          CaseID: currentCaseId
        },
        options
      )
      .then((noticeDetails: NoticeDetailsType) => {
        const newWindow = window.open('', '_blank');
        newWindow.document.write(noticeDetails.DocumentContentHTML);
        newWindow.document.close();
      })
      .catch((err: Error) => {
        // eslint-disable-next-line no-console
        console.error(err);
      });
  }

  const resetContainer = () => {
    const context = PCore.getContainerUtils().getActiveContainerItemName(
      `${PCore.getConstants().APP.APP}/primary`
    );
    containerManger?.resetContainers({
      context: 'app',
      name: 'primary',
      containerItems: [context]
    });
  };

  function openPegaPortalPage() {
    scrollToTop();
    setShowLandingPage(false);
  }

  async function _rowClick(e, row: any) {
    e.preventDefault();
    sessionStorage.setItem('assignmentFinishedFlag', 'false');
    const { pzInsKey, pyAssignmentID } = row;

    // const container = thePConn.getContainerName();
    const container = 'primary';

    const target = `${PCore.getConstants().APP.APP}/${container}`;

    sessionStorage.setItem('isComingFromPortal', 'true');
    sessionStorage.setItem('isEditMode', 'true');
    sessionStorage.removeItem('stepIDCYA');

    if (rowClickAction === 'OpenAssignment') {
      resetContainer();
      const openAssignmentOptions = { containerName: container };
      PCore.getMashupApi()
        .openAssignment(pyAssignmentID, target, openAssignmentOptions)
        .then(() => {
          openPegaPortalPage();
        })
        .catch((err: Error) => console.log('Error : ', err)); // eslint-disable-line no-console
    } else if (rowClickAction === 'OpenCase') {
      const status = await getServiceShutteredStatus();
      if (status) {
        setShutterServicePage(status);
      } else {
        PCore.getMashupApi()
          .openCase(pzInsKey, target, { pageName: 'SummaryClaim' })
          .then(() => {
            openPegaPortalPage();
          });
      }
    }
  }

  const claimHeading = (firstName: string, lastName: string) =>
    firstName && lastName
      ? `${t('EXTENSION_REQUESTS_FOR')} ${firstName} ${lastName}`
      : `${t('EXTENSION_REQUESTS')}`;

  function claimHiddenText(firstName, lastName, claimItem) {
    if (!firstName && !lastName) {
      return `${t('CREATED')} ${getFormattedDate(claimItem.dateCreated)}`;
    }
  }

  function appendHiddenChildDetails(childName: string, claimItem, actionButton) {
    const getFormattedTimestamp = () => `${getFormattedDate(claimItem.dateCreated)}`;

    return (
      <>
        {childName && childName !== 'null null' && actionButton === 'CONTINUE_REQUEST' ? (
          <span className='govuk-visually-hidden'>
            {t('FOR')} {childName} {t('CREATED').toLowerCase()} {getFormattedTimestamp()}
          </span>
        ) : null}

        {!childName || childName === 'null null' ? (
          <span className='govuk-visually-hidden'>
            {t('CREATED')} {getFormattedTimestamp()}
          </span>
        ) : null}

        {childName && actionButton === 'VIEW_REQUEST' ? (
          <span className='govuk-visually-hidden'>
            {t('FOR')} {childName} {t('SUBMITTED').toLowerCase()} {getFormattedTimestamp()}
          </span>
        ) : null}
      </>
    );
  }

  const renderSummaryListRow = (claimItem, fieldTypeValue) => {
    const isCreatedOrSubmitted =
      fieldTypeValue === t('CREATED') || fieldTypeValue === t('SUBMITTED');
    const isLastSaved = fieldTypeValue === t('LAST_SAVED');

    return (
      <div className='govuk-summary-list__row'>
        <dt className='govuk-summary-list__key'>{fieldTypeValue}</dt>
        <dd className='govuk-summary-list__value'>
          {isCreatedOrSubmitted && !isLastSaved && getFormattedDate(claimItem.dateCreated)}
          {isLastSaved && getFormattedDate(claimItem.dateUpdated)}
        </dd>
      </div>
    );
  };

  const fieldTypeRow = claimItem => {
    if (fieldType === t('CREATED')) {
      return renderSummaryListRow(claimItem, t('CREATED'));
    } else if (fieldType === t('SUBMITTED')) {
      return renderSummaryListRow(claimItem, t('SUBMITTED'));
    }
  };

  function renderChildDetails(claimItem) {
    return claimItem.children.map(child => (
      <React.Fragment key={child?.firstName}>
        <h3 className='govuk-heading-m'>
          {claimHeading(child?.firstName, child?.lastName)}
          {!child?.firstName && !child?.lastName ? (
            <span className='govuk-visually-hidden'>
              {claimHiddenText(child?.firstName, child?.lastName, claimItem)}{' '}
            </span>
          ) : null}
        </h3>
        <dl className='govuk-summary-list'>
          {child?.dob && (
            <div className='govuk-summary-list__row'>
              <dt className='govuk-summary-list__key'>{t('DATE_OF_BIRTH')}</dt>
              <dd className='govuk-summary-list__value'>{formatDate(child.dob)}</dd>
            </div>
          )}
          {fieldTypeRow(claimItem)}
          {claimItem.actionButton === 'CONTINUE_REQUEST' &&
            renderSummaryListRow(claimItem, t('LAST_SAVED'))}
        </dl>

        <Button
          variant='secondary'
          onClick={e => {
            _rowClick(e, claimItem.rowDetails);
          }}
        >
          {t(claimItem.actionButton)}{' '}
          {appendHiddenChildDetails(
            `${child?.firstName} ${child?.lastName}`,
            claimItem,
            claimItem.actionButton
          )}
        </Button>

        {claimItem.viewDecisionNotice && (
          <div className='govuk-body'>
            <a
              className='govuk-link'
              href='#'
              onClick={e => viewDecisionWindow(e, claimItem.rowDetails.pzInsKey)}
              target='_blank'
              rel='noreferrer noopener'
            >
              {t('VIEW_DECISION_NOTICE')}{' '}
              {appendHiddenChildDetails(
                `${child?.firstName} ${child?.lastName}`,
                claimItem,
                claimItem.actionButton
              )}{' '}
              {t('OPENS_IN_NEW_TAB')}{' '}
            </a>
          </div>
        )}
      </React.Fragment>
    ));
  }

  return (
    <>
      <h2
        className={`govuk-heading-l ${title === t('SUBMITTED_REQUESTS') ? 'govuk-!-padding-top-4' : ''}`}
      >
        {title}
      </h2>
      {title === t('REQUESTS_IN_PROGRESS') && (
        <WarningText className='govuk-body'>{t('EDSTART_PORTAL_WARNING_TEXT')}</WarningText>
      )}

      {cases.map(claimItem => (
        <React.Fragment key={claimItem.claimRef}>{renderChildDetails(claimItem)}</React.Fragment>
      ))}
    </>
  );
}

ClaimsList.propTypes = {
  thePConn: PropTypes.object,
  cases: PropTypes.array,
  title: PropTypes.string,
  fieldType: PropTypes.string,
  rowClickAction: PropTypes.oneOf(['OpenCase', 'OpenAssignment']),
  setShowLandingPage: PropTypes.func,
  setShutterServicePage: PropTypes.func
};
