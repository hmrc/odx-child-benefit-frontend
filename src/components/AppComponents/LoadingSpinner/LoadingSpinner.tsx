import React, { ElementType } from 'react';

export interface LoadingSpinnerProps {
  size?: string;
  topTag?: ElementType;
  bottomTag?: ElementType;
  topText?: string;
  label?: string;
  bottomText?: string;
  borderColor?: string;
  topBorderColor?: string;
}

const LoadingSpinner = ({
  size = '50px',
  label = 'loading',
  topText,
  bottomText,
  topTag = 'h1',
  bottomTag = 'h1',
  borderColor = '#dee0e2',
  topBorderColor = '#1d70b8'
}: LoadingSpinnerProps) => {
  const TopHeaderTag = topTag;
  const BottomTextTag = bottomTag;
  const AccLabel = label;
  const BorderColor = borderColor;
  const TopBorderColor = topBorderColor;

  return (
    <div className='loader-container govuk-width-container'>
      {topText && <TopHeaderTag className='govuk-heading-s'>{topText}</TopHeaderTag>}
      <div
        className='loading-spinner'
        role='status'
        style={{
          width: size,
          height: size,
          borderColor: BorderColor,
          borderTopColor: TopBorderColor
        }}
        aria-label={AccLabel}
      >
        <div className='spinner'></div>
      </div>
      {bottomText && <BottomTextTag className='govuk-heading-s'>{bottomText}</BottomTextTag>}
    </div>
  );
};

export default LoadingSpinner;
