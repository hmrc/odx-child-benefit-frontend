import { getSdkConfig, logout } from '@pega/auth/lib/sdk-auth-manager';

export const scrollToTop = () => {
  const position = document.getElementById('#main-content')?.offsetTop || 0;
  document.body.scrollTop = position;
  document.documentElement.scrollTop = position;
};

export const GBdate = date => {
  const d = String(date).split('-');
  return d.length > 1 ? `${d[2]}/${d[1]}/${d[0]}` : date;
};

export const formatCurrency = amount => {
  return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(amount);
};

export const checkErrorMsgs = (errorMsgs = [], fieldIdentity = '', fieldElement = '') => {
  return errorMsgs.find(
    element =>
      element.message.fieldId === fieldIdentity || element.message.fieldId.startsWith(fieldElement)
  );
};

export const shouldRemoveFormTagForReadOnly = (pageName: string) => {
  const arrContainerNamesFormNotRequired = ['Your date of birth'];
  return arrContainerNamesFormNotRequired.includes(pageName);
};

export const isUnAuthJourney = () => {
  if (window.PCore !== undefined) {
    const containername = PCore.getContainerUtils().getActiveContainerItemName(
      `${PCore.getConstants().APP.APP}/primary`
    );
    const context = PCore.getContainerUtils().getActiveContainerItemName(
      `${containername}/workarea`
    );
    const caseType = PCore.getStoreValue('.CaseType', 'caseInfo.content', context);
    return caseType === 'Unauth' || window.location.pathname.includes('/ua');
  }
};

export const isAuthJourney = () => {
  const containername = PCore.getContainerUtils().getActiveContainerItemName(
    `${PCore.getConstants().APP.APP}/primary`
  );
  const context = PCore.getContainerUtils().getActiveContainerItemName(`${containername}/workarea`);
  const caseType = PCore.getStoreValue('.CaseType', 'caseInfo.content', context);
  return caseType === 'Auth';
};

export const isCHBJourney = () => {
  const isAuth = isAuthJourney();
  const isUnAuth = isUnAuthJourney();
  return isAuth || isUnAuth;
};

export const isEduStartJourney = () => {
  if (window.PCore !== undefined) {
    const caseTypeName = 'HMRC-ChB-Work-EducationStart';
    const containername = PCore.getContainerUtils().getActiveContainerItemName(
      `${PCore.getConstants().APP.APP}/primary`
    );

    const caseType = PCore.getStore().getState().data[containername]?.caseInfo.caseTypeID;
    return caseType === caseTypeName || window.location.pathname.includes('/education/start');
  }
};

export const isChangeOfBankJourney = (): boolean => {
  if (window.PCore !== undefined) {
    // In the PEGA journey
    const caseTypeName = 'HMRC-ChB-Work-ChBChangeOfBank';
    const containername = PCore.getContainerUtils().getActiveContainerItemName(
      `${PCore.getConstants().APP.APP}/primary`
    );

    const caseType = PCore.getStore().getState().data[containername]?.caseInfo.caseTypeID;
    return caseType === caseTypeName || window.location.pathname.includes('/change-of-bank');
  }
};

export const getServiceShutteredStatus = async (): Promise<boolean> => {
  interface ShutteredDataPageResponse {
    data: { Shuttered: boolean };
  }
  try {
    const sdkConfig = await getSdkConfig();
    const urlConfig = new URL(
      `${sdkConfig.serverConfig.infinityRestServerUrl}/app/${sdkConfig.serverConfig.appAlias}/api/application/v2/data_views/D_ShutterLookup`
    ).href;

    let featureID: string;
    if (isUnAuthJourney()) {
      featureID = 'UnauthChB';
    } else if (isEduStartJourney()) {
      featureID = 'EdStart';
    } else if (isChangeOfBankJourney()) {
      featureID = 'ChbCoB';
    } else {
      featureID = 'ChB';
    }

    const featureType = 'Service';

    const parameters = new URLSearchParams(
      `{FeatureID: ${featureID}, FeatureType: ${featureType}}`
    );

    const url = `${urlConfig}?dataViewParameters=${parameters}`;

    const { invokeCustomRestApi } = PCore.getRestClient();

    const serviceIsShutteredResponse: ShutteredDataPageResponse = await invokeCustomRestApi(
      url,
      {
        method: 'GET',
        body: '',
        headers: '',
        withoutDefaultHeaders: false
      },
      ''
    );

    return serviceIsShutteredResponse.data.Shuttered;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log(error);
    return false;
  }
};

