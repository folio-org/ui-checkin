import {
  render,
  screen,
  fireEvent,
} from '@folio/jest-config-stripes/testing-library/react';

import {
  Modal,
  Button,
  Checkbox,
} from '@folio/stripes/components';

import RouteForDeliveryModal from './RouteForDeliveryModal';
import PrintButton from '../PrintButton';
import { focusModalPrimaryButton } from '../../util';

jest.mock('../PrintButton', () => jest.fn(({ children, ...rest }) => (
  <button type="button" {...rest}>
    {children}
  </button>
)));

jest.mock('../../util', () => ({
  ...jest.requireActual('../../util'),
  focusModalPrimaryButton: jest.fn(),
}));

const defaultProps = {
  label: 'test-label',
  modalContent: 'test-modal-content',
  open: true,
  onCloseAndCheckout: jest.fn(),
  onClose: jest.fn(),
  onAfterPrint: jest.fn(),
  slipTemplate: 'test-template',
  slipData: {},
  isPrintableByDefault: false,
};

const testIds = {
  closeAndCheckout: 'closeAndCheckoutPrintButton',
  close: 'closeButton',
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
        onAfterPrint: defaultProps.onAfterPrint,
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

    it('After clicking on checkbox "PrintButtons" should disappear', () => {
      const closeAndCheckoutPrintButton = screen.getByTestId(testIds.closeAndCheckout);
      const closePrintButton = screen.getByTestId(testIds.close);

      fireEvent.click(screen.getByText(messageIds.printSlip));

      expect(closeAndCheckoutPrintButton).not.toBeInTheDocument();
      expect(closePrintButton).not.toBeInTheDocument();
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
        onAfterPrint: defaultProps.onAfterPrint,
        dataSource: defaultProps.slipData,
        template: defaultProps.slipTemplate,
      };

      expect(PrintButton).toHaveBeenNthCalledWith(buttonCallOrder.close, expect.objectContaining(expectedProps), {});
    });
  });
});

describe('RouteForDeliveryModal focus management', () => {
  // closeAndCheckout = 1st PrintButton call, close = 2nd PrintButton call
  const printButtonCallOrder = {
    closeAndCheckout: 1,
    close: 2,
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should pass restoreFocus={false} to Modal to prevent stripes built-in focus restoration on close', () => {
    // restoreFocus={false} is required so that stripes' Modal does not move focus
    // back to whatever triggered the modal when it closes. Focus restoration is
    // handled manually via setTimeout(setFocusInput, 0) in Scan.onModalClose.
    render(<RouteForDeliveryModal {...defaultProps} />);

    expect(Modal).toHaveBeenCalledWith(
      expect.objectContaining({ restoreFocus: false }),
      {}
    );
  });

  it('should pass onOpen handler to Modal', () => {
    // onOpen fires after the modal's own focus management has run, making it the
    // correct place to focus the primary button (autoFocus on footer buttons is
    // overwritten by Modal's internal focus logic).
    render(<RouteForDeliveryModal {...defaultProps} />);

    expect(Modal).toHaveBeenCalledWith(
      expect.objectContaining({ onOpen: expect.any(Function) }),
      {}
    );
  });

  it('should call focusModalPrimaryButton when modal opens', () => {
    // Simulate the onOpen callback that Modal invokes after mounting.
    // It should delegate to the shared focusModalPrimaryButton utility.
    render(<RouteForDeliveryModal {...defaultProps} />);

    const { onOpen } = Modal.mock.calls[0][0];

    onOpen();

    expect(focusModalPrimaryButton).toHaveBeenCalledTimes(1);
  });

  describe('When isPrintableByDefault is true', () => {
    it('should pass onAfterPrint to the "Close" PrintButton so focus is restored after the print dialog closes', () => {
      // onAfterPrint fires after the OS print dialog is dismissed — the only correct
      // moment to restore focus. onBeforePrint (which calls onClose/onModalClose) fires
      // before the dialog opens, so any focus call there expires while the dialog is
      // still open. Passing onAfterPrint={handleOnAfterPrint} from Scan ensures focus
      // returns to the barcode input after printing.
      render(
        <RouteForDeliveryModal
          {...defaultProps}
          isPrintableByDefault
        />
      );

      expect(PrintButton).toHaveBeenNthCalledWith(
        printButtonCallOrder.close,
        expect.objectContaining({ onAfterPrint: defaultProps.onAfterPrint }),
        {}
      );
    });

    it('should not pass onAfterPrint to the "Close and checkout" PrintButton (navigation handles focus)', () => {
      // The "Close and checkout" button redirects to /checkout, so focus restoration
      // to the barcode input is not needed — navigation replaces the page.
      render(
        <RouteForDeliveryModal
          {...defaultProps}
          isPrintableByDefault
        />
      );

      const closeAndCheckoutCall = PrintButton.mock.calls[printButtonCallOrder.closeAndCheckout - 1][0];

      expect(closeAndCheckoutCall.onAfterPrint).toBeUndefined();
    });
  });
});
