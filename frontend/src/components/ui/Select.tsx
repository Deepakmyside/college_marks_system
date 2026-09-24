import React from 'react';

const Select = React.forwardRef(({ className, children, ...props }, ref) => {
  return (
    <select
      ref={ref}
      className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className || ''}`}
      {...props}
    >
      {children}
    </select>
  );
});

Select.displayName = 'Select';

const SelectOption = React.forwardRef(({ className, ...props }, ref) => {
  return <option className={className || ''} {...props} />;
});

SelectOption.displayName = 'SelectOption';

export { Select, SelectOption };