export const isHICBCJourney = () => {
  const containername = PCore.getContainerUtils().getActiveContainerItemName(
    `${PCore.getConstants().APP.APP}/primary`
  );
  const caseType = PCore.getStore().getState().data[containername]?.caseInfo.caseTypeID;

  return (
    caseType === 'HMRC-ChB-Work-HICBCPreference' ||
    window.location.pathname.includes('/hicbc/opt-in')
  );
};

export const isSingleEntity = (propReference: string, getPConnect) => {
  const containerName = getPConnect().getContainerName();
  const context = PCore.getContainerUtils().getActiveContainerItemContext(
    `${PCore.getConstants().APP.APP}/${containerName}`
  );

  const count = PCore.getStoreValue(
    propReference.split('[')[0],
    'caseInfo.content',
    context
  )?.length;

  if (typeof count !== 'undefined' && count === 1) return true;
};

// This method will remove redundant string separated by seperatorexport
export const removeRedundantString = (redundantString: string, separator: string = '.') => {
  const list = redundantString.split(separator);
  const newList = [];
  let uniqueString = '';
  const emailPattern = new RegExp(/\S+@\S+\.\S+/);
  const checkEmail = emailPattern.test(redundantString);
  if (list.length > 0) {
    list.forEach(item => {
      if (!newList.includes(item.trim())) {
        newList.push(item);
      }
    });
    if (newList.length > 0) {
      const separatorStr = checkEmail ? '.' : '. ';
      uniqueString = newList.map(element => element.trim()).join(separatorStr);
    }
  }
  return uniqueString;
};

export const checkStatus = () => {
  const containername = PCore.getContainerUtils().getActiveContainerItemName(
    `${PCore.getConstants().APP.APP}/primary`
  );
  const context = PCore.getContainerUtils().getActiveContainerItemName(`${containername}/workarea`);
  const status = PCore.getStoreValue('.pyStatusWork', 'caseInfo.content', context);
  return status;
};
export const triggerLogout = () => {
  let authType = 'gg';
  getSdkConfig().then(sdkConfig => {
    const sdkConfigAuth = sdkConfig.authConfig;
    authType = sdkConfigAuth.authService;
  });
  const authServiceList = {
    gg: 'GovGateway',
    'gg-dev': 'GovGateway-Dev'
  };
  const authService = authServiceList[authType];

  // If the container / case is opened then close the container on signout to prevent locking.
  const activeCase = PCore.getContainerUtils().getActiveContainerItemContext('app/primary');
  if (activeCase) {
    PCore.getContainerUtils().closeContainerItem(activeCase, { skipDirtyCheck: true });
  }

  type responseType = { URLResourcePath2: string };

  PCore.getDataPageUtils()
    .getPageDataAsync('D_AuthServiceLogout', 'root', { AuthService: authService })
    // @ts-ignore
    .then((response: unknown) => {
      const logoutUrl = (response as responseType).URLResourcePath2;

      logout().then(() => {
        if (logoutUrl) {
          // Clear previous sessioStorage values
          sessionStorage.clear();
          window.location.href = logoutUrl;
        }
      });
    });
};

export const getWorkareaContainerName = () => {
  const primaryContainer = PCore.getContainerUtils().getActiveContainerItemContext(
    `${PCore.getConstants().APP.APP}/primary`
  );
  const containerName = PCore.getContainerUtils().getActiveContainerItemName(
    `${primaryContainer}/workarea`
  );
  return containerName;
};

export const isMultipleDateInput = () => {
  const containerName = getWorkareaContainerName();
  const formEditablefields = PCore.getFormUtils().getEditableFields(containerName);
  if (formEditablefields?.length > 1) {
    return formEditablefields.filter(field => field.type.toLowerCase() === 'date').length > 1;
  }
  return false;
};

export const getClaimsCaseId = () => {
  const context = PCore.getContainerUtils().getActiveContainerItemName(
    `${PCore.getConstants().APP.APP}/primary`
  );
  const caseId = PCore.getStoreValue('.ID', 'caseInfo', context) || '';
  return caseId;
};
