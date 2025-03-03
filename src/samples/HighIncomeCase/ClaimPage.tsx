import React from 'react';
import { useTranslation } from 'react-i18next';
import LogoutPopup from '../../components/AppComponents/LogoutPopup';
import SummaryPage from '../../components/AppComponents/SummaryPage';
import { triggerLogout } from '../../components/helpers/utils';

const ClaimPage = ({
  currentDisplay,
  summaryPageContent,
  showSignoutModal,
  setShowSignoutModal,
  handleStaySignIn,
  showTimeoutModal
}) => {
  const { t } = useTranslation();

  return (
    <>
      {currentDisplay === 'resolutionpage' && (
        <SummaryPage
          summaryContent={summaryPageContent.Content}
          summaryTitle={summaryPageContent.Title}
          summaryBanner={summaryPageContent.Banner}
          backlinkProps={{}}
        />
      )}

      <LogoutPopup
        show={showSignoutModal && !showTimeoutModal}
        hideModal={() => setShowSignoutModal(false)}
        handleSignoutModal={triggerLogout}
        handleStaySignIn={handleStaySignIn}
        staySignedInButtonText={t('STAY_SIGNED_IN')}
        signoutButtonText={t('SIGN-OUT')}
      >
        <h1 id='govuk-timeout-heading' className='govuk-heading-m push--top'>
          {t('YOU_ARE_ABOUT_TO_SIGN_OUT')}
        </h1>
        <p className='govuk-body'>{t('SIGN_OUT_MSG')}</p>
      </LogoutPopup>
    </>
  );
};

export default ClaimPage;
