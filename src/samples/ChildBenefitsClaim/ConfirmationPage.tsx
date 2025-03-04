import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ParsedHTML from '../../components/helpers/formatters/ParsedHtml';
import MainWrapper from '../../components/BaseComponents/MainWrapper';
import setPageTitle from '../../components/helpers/setPageTitleHelpers';
import useServiceShuttered from '../../components/helpers/hooks/useServiceShuttered';
import ShutterServicePage from '../../components/AppComponents/ShutterService/ShutterServicePage';
import { formatter } from '../../components/override-sdk/template/DefaultForm/DefaultFormUtils';

declare const PCore: any;

const ConfirmationPage = ({ caseId, caseStatus, isUnAuth }) => {
  const { t } = useTranslation();
  const [documentList, setDocumentList] = useState(``);
  const [isBornAbroadOrAdopted, setIsBornAbroadOrAdopted] = useState(false);
  const [returnSlipContent, setReturnSlipContent] = useState();
  const [loading, setLoading] = useState(true);
  const serviceShuttered = useServiceShuttered();
  const [isCaseRefRequired, setIsCaseRefRequired] = useState(false);
  const refId = caseId?.replace('HMRC-CHB-WORK ', '') || '';
  const docIDForDocList = 'CR0003';
  const docIDForReturnSlip = 'CR0002';
  const locale = PCore.getEnvironmentInfo().locale.replaceAll('-', '_');
  const chbOfficeLink = 'https://www.gov.uk/child-benefit-tax-charge/your-circumstances-change';
  const lang = sessionStorage.getItem('rsdk_locale')?.substring(0, 2) || 'en';
  const sessionCaseId =
    (!sessionStorage.getItem('isNinoPresent') && sessionStorage.getItem('caseRefId')) || '';
  const referenceNumber = refId || sessionCaseId?.replace('HMRC-CHB-WORK ', '');

  function getFeedBackLink() {
    return isUnAuth
      ? 'https://www.tax.service.gov.uk/feedback/ODXCHBUA'
      : 'https://www.tax.service.gov.uk/feedback/ODXCHB';
  }

  function removeSpacesFromName(finalText, textToBeReplaced, textToBeFormatted) {
    return finalText.replaceAll(
      textToBeReplaced,
      `<span class="govuk-hidespace">${textToBeFormatted.trim()}</span>`
    );
  }

  function formatAndSetListData(listData) {
    const finalText = formatter(
      listData,
      `<span class="govuk-hidespace">`,
      `</span>`,
      removeSpacesFromName
    );
    setDocumentList(finalText);
  }
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Perform actions before the component unloads
      if (caseId && isUnAuth) {
        sessionStorage.setItem('caseRefId', caseId);
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);
  useEffect(() => {
    setPageTitle();
  }, [lang]);

  useEffect(() => {
    const options = {
      invalidateCache: true
    };
    PCore.getDataPageUtils()
      .getPageDataAsync(
        'D_DocumentContent',
        'root',
        {
          DocumentID: docIDForDocList,
          Locale: locale,
          CaseID: caseId || sessionStorage.getItem('caseRefId')
        },
        options
      )
      .then(listData => {
        if (
          listData.DocumentContentHTML.includes("data-bornabroad='true'") ||
          listData.DocumentContentHTML.includes("data-adopted='true'")
        ) {
          setIsBornAbroadOrAdopted(true);
        }
        setLoading(false);
        formatAndSetListData(listData.DocumentContentHTML);
        if (listData.DocumentContentHTML.includes('data-ninopresent="false"')) {
          setIsCaseRefRequired(true);
        } else {
          sessionStorage.setItem('isNinoPresent', 'true');
        }
      })
      .catch(err => {
        // eslint-disable-next-line no-console
        console.error(err);
      });

    PCore.getDataPageUtils()
      .getPageDataAsync(
        'D_DocumentContent',
        'root',
        {
          DocumentID: docIDForReturnSlip,
          Locale: locale,
          CaseID: caseId || sessionStorage.getItem('caseRefId')
        },
        options
      )
      .then(pageData => {
        setReturnSlipContent(pageData.DocumentContentHTML);
      })
      .catch(err => {
        // eslint-disable-next-line no-console
        console.error(err);
      })
      .finally(() => {
        PCore.getPubSubUtils().publish('staySignedInOnConfirmationScreen', {});
        //  As the document API calls are executed as last ones , we want to close container as a very
        //  last call , so we even included 2.5 seconds of time gap for execution
        setTimeout(() => {
          PCore.getContainerUtils().closeContainerItem(
            PCore.getContainerUtils().getActiveContainerItemContext('app/primary'),
            { skipDirtyCheck: true }
          );
        }, 2500);
      });
  }, []);

  const generateReturnSlip = e => {
    e.preventDefault();
    const myWindow = window.open('');
    myWindow.document.write(returnSlipContent);
  };

  const getBirthChildPanelContent = () => {
    return (
      <>
        <h1 className='govuk-panel__title'> {t('APPLICATION_RECEIVED')}</h1>
        {isUnAuth && (isCaseRefRequired || sessionCaseId) && (
          <div className='govuk-panel__body'>
            {t('YOUR_REF_NUMBER')}
            <br></br>
            <strong>{referenceNumber} </strong>
          </div>
        )}
      </>
    );
  };

  const getBirthChildBodyContent = () => {
    return (
      <>
        <p className='govuk-body'> {t('WE_HAVE_SENT_YOUR_APPLICATION')}</p>
        <h2 className='govuk-heading-m'> {t('WHAT_HAPPENS_NEXT')}</h2>
        {isUnAuth && isCaseRefRequired && <p className='govuk-body'>{t('PRINT_THIS_INFO')}</p>}
        <p className='govuk-body'>{t('WE_WILL_TELL_YOU_IN_28_DAYS')}</p>
        {!isUnAuth && (
          <>
            <p className='govuk-body'>{t('CLAIM_CONFIRMATION_HMRC_APP_NOTIFICATION')}</p>
            <p className='govuk-body'>
              {t('CLAIM_CONFIRMATION_HMRC_APP_DETAILS')}{' '}
              <a href='https://www.gov.uk/guidance/download-the-hmrc-app' className='govuk-link'>
                {t('CLAIM_CONFIRMATION_HMRC_APP_DOWNLOAD_LINK')}
              </a>{' '}
              {t('CLAIM_CONFIRMATION_TODAY')}
            </p>
          </>
        )}
        <p className='govuk-body'>
          <a href={getFeedBackLink()} className='govuk-link' target='_blank' rel='noreferrer'>
            {t('WHAT_DID_YOU_THINK_OF_THIS_SERVICE')} {t('OPENS_IN_NEW_TAB')}
          </a>
        </p>
      </>
    );
  };

  const getAdoptedOrBornAbroadPanelContent = () => {
    return (
      <>
        <h1 className='govuk-panel__title'>{t('APPLICATION_RECEIVED')}</h1>
        {isUnAuth && (isCaseRefRequired || sessionCaseId) && (
          <div className='govuk-panel__body govuk-!-margin-bottom-5'>
            {t('YOUR_REF_NUMBER')}
            <br></br>
            <strong>{referenceNumber}</strong>
          </div>
        )}
        <br />
        <div className='govuk-panel__body govuk-!-font-size-27'>
          {t('POST_YOUR_SUPPORTING_DOCUMENTS')}
        </div>
      </>
    );
  };

  const getAdoptedOrBornAbroadBodyContent = () => {
    return (
      <>
        <h2 className='govuk-heading-m'> {t('WHAT_YOU_NEED_TO_DO_NOW')} </h2>
        {isUnAuth && isCaseRefRequired && <p className='govuk-body'>{t('PRINT_THIS_INFO')}</p>}
        <p className='govuk-body'> {t('THE_INFO_YOU_HAVE_PROVIDED')}. </p>
        <ParsedHTML htmlString={documentList} />
        <p className='govuk-body'>
          {t('AFTER_YOU_HAVE')}{' '}
          <a href='' onClick={e => generateReturnSlip(e)} target='_blank' rel='noreferrer noopener'>
            {t('PRINTED_AND_SIGNED_THE_FORM')} {t('OPENS_IN_NEW_TAB')}
          </a>
          , {t('RETURN_THE_FORM_WITH')}{' '}
        </p>
        <p className='govuk-body govuk-!-font-weight-bold'>
          Child Benefit Office (GB)
          <br />
          Washington
          <br />
          NEWCASTLE UPON TYNE
          <br />
          NE88 1ZD
        </p>
        <p className='govuk-body'> {t('WE_NORMALLY_RETURN_DOCUMENTS_WITHIN')} </p>
        <p className='govuk-body'>
          <a href={getFeedBackLink()} className='govuk-link' target='_blank' rel='noreferrer'>
            {t('WHAT_DID_YOU_THINK_OF_THIS_SERVICE')} {t('OPENS_IN_NEW_TAB')}
          </a>
        </p>
      </>
    );
  };

  const getHicbcPanelContent = () => {
    return <h1 className='govuk-panel__title'>{caseStatus}</h1>;
  };

  const getHicbcBodyContent = () => {
    return (
      <>
        <h2 className='govuk-heading-m'> {t('WHAT_HAPPENS_NEXT')}</h2>
        <p className='govuk-body'>{t('HIBC_CONFIRMATION_CONFIRMATION')}</p>
        <p className='govuk-body'>{t('HIBC_CONFIRMATION_PAY_DATE')}</p>
        <p className='govuk-body'>{t('HIBC_CONFIRMATION_PAYMENT_DELIVERY_TIME')}</p>
        <h2 className='govuk-heading-m'>{t('HIBC_CONFIRMATION_CHANGE')}</h2>
        <p className='govuk-body'>
          {t('HIBC_CONFIRMATION_YOU_MUST')}{' '}
          <a href={chbOfficeLink} className='govuk-link' target='_blank' rel='noreferrer'>
            {t('HIBC_CONFIRMATION_INFORM_OF_CHANGES')}
          </a>
        </p>
        <h2 className='govuk-heading-m'>{t('HIBC_CONFIRMATION_BEFORE_YOU_GO')}</h2>
        <p className='govuk-body'>{t('HIBC_CONFIRMATION_YOUR_FEEDBACK')}</p>
        <p className='govuk-body'>
          <a href={getFeedBackLink()} className='govuk-link' target='_blank' rel='noreferrer'>
            {t('HIBC_CONFIRMATION_TAKE_SURVEY_1')}
          </a>{' '}
          {t('HIBC_CONFIRMATION_TAKE_SURVEY_2')}
        </p>
      </>
    );
  };

  const setCasetype = () => {
    if (caseStatus === undefined) {
      if (!loading && isBornAbroadOrAdopted) {
        return 'born-abroad';
      } else {
        return 'birthchild';
      }
    }
    return 'hicbc';
  };

  const getPanelContent = () => {
    switch (setCasetype()) {
      case 'birthchild':
        return getBirthChildPanelContent();
      case 'born-abroad':
        return getAdoptedOrBornAbroadPanelContent();
      case 'hicbc':
        return getHicbcPanelContent();
      default:
    }
  };

  const getBodyContent = () => {
    switch (setCasetype()) {
      case 'birthchild':
        return getBirthChildBodyContent();
      case 'born-abroad':
        return getAdoptedOrBornAbroadBodyContent();
      case 'hicbc':
        return getHicbcBodyContent();
      default:
    }
  };

  if (loading && caseStatus === undefined) {
    return null;
  } else if (serviceShuttered) {
    return <ShutterServicePage />;
  } else if (!loading && isBornAbroadOrAdopted) {
    return (
      <>
        <MainWrapper>
          <div className='govuk-panel govuk-panel--confirmation govuk-!-margin-bottom-7'>
            <h1 className='govuk-panel__title'> {t('APPLICATION_RECEIVED')}</h1>
            {isUnAuth && (isCaseRefRequired || sessionCaseId) && (
              <div className='govuk-panel__body'>
                {t('YOUR_REF_NUMBER')}
                <br></br>
                <strong>{referenceNumber}</strong>
              </div>
            )}
            <div className='govuk-panel__body'>
              <p>{t('POST_YOUR_SUPPORTING_DOCUMENTS')}</p>
            </div>
          </div>
          <h2 className='govuk-heading-m'> {t('WHAT_YOU_NEED_TO_DO_NOW')} </h2>
          {isUnAuth && isCaseRefRequired && <p className='govuk-body'>{t('PRINT_THIS_INFO')}</p>}
          <p className='govuk-body'> {t('THE_INFO_YOU_HAVE_PROVIDED')}. </p>
          <ParsedHTML htmlString={documentList} />
          <p className='govuk-body'>
            {t('AFTER_YOU_HAVE')}{' '}
            <a
              href=''
              onClick={e => generateReturnSlip(e)}
              target='_blank'
              rel='noreferrer noopener'
            >
              {t('PRINTED_AND_SIGNED_THE_FORM')} {t('OPENS_IN_NEW_TAB')}
            </a>
            , {t('RETURN_THE_FORM_WITH')}{' '}
          </p>
          <p className='govuk-body govuk-!-font-weight-bold'>
            Child Benefit Office (GB)
            <br />
            Washington
            <br />
            NEWCASTLE UPON TYNE
            <br />
            NE88 1ZD
          </p>
          <p className='govuk-body'> {t('WE_NORMALLY_RETURN_DOCUMENTS_WITHIN')} </p>
          <p className='govuk-body'>
            <a href={getFeedBackLink()} className='govuk-link' target='_blank' rel='noreferrer'>
              {t('WHAT_DID_YOU_THINK_OF_THIS_SERVICE')} {t('OPENS_IN_NEW_TAB')}
            </a>
          </p>
        </MainWrapper>
      </>
    );
  } else {
    return (
      <>
        <MainWrapper>
          <div className='govuk-panel govuk-panel--confirmation govuk-!-margin-bottom-7'>
            {getPanelContent()}
          </div>
          {getBodyContent()}
        </MainWrapper>
      </>
    );
  }
};

export default ConfirmationPage;
