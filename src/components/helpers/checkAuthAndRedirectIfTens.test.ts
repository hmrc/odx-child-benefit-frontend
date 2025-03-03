import checkAuthAndRedirectIfTens from './checkAuthAndRedirectIfTens';

describe('checkAuthAndRedirectIfTens', () => {
  const mockGetPageDataAsync = jest.fn();
  const mockRedirect = jest.fn();

  const currentPageURL = 'www.currentPageUrl.com';

  beforeEach(() => {
    // Mocking PCore.getDataPageUtils().getPageDataAsync
    (window as any).PCore = {
      getDataPageUtils: jest.fn(() => ({
        getPageDataAsync: mockGetPageDataAsync
      }))
    };

    // Mocking window.location.replace
    Object.defineProperty(window, 'location', {
      value: { replace: mockRedirect, href: currentPageURL },
      writable: true
    });
  });

  afterEach(() => {
    jest.clearAllMocks(); // Clear mocks after each test
  });

  describe('Tens check carried out', () => {
    test('should redirect when IsNormalAuthentication is false and PostAuthAction is TENS', async () => {
      mockGetPageDataAsync.mockResolvedValue({
        IsNormalAuthentication: false,
        PostAuthAction: 'TENS'
      });
      jest.spyOn(window.localStorage, 'setItem');

      const result = await checkAuthAndRedirectIfTens();

      expect(mockRedirect).toHaveBeenCalledWith(
        `https://www.tax.service.gov.uk/protect-tax-info?redirectUrl=${currentPageURL}`
      );
      expect(result).toBe(true);
    });
  });

  describe('No tens check', () => {
    test('should not redirect when IsNormalAuthentication is false and PostAuthAction is not TENS', async () => {
      mockGetPageDataAsync.mockResolvedValue({
        IsNormalAuthentication: false,
        PostAuthAction: 'Other'
      });

      const result = await checkAuthAndRedirectIfTens();

      expect(mockRedirect).not.toHaveBeenCalled();
      expect(result).toBe(false);
    });

    test('should not redirect ifIsNormalAuthentication is true', async () => {
      mockGetPageDataAsync.mockResolvedValue({
        IsNormalAuthentication: true
      });

      const result = await checkAuthAndRedirectIfTens();

      expect(mockRedirect).not.toHaveBeenCalled();
      expect(result).toBe(false);
    });

    test('should not do a redirect if there is an error getting the data page', async () => {
      mockGetPageDataAsync.mockRejectedValue({
        Error: true
      });

      const result = await checkAuthAndRedirectIfTens();

      expect(mockRedirect).not.toHaveBeenCalled();
      expect(result).toBe(false);
    });
  });
});
