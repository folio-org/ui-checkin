import {
  render,
  screen,
  fireEvent,
} from '@folio/jest-config-stripes/testing-library/react';

import {
  Modal,
  Button,
} from '@folio/stripes/components';

import InHouseUseConfirmModal from './InHouseUseConfirmModal';

const labelIds = {
  title: 'ui-checkin.inHouseUseConfirmModal.title',
  message: 'ui-checkin.inHouseUseConfirmModal.message',
  checkIn: 'ui-checkin.inHouseUseConfirmModal.checkIn',
  cancel: 'ui-checkin.inHouseUseConfirmModal.cancel',
};

const testIds = {
  modal: 'inHouseUseConfirmModal',
  confirmButton: 'inHouseUseConfirmButton',
  cancelButton: 'inHouseUseCancelButton',
};

describe('InHouseUseConfirmModal', () => {
  const onConfirm = jest.fn();
  const onCancel = jest.fn();
  const confirmButtonRef = { current: { focus: jest.fn() } };

  const defaultProps = {
    open: true,
    onConfirm,
    onCancel,
    confirmButtonRef,
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('when rendered with default props', () => {
    beforeEach(() => {
      render(<InHouseUseConfirmModal {...defaultProps} />);
    });

    it('renders the modal', () => {
      expect(screen.getByTestId(testIds.modal)).toBeInTheDocument();
    });

    it('renders the modal title', () => {
      expect(screen.getByText(labelIds.title)).toBeInTheDocument();
    });

    it('renders the modal body message', () => {
      expect(screen.getByText(labelIds.message)).toBeInTheDocument();
    });

    it('renders the confirm button', () => {
      expect(screen.getByTestId(testIds.confirmButton)).toBeInTheDocument();
    });

    it('renders the confirm button label', () => {
      expect(screen.getByText(labelIds.checkIn)).toBeInTheDocument();
    });

    it('renders the cancel button', () => {
      expect(screen.getByTestId(testIds.cancelButton)).toBeInTheDocument();
    });

    it('renders the cancel button label', () => {
      expect(screen.getByText(labelIds.cancel)).toBeInTheDocument();
    });

    it('calls "Modal" with correct props', () => {
      expect(Modal).toHaveBeenCalledWith(
        expect.objectContaining({
          'data-testid': testIds.modal,
          open: true,
          size: 'small',
          restoreFocus: false,
          onOpen: expect.any(Function),
        }),
        {}
      );
    });

    it('calls confirm "Button" with correct props', () => {
      expect(Button).toHaveBeenCalledWith(
        expect.objectContaining({
          'data-testid': testIds.confirmButton,
          buttonStyle: 'primary',
          onClick: onConfirm,
        }),
        {}
      );
    });

    it('calls cancel "Button" with correct props', () => {
      expect(Button).toHaveBeenCalledWith(
        expect.objectContaining({
          'data-testid': testIds.cancelButton,
          onClick: onCancel,
        }),
        {}
      );
    });

    it('calls "onConfirm" when confirm button is clicked', () => {
      fireEvent.click(screen.getByTestId(testIds.confirmButton));

      expect(onConfirm).toHaveBeenCalledTimes(1);
    });

    it('calls "onCancel" when cancel button is clicked', () => {
      fireEvent.click(screen.getByTestId(testIds.cancelButton));

      expect(onCancel).toHaveBeenCalledTimes(1);
    });
  });

  describe('when "open" is false', () => {
    it('calls "Modal" with open set to false', () => {
      render(<InHouseUseConfirmModal {...defaultProps} open={false} />);

      expect(Modal).toHaveBeenCalledWith(
        expect.objectContaining({ open: false }),
        {}
      );
    });
  });

  describe('"onOpen" callback', () => {
    it('focuses the confirm button ref', () => {
      render(<InHouseUseConfirmModal {...defaultProps} />);

      const { onOpen } = Modal.mock.calls[0][0];

      onOpen();

      expect(confirmButtonRef.current.focus).toHaveBeenCalledTimes(1);
    });

    it('does not throw when "confirmButtonRef.current" is null', () => {
      render(
        <InHouseUseConfirmModal
          {...defaultProps}
          confirmButtonRef={{ current: null }}
        />
      );

      const { onOpen } = Modal.mock.calls[0][0];

      expect(() => onOpen()).not.toThrow();
    });
  });
});
