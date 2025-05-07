import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { WelshLanguageToggle } from 'gds-react-component-library';
import dayjs from 'dayjs';
import 'dayjs/locale/cy';

import languageToggle from '../../helpers/languageToggleHelper';
import HideOnMobileView from '../../helpers/HideOnMobileView';

const convertLanguageCodeToString = (code: string) => {
  if (code === 'en') {
    return 'english';
  } else if (code === 'cy') {
    return 'welsh';
  }
};

const LanguageToggle = () => {
  const { i18n } = useTranslation();
  let lang = sessionStorage.getItem('rsdk_locale')?.substring(0, 2) || 'en';
  const [selectedLang, setSelectedLang] = useState(lang);

  const changeLanguage = async e => {
    e.preventDefault();
    lang = e.currentTarget.getAttribute('lang');
    setSelectedLang(lang);

    // Bundles specific for ChB, HICBC, CoB and Start Education
    const dataBundles = [
      '@BASECLASS!DATAPAGE!D_CHBREFERENCEDATALISTBYTYPE',
      '@BASECLASS!DATAPAGE!D_SCOPEDREFERENCEDATALISTBYTYPE',
      '@BASECLASS!DATAPAGE!D_LISTREFERENCEDATABYTYPE'
    ];

    await languageToggle(lang, i18n, dataBundles);
  };

  // Initialises language value in session storage, and for dayjs
  useEffect(() => {
    if (!sessionStorage.getItem('rsdk_locale')) {
      sessionStorage.setItem('rsdk_locale', `en_GB`);
      dayjs.locale('en');
    } else {
      const currentLang = sessionStorage.getItem('rsdk_locale').slice(0, 2).toLowerCase();
      dayjs.locale(currentLang);
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = selectedLang;
  }, [selectedLang]);

  return (
    <HideOnMobileView>
      <WelshLanguageToggle
        currentLanguage={convertLanguageCodeToString(selectedLang)}
        en={{ handleOnClick: changeLanguage }}
        cy={{ handleOnClick: changeLanguage }}
      />
    </HideOnMobileView>
  );
};

export default LanguageToggle;
