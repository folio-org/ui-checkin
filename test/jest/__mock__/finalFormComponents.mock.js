import React from 'react';

jest.mock('react-final-form', () => ({
  Field: jest.fn(({
    label,
    component,
    'data-testid': testId,
    ...rest
  }) => (
    <div
      data-testid={testId}
      {...rest}
    >
      {label}
      {component()}
    </div>
  )),
}));
