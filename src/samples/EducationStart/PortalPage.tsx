import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import setPageTitle from '../../components/helpers/setPageTitleHelpers';
import NotificationBanner from '../../components/BaseComponents/NotificationBanner/NotificationBanner';
import ClaimsList from './ClaimList';
import Button from '../../components/BaseComponents/Button/Button';

export default function PortalPage(props) {
  const {
    showPortalBanner,
    children,
    inProgressClaims,
    submittedClaims,
    assignmentPConn,
    setShowLandingPage,
    setShowStartClaim,
    setShowPortalPageDefault,
    setShutterServicePage,
    showPortalPageDefault
  } = props;
  const { t } = useTranslation();

  function showStartClaim() {
    setShowStartClaim({ status: true, fromDefaultPortal: showPortalPageDefault });
    setShowPortalPageDefault(false);
  }

  useEffect(() => {
    setPageTitle();
  }, []);

  return (
    <main className='govuk-main-wrapper' id='main-content' role='main'>
      {showPortalBanner && <NotificationBanner content={t('PORTAL_NOTIFICATION_BANNER_CONTENT')} />}
      <div className='govuk-grid-row'>
        <div className='govuk-grid-column-two-thirds'>
          <h1 className='govuk-heading-l'>{t('CHILD_BENEFIT_EXTENSION_REQUESTS')}</h1>
          <p className='govuk-body'>{t('VIEW_STATUS_OR_NOTIFY_CHANGES')}</p>
          <div className='govuk-inset-text'>
            <p className='govuk-body'>
              {t('YOUR_VIEW')}{' '}
              <a
                href='https://www.gov.uk/child-benefit-proof'
                target='_blank'
                className='govuk-link'
                rel='noopener noreferrer'
              >
                {' '}
                {t('PROOF_OF_ENTITLEMENT')} {t('OPENS_IN_NEW_TAB')}
              </a>
              .
            </p>
          </div>
          <Button id='make-new-request' onClick={showStartClaim} variant='primary'>
            {t('MAKE_NEW_REQUEST')}
          </Button>
          <p className='govuk-body'>
            {t('MUST_TELL')}{' '}
            <a
              href='https://www.gov.uk/government/publications/child-benefit-child-left-approved-education-or-training-ch459'
              className='govuk-link'
              rel='noopener noreferrer'
              target='_blank'
            >
              {t('LEAVES_FULL_TIME_EDUCATION')} {t('OPENS_IN_NEW_TAB')}
            </a>
            .
          </p>
          <hr
            className='govuk-section-break govuk-section-break--xl govuk-section-break--visible'
            aria-hidden
          ></hr>
        </div>
      </div>
      {inProgressClaims.length > 0 && (
        <div className='govuk-grid-row'>
          <div className='govuk-grid-column-two-thirds'>
            {children}
            <ClaimsList
              thePConn={assignmentPConn}
              cases={inProgressClaims}
              title={t('REQUESTS_IN_PROGRESS')}
              rowClickAction='OpenAssignment'
              fieldType={t('CREATED')}
              setShowLandingPage={setShowLandingPage}
            />
          </div>
        </div>
      )}

      {submittedClaims.length > 0 && (
        <div className='govuk-grid-row'>
          <div className='govuk-grid-column-two-thirds'>
            {children}
            <ClaimsList
              thePConn={assignmentPConn}
              cases={submittedClaims}
              title={t('SUBMITTED_REQUESTS')}
              rowClickAction='OpenCase'
              fieldType={t('SUBMITTED')}
              setShowLandingPage={setShowLandingPage}
              setShutterServicePage={setShutterServicePage}
            />
          </div>
        </div>
      )}
    </main>
  );
}
