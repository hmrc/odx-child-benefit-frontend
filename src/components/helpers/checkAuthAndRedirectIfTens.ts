interface DataPageResponse {
  IsNormalAuthentication: boolean;
  PostAuthAction?: string;
}

const TensCheckRequired = async (): Promise<boolean> => {
  const dataPage: Promise<DataPageResponse> = PCore.getDataPageUtils().getPageDataAsync(
    'D_PostCitizenAuthAction',
    'root'
  ) as Promise<DataPageResponse>;
  try {
    const dataResponse: DataPageResponse = await dataPage;
    return (
      dataResponse?.IsNormalAuthentication === false && dataResponse?.PostAuthAction === 'TENS'
    );
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log(error);
    return false;
  }
};

async function checkAuthAndRedirectIfTens(): Promise<boolean> {
  const TensRequired: boolean = await TensCheckRequired();
  if (TensRequired) {
    const currentPage: string = window.location.href;
    window.location.replace(
      `https://www.tax.service.gov.uk/protect-tax-info?redirectUrl=${currentPage}`
    ); // This will not work in Dev as this is only available in prod
  }
  return TensRequired;
}

export default checkAuthAndRedirectIfTens;
