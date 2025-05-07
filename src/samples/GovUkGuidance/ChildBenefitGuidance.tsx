import React from 'react';
import { useTranslation } from 'react-i18next';
import AppHeader from '../../components/AppComponents/AppHeader';
import AppFooter from '../../components/AppComponents/AppFooter';
import useAppLanguageToggle from '../../components/helpers/hooks/useAppLanguageToggle';
import LanguageToggle from '../../components/AppComponents/LanguageToggle';

export default function ChildBenefitGuidance() {
  const { t } = useTranslation();
  useAppLanguageToggle();
  return (
    <>
      <AppHeader appname={t('CLAIM_CHILD_BENEFIT')} />

      <div className='govuk-width-container'>
        <LanguageToggle />
        <main className='govuk-main-wrapper' id='main-content' role='main'>
          <h1 className='govuk-heading-xl'>{t('CHB_HOMEPAGE_HEADING')}</h1>
          <div className='govuk-!-margin-bottom-6'>
            <h2 className='govuk-heading-l'>{t('MAKE_A_CLAIM')}</h2>
          </div>
          <div className='govuk-!-margin-bottom-0'>
            <p className='govuk-body'>{t('GUIDANCE_48_HOURS')}</p>

            <p className='govuk-body'>{t('GUIDANCE_BACKDATED_3_MONTHS')}</p>

            <div role='note' aria-label='Information' className='govuk-inset-text'>
              <p className='govuk-body'>
                {t('GUIDANCE_CLAIM_OVER_16')}{' '}
                <a className='govuk-link' href='https://www.gov.uk/child-benefit/eligibility'>
                  {t('GUIDANCE_CHECK_ELIGIBLE_LINK')}
                </a>
              </p>
            </div>

            <h2 className='govuk-heading-l' id='deciding-who-should-claim'>
              {t('GUIDANCE_WHO_SHOULD_CLAIM_HEADING')}
            </h2>

            <p className='govuk-body'>{t('GUIDANCE_ONLY_ONE_PARENT')}</p>

            <p className='govuk-body'>{t('GUIDANCE_NI_CREDITS')}</p>

            <p className='govuk-body'>
              {t('GUIDANCE_CLAIM_DIFF_CHILDREN')}{' '}
              <a className='govuk-link' href='https://www.gov.uk/child-benefit/what-youll-get'>
                {t('GUIDANCE_HIGHER_RATE_LINK')}
              </a>{' '}
              {t('GUIDANCE_PAYBACK')}
            </p>

            <h2 className='govuk-heading-l' id='before-you-start'>
              {t('BEFORE_YOU_START')}
            </h2>

            <p className='govuk-body'>{t('GUIDANCE_YOU_NEED')}:</p>

            <ul className='govuk-list govuk-list--bullet govuk-list--space'>
              <li>{t('GUIDANCE_CERTIFICATES')}</li>
              <li>{t('GUIDANCE_BANK_DETAILS')}</li>
              <li>{t('GUIDANCE_YOUR_NI')}</li>
              <li>{t('GUIDANCE_PARTNERS_NI')}</li>
            </ul>

            <p className='govuk-body'>
              {t('YOU_CAN')}{' '}
              <a
                className='govuk-link'
                href='https://www.gov.uk/order-copy-birth-death-marriage-certificate'
              >
                {t('GUIDANCE_ORDER_CERT_LINK')}
              </a>{' '}
              {t('GUIDANCE_IF_LOST')}
            </p>

            <h3 className='govuk-heading-m' id='if-your-childs-birth-was-registered-outside-the-uk'>
              {t('GUIDANCE_REGISTERED_OUTSIDE_UK')}
            </h3>

            <p className='govuk-body'>{t('GUIDANCE_YOU_WILL_NEED')}:</p>

            <ul className='govuk-list govuk-list--bullet govuk-list--space'>
              <li>{t('GUIDANCE_ORIGINAL_CERT')}</li>
              <li>{t('GUIDANCE_CHILD_PASSPORT')}</li>
            </ul>

            <div role='note' aria-label='Information' className='application-notice info-notice'>
              <p className='govuk-body'>{t('GUIDANCE_E_VISA')}</p>
            </div>

            <p className='govuk-body'>{t('GUIDANCE_RETURNED_FOUR_WEEKS')}</p>

            <p className='govuk-body'>{t('GUIDANCE_SEND_WHEN_ARRIVED')}</p>

            <a
              href='./'
              role='button'
              draggable='false'
              className='govuk-button govuk-button--start govuk-link'
              data-module='govuk-button'
            >
              {t('START_NOW')}
              <svg
                className='govuk-button__start-icon'
                xmlns='http://www.w3.org/2000/svg'
                width='17.5'
                height='19'
                viewBox='0 0 33 40'
                aria-hidden='true'
                focusable='false'
              >
                <path fill='currentColor' d='M0 0h13l20 20-20 20H0l20-20z' />
              </svg>
            </a>

            <p className='govuk-body'>
              {t('GUIDANCE_FIND_OUT_MORE')}{' '}
              <a className='govuk-link' href='https://www.gov.uk/child-benefit/how-to-claim'>
                {t('GUIDANCE_HOW_IT_WORKS_LINK')}
              </a>
            </p>
          </div>
        </main>
      </div>
      <AppFooter />
    </>
  );
}
