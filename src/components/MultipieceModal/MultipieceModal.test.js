import {
  fireEvent,
  render,
  screen,
} from '@folio/jest-config-stripes/testing-library/react';

import {
  Modal,
  ModalFooter,
  Button,
  KeyValue,
} from '@folio/stripes/components';

import {
  componentPropsCheck,
  getById,
} from '../../../test/jest/helpers';

import MultipieceModal from './MultipieceModal';

describe('MultipieceModal', () => {
  const testIds = {
    multipieceModal: 'multipieceModal',
    multipieceModalFooter: 'multipieceModalFooter',
    multipieceModalConfirmButton: 'multipieceModalConfirmButton',
    multipieceModalCancelButton: 'multipieceModalCancelButton',
    numberOfPieces: 'numberOfPieces',
    descriptionOfPieces: 'descriptionOfPieces',
    numberOfMissingPieces: 'numberOfMissingPieces',
    descriptionOfmissingPieces: 'descriptionOfmissingPieces',
  };
  const labelIds = {
    multipieceModalLabel: 'ui-checkin.multipieceModal.label',
    multipieceModalCheckIn: 'ui-checkin.multipieceModal.checkIn',
    multipieceModalCancel: 'ui-checkin.multipieceModal.cancel',
    multipieceModalMessage: 'ui-checkin.multipieceModal.message',
    itemNumberOfPieces: 'ui-checkin.multipieceModal.item.numberOfPieces',
    itemDescriptionOfPieces: 'ui-checkin.multipieceModal.item.descriptionOfPieces',
    itemNumberOfMissingPieces: 'ui-checkin.multipieceModal.item.numberOfMissingPieces',
    itemDescriptionOfMissingPieces: 'ui-checkin.multipieceModal.item.descriptionOfmissingPieces',
  };
  const testOpen = false;
  const testItem = {
    title: 'testTitle',
    barcode: 'testBarcode',
    materialType: {
      name: 'testName',
    },
  };
  const testOnClose = jest.fn();
  const testOnConfirm = jest.fn();
  const testDefaultProps = {
    onClose: testOnClose,
    onConfirm: testOnConfirm,
    item: testItem,
    open: testOpen,
  };
  const missingValueMark = '';

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('with default props', () => {
    beforeEach(() => {
      render(<MultipieceModal {...testDefaultProps} />);
    });

    it('should render multipiece "Modal" component', () => {
      componentPropsCheck(Modal, testIds.multipieceModal, {
        id: 'multipiece-modal',
        size: 'small',
        dismissible: true,
        label: labelIds.multipieceModalLabel,
      }, true);
    });

    it('should render multipiece "ModalFooter" component', () => {
      componentPropsCheck(ModalFooter, testIds.multipieceModalFooter, {}, true);
    });

    it('should render multipiece modal confirm "Button" component', () => {
      componentPropsCheck(Button, testIds.multipieceModalConfirmButton, {
        buttonStyle: 'primary',
        onClick: expect.any(Function),
      }, true);
    });

    it('should render multipiece modal confirm "Button" component label', () => {
      expect(getById(testIds.multipieceModalConfirmButton).getByText(labelIds.multipieceModalCheckIn)).toBeVisible();
    });

    it('should call onConfirm callback when click on confirm button', () => {
      expect(testOnConfirm).not.toBeCalled();

      fireEvent.click(screen.getByTestId(testIds.multipieceModalConfirmButton));

      expect(testOnConfirm).toHaveBeenCalled();
    });

    it('should render multipiece modal cancel "Button" component', () => {
      componentPropsCheck(Button, testIds.multipieceModalCancelButton, {
        onClick: expect.any(Function),
      }, true);
    });

    it('should render multipiece modal cancel "Button" component label', () => {
      expect(getById(testIds.multipieceModalCancelButton).getByText(labelIds.multipieceModalCancel)).toBeVisible();
    });

    it('should call onClose callback when click on cancel button', () => {
      expect(testOnClose).not.toBeCalled();

      fireEvent.click(screen.getByTestId(testIds.multipieceModalCancelButton));

      expect(testOnClose).toHaveBeenCalled();
    });

    it('should render multipiece modal message label', () => {
      expect(screen.getByText(labelIds.multipieceModalMessage)).toBeVisible();
    });

    it('should render number of pieces "KeyValue" component', () => {
      componentPropsCheck(KeyValue, testIds.numberOfPieces, {
        label: labelIds.itemNumberOfPieces,
        value: missingValueMark,
      });
    });

    it('should render description of pieces "KeyValue" component', () => {
      componentPropsCheck(KeyValue, testIds.descriptionOfPieces, {
        label: labelIds.itemDescriptionOfPieces,
        value: missingValueMark,
      });
    });

    it('should not render number of missing pieces "KeyValue" component', () => {
      expect(screen.queryByTestId(testIds.numberOfMissingPieces)).not.toBeInTheDocument();
    });

    it('should not render description of missing pieces "KeyValue" component', () => {
      expect(screen.queryByTestId(testIds.descriptionOfmissingPieces)).not.toBeInTheDocument();
    });
  });

  describe('when item numberOfPieces is passed', () => {
    const testNumberOfPieces = '2';

    beforeEach(() => {
      render(<MultipieceModal
        {...testDefaultProps}
        item={{
          ...testItem,
          numberOfPieces: testNumberOfPieces,
        }}
      />);
    });

    it('should render number of pieces "KeyValue" component', () => {
      componentPropsCheck(KeyValue, testIds.numberOfPieces, {
        value: testNumberOfPieces,
      }, true);
    });
  });

  describe('when item descriptionOfPieces is passed', () => {
    const testDescriptionOfPieces = 'testDescriptionOfPieces';

    beforeEach(() => {
      render(<MultipieceModal
        {...testDefaultProps}
        item={{
          ...testItem,
          descriptionOfPieces: testDescriptionOfPieces,
        }}
      />);
    });

    it('should render description of pieces "KeyValue" component', () => {
      componentPropsCheck(KeyValue, testIds.descriptionOfPieces, {
        value: testDescriptionOfPieces,
      }, true);
    });
  });

  describe('when item numberOfMissingPieces is passed', () => {
    const testNumberOfMissingPieces = '2';

    beforeEach(() => {
      render(<MultipieceModal
        {...testDefaultProps}
        item={{
          ...testItem,
          numberOfMissingPieces: testNumberOfMissingPieces,
        }}
      />);
    });

    it('should render number of missing pieces "KeyValue" component', () => {
      componentPropsCheck(KeyValue, testIds.numberOfMissingPieces, {
        label: labelIds.itemNumberOfMissingPieces,
        value: testNumberOfMissingPieces,
      });
    });

    it('should render description of missing pieces "KeyValue" component', () => {
      componentPropsCheck(KeyValue, testIds.descriptionOfmissingPieces, {
        label: labelIds.itemDescriptionOfMissingPieces,
        value: missingValueMark,
      });
    });
  });

  describe('when item missingPieces is passed', () => {
    const testMissingPieces = '2';

    beforeEach(() => {
      render(<MultipieceModal
        {...testDefaultProps}
        item={{
          ...testItem,
          missingPieces: testMissingPieces,
        }}
      />);
    });

    it('should render number of missing pieces "KeyValue" component', () => {
      componentPropsCheck(KeyValue, testIds.numberOfMissingPieces, {
        label: labelIds.itemNumberOfMissingPieces,
        value: missingValueMark,
      });
    });

    it('should render description of missing pieces "KeyValue" component', () => {
      componentPropsCheck(KeyValue, testIds.descriptionOfmissingPieces, {
        label: labelIds.itemDescriptionOfMissingPieces,
        value: testMissingPieces,
      });
    });
  });
});
