import React from 'react';

jest.mock('@folio/stripes/components', () => ({
  Button: jest.fn(({
    children,
    onClick,
    'data-testid': testId,
    ...rest
  }) => (
    <button
      data-test-button
      data-testid={testId}
      type="button"
      onClick={onClick}
      {...rest}
    >
      <span>
        {children}
      </span>
    </button>
  )),
  Checkbox: jest.fn((props) => (
    <label htmlFor="id">
      {props.label}
      <input id="id" type="checkbox" {...props} />
    </label>
  )),
  Col: jest.fn(({ children, ...rest }) => <div {...rest}>{children}</div>),
  ConfirmationModal: jest.fn(({
    heading,
    message,
    onCancel,
    onConfirm,
    cancelLabel,
    confirmLabel,
    ...rest
  }) => (
    <div data-testid="confirmationModal" {...rest}>
      <span>{heading}</span>
      <span>{message}</span>
      <button type="button" onClick={onCancel}>{cancelLabel || 'Cancel'}</button>
      <button type="button" onClick={onConfirm}>{confirmLabel || 'Confirm'}</button>
    </div>
  )),
  FormattedDate: jest.fn(({ value }) => (
    <div data-testid>
      {value}
    </div>
  )),
  FormattedTime: jest.fn(({ value }) => (
    <div>
      {value}
    </div>
  )),
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
  KeyValue: jest.fn(({ 'data-testid': testId }) => <div data-testid={testId} />),
}));
