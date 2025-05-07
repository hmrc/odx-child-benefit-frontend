import React, { ReactElement } from 'react';
import ShutterServicePage from './ShutterServicePage';
import LanguageToggle from '../LanguageToggle';

interface ShutterServiceProps {
  serviceIsShuttered: boolean;
  children: ReactElement;
}

function ShutterServicePageWrapper({ serviceIsShuttered, children }: ShutterServiceProps) {
  return serviceIsShuttered ? (
    <div className='govuk-width-container'>
      <LanguageToggle />
      <ShutterServicePage />
    </div>
  ) : (
    children
  );
}

export default ShutterServicePageWrapper;
