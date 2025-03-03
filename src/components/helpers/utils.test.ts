import {
  isChangeOfBankJourney,
  isEduStartJourney,
  isHICBCJourney,
  isUnAuthJourney,
  removeRedundantString
} from './utils';

jest.mock('@pega/auth/lib/sdk-auth-manager', () => ({
  getSdkConfig: jest.fn()
}));

(window as any).PCore = {
  getContainerUtils: jest.fn(),
  getConstants: jest.fn(),
  getStore: jest.fn(),
  getRestClient: jest.fn(),
  getStoreValue: jest.fn()
};

describe('removeRedundantString', () => {
  it('should remove redundant strings - empty string', () => {
    const testRedundantString = '';
    const result = removeRedundantString(testRedundantString);

    expect(result).toBe('');
  });

  it('should remove redundant strings - multiple emails', () => {
    const testRedundantString = 'test@email.com. test2@email.com';
    const result = removeRedundantString(testRedundantString);

    expect(result).toBe('test@email.com.test2@email');
  });

  it('should remove redundant strings - 1 character', () => {
    const testRedundantString = 't';
    const result = removeRedundantString(testRedundantString);

    expect(result).toBe('t');
  });

  it('should remove redundant strings - serparated by a comma', () => {
    const testRedundantString = 'test@email.com,  test2@email.com';
    const result = removeRedundantString(testRedundantString, ',');

    expect(result).toBe('test@email.com.test2@email.com');
  });
});

