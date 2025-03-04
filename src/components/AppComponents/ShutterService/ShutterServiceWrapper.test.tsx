import React from 'react';
import { render } from '@testing-library/react';
import ShutteredServiceWrapper from './ShutteredServiceWrapper';

jest.mock('./ShutterServicePage', () => () => <div>Shutter Service Page</div>);

describe('ShutteredServiceWrapper Component', () => {
  test('renders shuttered page when serviceIsShuttered is true', async () => {
    const { findByText } = render(
      <ShutteredServiceWrapper serviceIsShuttered>
        <h1>Service is not shuttered</h1>
      </ShutteredServiceWrapper>
    );

    const shutteredServicePage = await findByText('Shutter Service Page');
    expect(shutteredServicePage).toBeInTheDocument();
  });

  test('renders children when serviceIsShuttered is false', async () => {
    const { findByText } = render(
      <ShutteredServiceWrapper serviceIsShuttered={false}>
        <h1>Content</h1>
      </ShutteredServiceWrapper>
    );

    const childElement = await findByText('Content');
    expect(childElement).toBeInTheDocument();
  });
});
