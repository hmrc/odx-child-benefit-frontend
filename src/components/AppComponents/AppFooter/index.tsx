import React, { useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import AppContextEducation from './../../../samples/EducationStart/reuseables/AppContextEducation'; // TODO: Once this code exposed to common folder, we will refer AppContext from reuseable components
import { useLocation } from 'react-router-dom';
import { CustomView, getUA } from 'react-device-detect';
import { getSdkConfig } from '@pega/auth/lib/sdk-auth-manager';

export default function AppFooter() {
  const { t } = useTranslation();
  const location = useLocation();
  const { serviceParam, serviceName, appNameHeader } = useContext(AppContextEducation);

  const searchParams = new URLSearchParams(location.search);

  // Default for all services
  const serviceParamUpdate = serviceParam || searchParams.get('serviceParam') || '463';
  const appNameUpdate = appNameHeader || searchParams.get('appname') || 'CLAIM_CHILD_BENEFIT';
  const serviceNamePageTitle =
    serviceName || searchParams.get('serviceNamePageTitle') || 'CLAIM_CHILD_BENEFIT';

  const [mobileAppUA, setMobileAppUA] = useState<string | null>(null);

  getSdkConfig()
    .then(sdkConfig => {
      if (sdkConfig && sdkConfig.mobileApp && sdkConfig.mobileApp.mobileAppUserAgent) {
        setMobileAppUA(sdkConfig.mobileApp.mobileAppUserAgent);
      } else {
        setMobileAppUA('/');
      }
    })
    .catch(error => {
      // eslint-disable-next-line no-console
      console.error('Error fetching SDK config:', error);
    });

  return (
    <CustomView condition={!getUA.toLocaleLowerCase().includes(mobileAppUA)}>
      <footer className='govuk-footer ' role='contentinfo'>
        <div className='govuk-width-container '>
          <div className='govuk-footer__meta'>
            <div className='govuk-footer__meta-item govuk-footer__meta-item--grow'>
              <h2 className='govuk-visually-hidden'>{t('SUPPORT_LINKS')}</h2>
              <ul className='govuk-footer__inline-list'>
                <li className='govuk-footer__inline-list-item'>
                  <a
                    className='govuk-footer__link'
                    href='https://www.gov.uk/government/publications/data-protection-act-dpa-information-hm-revenue-and-customs-hold-about-you'
                    target='_blank'
                    rel='noreferrer noopener'
                  >
                    {t('PRIVACY')} <span className= "govuk-visually-hidden"> {t('OPENS_IN_NEW_TAB')}</span>
                  </a>
                </li>
                <li className='govuk-footer__inline-list-item'>
                  <a
                    href='https://www.tax.service.gov.uk/accessibility-statement/child-benefit-make-a-claim'
                    className='govuk-footer__link'
                    target='_blank'
                    rel='noreferrer noopener'
                  >
                    {t('ACCESSIBILITY')} <span className= "govuk-visually-hidden"> {t('OPENS_IN_NEW_TAB')}</span>
                  </a>
                </li>
                <li className='govuk-footer__inline-list-item'>
                  <Link
                    to={`/cookies?appname=${appNameUpdate}&serviceParam=${serviceParamUpdate}&serviceNamePageTitle=${serviceNamePageTitle}`}
                    className='govuk-footer__link'
                    target='_blank'
                    rel='noreferrer noopener'
                  >
                    {t('COOKIES')} <span className= "govuk-visually-hidden"> {t('OPENS_IN_NEW_TAB')}</span>
                  </Link>
                </li>
                <li className='govuk-footer__inline-list-item'>
                  <a
                    className='govuk-footer__link'
                    href='https://www.tax.service.gov.uk/help/terms-and-conditions'
                    target='_blank'
                    rel='noreferrer noopener'
                  >
                    {t('TERMS_CONDITIONS')} <span className= "govuk-visually-hidden"> {t('OPENS_IN_NEW_TAB')}</span>
                  </a>
                </li>
                <li className='govuk-footer__inline-list-item'>
                  <a
                    className='govuk-footer__link'
                    href='https://www.gov.uk/government/collections/child-benefit-forms'
                    target='_blank'
                    rel='noreferrer noopener'
                  >
                    {t('CHB_FORMS_GUIDANCE')} <span className= "govuk-visually-hidden"> {t('OPENS_IN_NEW_TAB')}</span>
                  </a>
                </li>
                <li className='govuk-footer__inline-list-item'>
                  <a
                    className='govuk-footer__link'
                    href='https://www.gov.uk/government/organisations/hm-revenue-customs/contact'
                    target='_blank'
                    rel='noreferrer noopener'
                  >
                    {t('CONTACT')} <span className= "govuk-visually-hidden"> {t('OPENS_IN_NEW_TAB')}</span>
                  </a>
                </li>
                <li className='govuk-footer__inline-list-item'>
                  <a
                    className='govuk-footer__link'
                    href='https://www.gov.uk/help'
                    target='_blank'
                    rel='noreferrer noopener'
                  >
                    {t('HELP')} <span className= "govuk-visually-hidden"> {t('OPENS_IN_NEW_TAB')}</span>
                  </a>
                </li>
                <li className='govuk-footer__inline-list-item'>
                  <a
                    className='govuk-footer__link'
                    href='https://www.gov.uk/cymraeg'
                    target='_blank'
                    rel='noreferrer noopener'
                  >
                    {t('CYMRAEG')} <span className= "govuk-visually-hidden"> {t('OPENS_IN_NEW_TAB')}</span>
                  </a>
                </li>
              </ul>
              <svg
                aria-hidden='true'
                focusable='false'
                className='govuk-footer__licence-logo'
                xmlns='http://www.w3.org/2000/svg'
                viewBox='0 0 483.2 195.7'
                height='17'
                width='41'
              >
                <path
                  fill='currentColor'
                  d='M421.5 142.8V.1l-50.7 32.3v161.1h112.4v-50.7zm-122.3-9.6A47.12 47.12 0 0 1 221 97.8c0-26 21.1-47.1 47.1-47.1 16.7 0 31.4 8.7 39.7 21.8l42.7-27.2A97.63 97.63 0 0 0 268.1 0c-36.5 0-68.3 20.1-85.1 49.7A98 98 0 0 0 97.8 0C43.9 0 0 43.9 0 97.8s43.9 97.8 97.8 97.8c36.5 0 68.3-20.1 85.1-49.7a97.76 97.76 0 0 0 149.6 25.4l19.4 22.2h3v-87.8h-80l24.3 27.5zM97.8 145c-26 0-47.1-21.1-47.1-47.1s21.1-47.1 47.1-47.1 47.2 21 47.2 47S123.8 145 97.8 145'
                />
              </svg>
              <span className='govuk-footer__licence-description'>
                {t('FOOTER_LISCENSE_P1')}
                <a
                  className='govuk-footer__link'
                  href='https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/'
                  rel='license'
                >
                  {t('FOOTER_LISCENSE_LINK')}
                </a>
                {t('FOOTER_LISCENSE_P2')}
              </span>
            </div>
            <div className='govuk-footer__meta-item'>
              <a
                className='govuk-footer__link govuk-footer__copyright-logo'
                href='https://www.nationalarchives.gov.uk/information-management/re-using-public-sector-information/uk-government-licensing-framework/crown-copyright/'
                target='_blank'
                rel='noreferrer noopener'
              >
                {t('COPYRIGHT')}
              </a>
            </div>
          </div>
        </div>
      </footer>
    </CustomView>
  );
}
