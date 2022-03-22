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
  Modal: jest.fn(({ children, label, footer, id }) => (
    <div
      id={id}
      data-testid="modal-window"
    >
      <p>{label}</p>
      {children}
      {footer}
    </div>
  )),
  ModalFooter: jest.fn(({ children }) => (
    <div>
      {children}
    </div>
  )),
  MultiColumnList: jest.fn(({ children }) => (
    <div>
      {children}
    </div>
  )),
  Row: jest.fn(({ children, ...rest }) => <div {...rest}>{children}</div>),
}));
