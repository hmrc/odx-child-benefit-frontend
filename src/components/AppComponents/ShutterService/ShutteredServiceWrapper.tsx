import React, { ReactElement } from 'react';
import ShutterServicePage from './ShutterServicePage';

interface ShutterServiceProps {
  serviceIsShuttered: boolean;
  children: ReactElement;
}

function ShutterServicePageWrapper({ serviceIsShuttered, children }: ShutterServiceProps) {
  return serviceIsShuttered ? (
    <div className='govuk-width-container'>
      <ShutterServicePage />
    </div>
  ) : (
    children
  );
}

export default ShutterServicePageWrapper;
