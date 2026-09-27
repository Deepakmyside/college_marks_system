import React from 'react';

const Skeleton = ({ className, ...props }) => {
  return (
    <div
      className={`animate-pulse rounded-md bg-[#E2E8F0] ${className || ''}`}
      {...props}
    />
  );
};

export { Skeleton };
