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

import RouteForDeliveryModal from './RouteForDeliveryModal';
import PrintButton from '../PrintButton';

jest.mock('../PrintButton', () => jest.fn(({ children, ...rest }) => (
  <button type="button" data-testid="print-button" {...rest}>
    {children}
  </button>
)));

const defaultProps = {
  label: 'test-label',
  modalContent: 'test-modal-content',
  open: true,
  onCloseAndCheckout: jest.fn(),
  onClose: jest.fn(),
  slipTemplate: 'test-template',
  slipData: {},
  isPrintableByDefault: false,
};

const messageIds = {
  printSlip: 'ui-checkin.statusModal.printSlip',
  close: 'ui-checkin.statusModal.close',
  closeAndCheckout: 'ui-checkin.statusModal.delivery.closeAndCheckout',
};

describe('RouteForDeliveryModal', () => {
  const buttonCallOrder = {
    closeAndCheckout: 1,
    close: 2,
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Initial render with default props', () => {
    beforeEach(() => {
      render(
        <RouteForDeliveryModal
          {...defaultProps}
        />
      );
    });

    it('"Modal" component should be called with correct props', () => {
      const expectedProps = {
        dismissible: true,
        onClose: defaultProps.onClose,
        open: defaultProps.open,
        label: defaultProps.label,
      };

      expect(Modal).toHaveBeenCalledWith(expect.objectContaining(expectedProps), {});
    });

    it('Modal content should be rendered', () => {
      expect(screen.getByText(defaultProps.modalContent)).toBeInTheDocument();
    });

    it('"Checkbox" component should be called with correct props', () => {
      const expectedProps = {
        name: 'printSlip',
        onChange: expect.any(Function),
        checked: defaultProps.isPrintableByDefault,
        value: defaultProps.isPrintableByDefault,
      };

      expect(Checkbox).toHaveBeenCalledWith(expect.objectContaining(expectedProps), {});
    });

    it('Appropriate label of "Checkbox" component should be rendered', () => {
      expect(screen.getByText(messageIds.printSlip)).toBeInTheDocument();
    });

    it('"Close and checkout" button should be called with correct props', () => {
      const expectedProps = {
        buttonStyle: 'primary',
        onClick: defaultProps.onCloseAndCheckout,
      };

      expect(Button).toHaveBeenNthCalledWith(buttonCallOrder.closeAndCheckout, expect.objectContaining(expectedProps), {});
    });

    it('"Close" button should be called with correct props', () => {
      const expectedProps = {
        buttonStyle: 'primary',
        onClick: defaultProps.onClose,
      };

      expect(Button).toHaveBeenNthCalledWith(buttonCallOrder.close, expect.objectContaining(expectedProps), {});
    });

    it('"Close and checkout" button label should be rendered in the document', () => {
      expect(screen.getByText(messageIds.closeAndCheckout)).toBeInTheDocument();
    });

    it('"Close" button label should be rendered in the document', () => {
      expect(screen.getByText(messageIds.close)).toBeInTheDocument();
    });
  });

  describe('When "isPrintableByDefault" true and "slipTemplate" not defined', () => {
    const props = {
      ...defaultProps,
      isPrintableByDefault: true,
      slipTemplate: undefined,
    };

    beforeEach(() => {
      render(
        <RouteForDeliveryModal
          {...props}
        />
      );
    });

    it('"Close and checkout" print button should be called with correct props', () => {
      const expectedProps = {
        buttonStyle: 'primary',
        onBeforePrint: defaultProps.onCloseAndCheckout,
        dataSource: defaultProps.slipData,
        template: '',
      };

      expect(PrintButton).toHaveBeenNthCalledWith(buttonCallOrder.closeAndCheckout, expect.objectContaining(expectedProps), {});
    });

    it('"Close" print button should be called with correct props', () => {
      const expectedProps = {
        buttonStyle: 'primary',
        onBeforePrint: defaultProps.onClose,
        dataSource: defaultProps.slipData,
        template: '',
      };

      expect(PrintButton).toHaveBeenNthCalledWith(buttonCallOrder.close, expect.objectContaining(expectedProps), {});
    });

    it('"Close and checkout" print button label should be rendered in the document', () => {
      expect(screen.getByText(messageIds.closeAndCheckout)).toBeInTheDocument();
    });

    it('"Close" print button label should be rendered in the document', () => {
      expect(screen.getByText(messageIds.close)).toBeInTheDocument();
    });

    it('After clicking on checkbox "PrintButton" should disappear', () => {
      const printButtons = screen.getAllByTestId('print-button');

      fireEvent.click(screen.getByText(messageIds.printSlip));

      expect(printButtons[0]).not.toBeInTheDocument();
    });
  });

  describe('When "isPrintableByDefault" true and "slipTemplate" is defined', () => {
    const props = {
      ...defaultProps,
      isPrintableByDefault: true,
    };

    beforeEach(() => {
      render(
        <RouteForDeliveryModal
          {...props}
        />
      );
    });

    it('"Close and checkout" print button should be called with correct props', () => {
      const expectedProps = {
        buttonStyle: 'primary',
        onBeforePrint: defaultProps.onCloseAndCheckout,
        dataSource: defaultProps.slipData,
        template: defaultProps.slipTemplate,
      };

      expect(PrintButton).toHaveBeenNthCalledWith(buttonCallOrder.closeAndCheckout, expect.objectContaining(expectedProps), {});
    });

    it('"Close" print button should be called with correct props', () => {
      const expectedProps = {
        buttonStyle: 'primary',
        onBeforePrint: defaultProps.onClose,
        dataSource: defaultProps.slipData,
        template: defaultProps.slipTemplate,
      };

      expect(PrintButton).toHaveBeenNthCalledWith(buttonCallOrder.close, expect.objectContaining(expectedProps), {});
    });
  });
});
