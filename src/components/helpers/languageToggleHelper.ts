import { i18n } from 'i18next';
import setPageTitle from './setPageTitleHelpers';
import dayjs from 'dayjs';

const languageToggle = async (lang: string, i18nRef: i18n, dataBundles: Array<string> = []) => {
  sessionStorage.setItem('rsdk_locale', `${lang}_GB`);
  dayjs.locale(lang);
  i18nRef.changeLanguage(lang).then(() => {
    setPageTitle();
  });

  if (typeof PCore !== 'undefined') {
    const { GENERIC_BUNDLE_KEY } = PCore.getLocaleUtils();

    // common bundles for all applications
    const commonBundles = [
      GENERIC_BUNDLE_KEY,
      '@BASECLASS!DATAPAGE!D_NATIONALITYLIST',
      '@BASECLASS!DATAPAGE!D_COUNTRYLISTSORTEDBYCOUNTRY'
    ];

    const resourceBundles = [...commonBundles, ...dataBundles];

    PCore.getEnvironmentInfo().setLocale(`${lang}_GB`);
    PCore.getLocaleUtils().resetLocaleStore();
    await PCore.getLocaleUtils().loadLocaleResources(resourceBundles);

    PCore.getPubSubUtils().publish('languageToggleTriggered', { language: lang, localeRef: [] });
  }
};

// Bundles  for ChB, HICBC, CoB and Start Education
const loadBundles = async (lang: string) => {
  if (typeof PCore !== 'undefined') {
    const { GENERIC_BUNDLE_KEY } = PCore.getLocaleUtils();

    const bundles = [
      GENERIC_BUNDLE_KEY,
      '@BASECLASS!DATAPAGE!D_CHBREFERENCEDATALISTBYTYPE',
      '@BASECLASS!DATAPAGE!D_SCOPEDREFERENCEDATALISTBYTYPE',
      '@BASECLASS!DATAPAGE!D_LISTREFERENCEDATABYTYPE',
      '@BASECLASS!DATAPAGE!D_NATIONALITYLIST',
      '@BASECLASS!DATAPAGE!D_COUNTRYLISTSORTEDBYCOUNTRY'
    ];

    const resourceBundles = [...bundles];

    PCore.getEnvironmentInfo().setLocale(lang);
    PCore.getLocaleUtils().resetLocaleStore();
    await PCore.getLocaleUtils().loadLocaleResources(resourceBundles);
  }
};

export default languageToggle;
export { loadBundles };
