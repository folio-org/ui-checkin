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
      {children}
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
  dayjs: jest.fn(() => ({
    tz: () => ({
      format: () => {},
    }),
  })),
  Datepicker: jest.fn((props) => <div {...props} />),
  Dropdown: jest.fn(({
    renderMenu,
    renderTrigger,
  }) => (
    <div>
      {renderMenu({
        onToggle: jest.fn(),
      })}
      {renderTrigger({
        getTriggerProps: jest.fn(),
      })}
    </div>
  )),
  DropdownMenu: jest.fn(({ children }) => (
    <div>
      {children}
    </div>
  )),
  InfoPopover: jest.fn(({ content }) => <div>{content}</div>),
  Label: jest.fn(({
    htmlFor,
    id,
    children,
    ...rest
  }) => (<label htmlFor={htmlFor} id={id} {...rest}>{children}</label>)),
  Timepicker: jest.fn((props) => <div {...props} />),
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
  Layout: jest.fn(({ children }) => <div>{children}</div>),
  MCLPagingTypes: {
    PREV_NEXT: 'prev-next',
  },
  Modal: jest.fn(({ children, label, footer, id, ...rest }) => (
    <div
      id={id}
      data-testid="modalWindow"
      {...rest}
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
  MultiColumnList: jest.fn(({
    children,
    onNeedMoreData,
  }) => (
    <div>
      <button
        type="button"
        data-testid="loadMoreButton"
        onClick={onNeedMoreData}
      >
        Load more
      </button>
      {children}
    </div>
  )),
  Icon: jest.fn((props) => (<span {...props} />)),
  IconButton: jest.fn((props) => (
    <button type="button" {...props} />
  )),
  Row: jest.fn(({ children, ...rest }) => <div {...rest}>{children}</div>),
  KeyValue: jest.fn(({
    'data-testid': testId,
    label,
  }) => (
    <div data-testid={testId}>
      <div>{label}</div>
    </div>
  )),
  Pane: jest.fn(({
    paneTitle,
    children,
    ...rest
  }) => (
    <div {...rest}>
      <span>{paneTitle}</span>
      {children}
    </div>
  )),
  Paneset: jest.fn((props) => (<div {...props} />)),
  TextField: jest.fn((props) => (<input {...props} />)),
  NoValue: jest.fn(() => <span>-</span>),
}));