describe('isHICBCJourney', () => {
  beforeEach(() => {
    (PCore.getContainerUtils as jest.Mock).mockReturnValue({
      getActiveContainerItemName: jest.fn().mockReturnValue('primaryContainer')
    });

    (PCore.getConstants as jest.Mock).mockReturnValue({
      APP: { APP: 'app' }
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return true if caseType is "HMRC-ChB-Work-HICBCPreference"', () => {
    (PCore.getStore as jest.Mock).mockReturnValue({
      getState: jest.fn().mockReturnValue({
        data: {
          primaryContainer: {
            caseInfo: {
              caseTypeID: 'HMRC-ChB-Work-HICBCPreference'
            }
          }
        }
      })
    });

    Object.defineProperty(window, 'location', {
      value: { pathname: '/child-benefit/make_a_claim/test/different' },
      writable: true
    });

    const result = isHICBCJourney();
    expect(result).toBe(true);
  });

  it('should return true if caseType is something else and location is /hicbc/optin', () => {
    (PCore.getStore as jest.Mock).mockReturnValue({
      getState: jest.fn().mockReturnValue({
        data: {
          primaryContainer: {
            caseInfo: {
              caseTypeID: 'SomeOtherType'
            }
          }
        }
      })
    });

    Object.defineProperty(window, 'location', {
      value: { pathname: '/child-benefit/make_a_claim/test/hicbc/opt-in' },
      writable: true
    });

    const result = isHICBCJourney();
    expect(result).toBe(true);
  });

  it('should return false if caseType is something else and location is not /hicbc/optin', () => {
    (PCore.getStore as jest.Mock).mockReturnValue({
      getState: jest.fn().mockReturnValue({
        data: {
          primaryContainer: {
            caseInfo: {
              caseTypeID: 'SomeOtherType'
            }
          }
        }
      })
    });

    Object.defineProperty(window, 'location', {
      value: { pathname: '/child-benefit/make_a_claim/test/change-of-bank' },
      writable: true
    });

    const result = isHICBCJourney();
    expect(result).toBe(false);
  });
});

describe('isChangeOfBankJourney', () => {
  beforeEach(() => {
    (PCore.getContainerUtils as jest.Mock).mockReturnValue({
      getActiveContainerItemName: jest.fn().mockReturnValue('primaryContainer')
    });

    (PCore.getConstants as jest.Mock).mockReturnValue({
      APP: { APP: 'app' }
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return true if caseType is "HMRC-ChB-Work-ChBChangeOfBank"', () => {
    (PCore.getStore as jest.Mock).mockReturnValue({
      getState: jest.fn().mockReturnValue({
        data: {
          primaryContainer: {
            caseInfo: {
              caseTypeID: 'HMRC-ChB-Work-ChBChangeOfBank'
            }
          }
        }
      })
    });

    Object.defineProperty(window, 'location', {
      value: { pathname: '/child-benefit/make_a_claim/test/different' },
      writable: true
    });

    const result = isChangeOfBankJourney();
    expect(result).toBe(true);
  });

  it('should return true if caseType is something else and location is /change-of-bank', () => {
    (PCore.getStore as jest.Mock).mockReturnValue({
      getState: jest.fn().mockReturnValue({
        data: {
          primaryContainer: {
            caseInfo: {
              caseTypeID: 'SomeOtherType'
            }
          }
        }
      })
    });

    Object.defineProperty(window, 'location', {
      value: { pathname: '/child-benefit/make_a_claim/test/change-of-bank' },
      writable: true
    });

    const result = isChangeOfBankJourney();
    expect(result).toBe(true);
  });

  it('should return false if caseType is something else and location is not /change-of-bank', () => {
    (PCore.getStore as jest.Mock).mockReturnValue({
      getState: jest.fn().mockReturnValue({
        data: {
          primaryContainer: {
            caseInfo: {
              caseTypeID: 'SomeOtherType'
            }
          }
        }
      })
    });

    Object.defineProperty(window, 'location', {
      value: { pathname: '/child-benefit/make_a_claim/test/hicbc/opt-in' },
      writable: true
    });

    const result = isChangeOfBankJourney();
    expect(result).toBe(false);
  });
});

describe('isEduStartJourney', () => {
  beforeEach(() => {
    (PCore.getContainerUtils as jest.Mock).mockReturnValue({
      getActiveContainerItemName: jest.fn().mockReturnValue('primaryContainer')
    });

    (PCore.getConstants as jest.Mock).mockReturnValue({
      APP: { APP: 'app' }
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return true if caseType is "HMRC-ChB-Work-EducationStart"', () => {
    (PCore.getStore as jest.Mock).mockReturnValue({
      getState: jest.fn().mockReturnValue({
        data: {
          primaryContainer: {
            caseInfo: {
              caseTypeID: 'HMRC-ChB-Work-EducationStart'
            }
          }
        }
      })
    });

    Object.defineProperty(window, 'location', {
      value: { pathname: '/child-benefit/make_a_claim/test/different' },
      writable: true
    });

    const result = isEduStartJourney();
    expect(result).toBe(true);
  });

  it('should return true if caseType is something else and location is /education/start', () => {
    (PCore.getStore as jest.Mock).mockReturnValue({
      getState: jest.fn().mockReturnValue({
        data: {
          primaryContainer: {
            caseInfo: {
              caseTypeID: 'SomeOtherType'
            }
          }
        }
      })
    });

    Object.defineProperty(window, 'location', {
      value: { pathname: '/child-benefit/make_a_claim/test/education/start' },
      writable: true
    });

    const result = isEduStartJourney();
    expect(result).toBe(true);
  });

  it('should return false if caseType is something else and location is not /education/start', () => {
    (PCore.getStore as jest.Mock).mockReturnValue({
      getState: jest.fn().mockReturnValue({
        data: {
          primaryContainer: {
            caseInfo: {
              caseTypeID: 'SomeOtherType'
            }
          }
        }
      })
    });

    Object.defineProperty(window, 'location', {
      value: { pathname: '/child-benefit/make_a_claim/test/hicbc/opt-in' },
      writable: true
    });

    const result = isEduStartJourney();
    expect(result).toBe(false);
  });
});

describe('isUnAuthJourney', () => {
  beforeEach(() => {
    (PCore.getContainerUtils as jest.Mock).mockReturnValue({
      getActiveContainerItemName: jest.fn().mockReturnValue('primaryContainer')
    });

    (PCore.getConstants as jest.Mock).mockReturnValue({
      APP: { APP: 'app' }
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return true if caseType is "Unauth"', () => {
    (PCore.getStoreValue as jest.Mock).mockReturnValue('Unauth');

    Object.defineProperty(window, 'location', {
      value: { pathname: '/child-benefit/make_a_claim/test/different' },
      writable: true
    });

    const result = isUnAuthJourney();
    expect(result).toBe(true);
  });

  it('should return true if caseType is something else and location is /ua', () => {
    (PCore.getStoreValue as jest.Mock).mockReturnValue('SomeOther');

    Object.defineProperty(window, 'location', {
      value: { pathname: '/child-benefit/make_a_claim/test/ua' },
      writable: true
    });

    const result = isUnAuthJourney();
    expect(result).toBe(true);
  });

  it('should return false if caseType is something else and location is not /ua', () => {
    (PCore.getStoreValue as jest.Mock).mockReturnValue('SomeOther');

    Object.defineProperty(window, 'location', {
      value: { pathname: '/child-benefit/make_a_claim/test/hicbc/opt-in' },
      writable: true
    });

    const result = isUnAuthJourney();
    expect(result).toBe(false);
  });
});
