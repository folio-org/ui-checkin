import React from 'react';

jest.mock('@folio/stripes/components', () => ({
  Button: jest.fn(({ children, onClick }) => (
    <button
      data-test-button
      type="button"
      onClick={onClick}
    >
      <span>
        {children}
      </span>
    </button>
  )),
  Col: jest.fn(({ children, ...rest }) => <div {...rest}>{children}</div>),
  Row: jest.fn(({ children, ...rest }) => <div {...rest}>{children}</div>),
}));
