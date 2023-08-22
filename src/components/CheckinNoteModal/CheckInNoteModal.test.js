import React from 'react';
import {
  render,
  cleanup,
  fireEvent,
} from '@folio/jest-config-stripes/testing-library/react';

import '../../../test/jest/__mock__';

import {
  Modal,
  MultiColumnList,
} from '@folio/stripes/components';

import CheckinNoteModal from './CheckinNoteModal';

const cancelLabel = 'Cancel Label';
const confirmLabel = 'Confirm Label';
const message = 'test message';
const onCancel = jest.fn();
const labelIds = {
  cancel: 'ui-checkin.statusModal.cancel',
  confirm: 'ui-checkin.statusModal.confirm',
};

const initialProps = {
  open: true,
  hideCancel: false,
  hideConfirm: false,
  id: 'id',
  notes: [],
  columnMapping: {},
  columnWidths: {},
  heading: 'Test Heading',
  onConfirm: jest.fn(),
  visibleColumns: ['test'],
  onCancel,
  cancelLabel,
  confirmLabel,
  message,
};

const renderModal = (props = initialProps) => {
  return render(
    <CheckinNoteModal
      {...props}
    />
  );
};

describe('CheckinNoteModal', () => {
  afterEach(cleanup);

  describe('Initial render with default properties', () => {
    let container;

    beforeEach(() => {
      container = renderModal();
    });

    it('"Modal" should get correct props', () => {
      const expectedProps = {
        size: 'small',
        open: initialProps.open,
        label: initialProps.heading,
        id: initialProps.id,
        dismissible: true,
        onClose: onCancel,
      };
      expect(Modal).toHaveBeenCalledWith(expect.objectContaining(expectedProps), {});
    });

    it('"MultiColumnList" should get correct props', () => {
      const expectedProps = {
        visibleColumns: initialProps.visibleColumns,
        contentData: initialProps.notes,
        columnMapping: initialProps.columnMapping,
        columnWidths: initialProps.columnWidths,
        interactive: false,
      };
      expect(MultiColumnList).toHaveBeenCalledWith(expect.objectContaining(expectedProps), {});
    });

    it('CheckInNoteModal footer should have confirm button', () => {
      expect(container.queryByText(confirmLabel)).toBeInTheDocument();
    });

    it('CheckInNoteModal footer should have cancel button', () => {
      expect(container.queryByText(cancelLabel)).toBeInTheDocument();
    });

    it('Appropriate message should be displayed in modal window', () => {
      expect(container.queryByText(message)).toBeInTheDocument();
    });
  });

  it('CheckInNoteModal footer should not have confirm button', () => {
    const container = renderModal({
      ...initialProps,
      hideConfirm: true,
    });

    expect(container.queryByText(confirmLabel)).not.toBeInTheDocument();
  });

  it('CheckInNoteModal footer should not have cancel button', () => {
    const container = renderModal({
      ...initialProps,
      hideCancel: true,
    });

    expect(container.queryByText(cancelLabel)).not.toBeInTheDocument();
  });

  it('onConfirm should be triggered after button clicking', () => {
    const container = renderModal({
      ...initialProps,
      hideCancel: true,
    });

    fireEvent.click(container.getByRole('button'));

    expect(initialProps.onConfirm).toHaveBeenCalled();
  });

  it('onCancel should be triggered after button clicking', () => {
    const container = renderModal({
      ...initialProps,
      hideConfirm: true,
    });

    fireEvent.click(container.getByRole('button'));

    expect(initialProps.onCancel).toHaveBeenCalled();
  });

  it('Should return default message if there is no "cancelLabel" property', () => {
    const container = renderModal({
      ...initialProps,
      cancelLabel: undefined,
    });

    expect(container.getByText(labelIds.cancel)).toBeInTheDocument();
  });

  it('Should return default message if there is no "confirmLabel" property', () => {
    const container = renderModal({
      ...initialProps,
      confirmLabel: undefined,
    });

    expect(container.getByText(labelIds.confirm)).toBeInTheDocument();
  });

  it('Unique id should be generated if property is not provided', () => {
    const container = renderModal({
      ...initialProps,
      id: undefined,
    });

    expect(container.getByTestId('modalWindow')
      .getAttribute('id'))
      .toContain('confirmation-');
  });
});

