import React from 'react';
import { render, screen } from '@testing-library/react';
import LoadingWrapper from './LoadingWrapper';
import { LoadingSpinnerProps } from './LoadingSpinner';

jest.mock('./LoadingSpinner', () => props => <div data-test-id='loading-spinner' {...props} />);

const spinnerProps: LoadingSpinnerProps = {
  size: '50px',
  label: 'loading'
};

describe('LoadingWrapper Component', () => {
  test('renders LoadingSpinner when pageIsLoading is true', () => {
    render(
      <LoadingWrapper pageIsLoading spinnerProps={spinnerProps}>
        <h1>Page loaded</h1>
      </LoadingWrapper>
    );

    const spinner = screen.getByTestId('loading-spinner');
    expect(spinner).toBeInTheDocument();
  });

  test('renders children when pageIsLoading is false', () => {
    render(
      <LoadingWrapper pageIsLoading={false} spinnerProps={spinnerProps}>
        <div data-test-id='page-content'>Loaded content</div>
      </LoadingWrapper>
    );

    const pageContent: HTMLElement = screen.getByTestId('page-content');
    expect(pageContent).toBeInTheDocument();
    expect(pageContent).toHaveTextContent('Loaded content');
  });

  test('does not render children when pageIsLoading is true', () => {
    render(
      <LoadingWrapper pageIsLoading spinnerProps={spinnerProps}>
        <div data-testid='page-content'>Hidden content</div>
      </LoadingWrapper>
    );

    const pageContent = screen.queryByTestId('page-content');
    expect(pageContent).not.toBeInTheDocument();
  });
});
