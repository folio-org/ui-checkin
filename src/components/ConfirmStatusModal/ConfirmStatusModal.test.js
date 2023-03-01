import React from 'react';
import {
  render,
  screen,
  fireEvent,
} from '@testing-library/react';

import '../../../test/jest/__mock__';

import {
  Modal,
  Button,
  Checkbox,
} from '@folio/stripes/components';

import ConfirmStatusModal from './ConfirmStatusModal';
import PrintButton from '../PrintButton';

const testIds = {
  printButton: 'printButton',
};

jest.mock('../PrintButton', () => jest.fn(({ children, ...rest }) => (
  <button type="button" data-testid={testIds.printButton} {...rest}>
    {children}
  </button>
)));

const defaultProps = {
  label: 'test-label',
  message: ['test-message'],
  onConfirm: jest.fn(),
  open: true,
  onCancel: jest.fn(),
  slipTemplate: 'test-template',
  slipData: {},
  isPrintable: false,
};

const messageIds = {
  printSlip: 'ui-checkin.statusModal.printSlip',
  close: 'ui-checkin.statusModal.close',
};

describe('ConfirmStatusModal', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Initial render with default props', () => {
    beforeEach(() => {
      render(
        <ConfirmStatusModal
          {...defaultProps}
        />
      );
    });

    it('"Modal" component should be called with correct props', () => {
      const expectedProps = {
        dismissible: true,
        onClose: defaultProps.onConfirm,
        open: defaultProps.open,
        id: expect.stringContaining('confirm-status-'),
      };

      expect(Modal).toHaveBeenCalledWith(expect.objectContaining(expectedProps), {});
    });

    it('Appropriate label of "Modal" component should be rendered', () => {
      expect(screen.getByText(defaultProps.label)).toBeInTheDocument();
    });

    it('Provided messages should be displayed in "Modal" component', () => {
      expect(screen.getByText(defaultProps.message[0])).toBeInTheDocument();
    });

    it('"Checkbox" component should be called with correct props', () => {
      const expectedProps = {
        name: 'printSlip',
        onChange: expect.any(Function),
        checked: defaultProps.isPrintable,
        value: String(defaultProps.isPrintable),
      };

      expect(Checkbox).toHaveBeenCalledWith(expect.objectContaining(expectedProps), {});
    });

    it('Appropriate label of "Checkbox" component should be rendered', () => {
      expect(screen.getByText(messageIds.printSlip)).toBeInTheDocument();
    });

    it('"Close" button should be called with correct props and have correct label', () => {
      const expectedProps = {
        label: defaultProps.label,
        onClick: defaultProps.onConfirm,
        id: expect.stringMatching(/clickable-confirm-status-(.*?)-confirm/),
      };

      expect(Button).toHaveBeenCalledWith(expect.objectContaining(expectedProps), {});
    });

    it('"Close" button label should be presented in the document', () => {
      expect(screen.getByText(messageIds.close)).toBeInTheDocument();
    });
  });

  describe('When "isPrintable" true and "slipTemplate" not defined', () => {
    const props = {
      ...defaultProps,
      isPrintable: true,
      slipTemplate: undefined,
    };

    beforeEach(() => {
      render(
        <ConfirmStatusModal
          {...props}
        />
      );
    });

    it('"PrintButton" should be rendered with correct props', () => {
      const expectedProps = {
        onBeforePrint: defaultProps.onConfirm,
        onAfterPrint: defaultProps.onCancel,
        template: '',
        dataSource: defaultProps.slipData,
        id: expect.stringMatching(/clickable-confirm-status-(.*?)-confirm/),
      };

      expect(PrintButton).toHaveBeenCalledWith(expect.objectContaining(expectedProps), {});
    });

    it('"PrintButton" button label should be presented in the document', () => {
      expect(screen.getByText(messageIds.close)).toBeInTheDocument();
    });

    it('After clicking on checkbox "PrintButton" should disappear', () => {
      const printButton = screen.getByTestId(testIds.printButton);

      fireEvent.click(screen.getByText(messageIds.printSlip));

      expect(printButton).not.toBeInTheDocument();
    });
  });
});
