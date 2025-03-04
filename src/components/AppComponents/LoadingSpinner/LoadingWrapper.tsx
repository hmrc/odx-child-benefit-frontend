import React, { ReactElement } from 'react';
import LoadingSpinner, { LoadingSpinnerProps } from './LoadingSpinner';

interface LoadingWrapperProps {
  pageIsLoading: boolean;
  spinnerProps: LoadingSpinnerProps;
  children: ReactElement;
}

const LoadingWrapper = ({ pageIsLoading, spinnerProps, children }: LoadingWrapperProps) => {
  return pageIsLoading ? (
    <main className='govuk-main-wrapper govuk-main-wrapper--l' role='main' id='main-content'>
      <LoadingSpinner {...spinnerProps} />
    </main>
  ) : (
    children
  );
};

export default LoadingWrapper;
