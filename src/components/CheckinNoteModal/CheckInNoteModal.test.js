import React from 'react';
import {
  render,
  cleanup,
  fireEvent,
} from '@testing-library/react';

import '../../../test/jest/__mock__';

import CheckinNoteModal from './CheckinNoteModal';

const cancelLabel = 'Cancel Label';
const confirmLabel = 'Confirm Label';

const initialProps = {
  open: true,
  hideCancel: false,
  hideConfirm: false,
  id: 'id',
  message: 'test message',
  notes: [],
  heading: 'Test Heading',
  onConfirm: jest.fn(),
  onCancel: jest.fn(),
  cancelLabel,
  confirmLabel,
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

    it('CheckInNoteModal should be rendered if "open" property is true', () => {
      expect(container.getByTestId('modal-window')).toBeInTheDocument();
    });

    it('CheckInNoteModal footer should have confirm and cancel buttons', () => {
      expect(container.queryByText(confirmLabel)).toBeInTheDocument();
      expect(container.queryByText(cancelLabel)).toBeInTheDocument();
    });
  });

  it('CheckInNoteModal should not be rendered if "open" property is false', () => {
    const container = renderModal({
      ...initialProps,
      open: false,
    });

    expect(container.queryByTestId('modal-window')).not.toBeInTheDocument();
  });

  it('CheckInNoteModal footer should not have confirm and cancel buttons', () => {
    const container = renderModal({
      ...initialProps,
      hideCancel: true,
      hideConfirm: true,
    });

    expect(container.queryByText(confirmLabel)).not.toBeInTheDocument();
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

  it('should return default messages if there are no "cancelLabel" and "confirmLabel" properties', () => {
    const container = renderModal({
      ...initialProps,
      cancelLabel: undefined,
      confirmLabel: undefined,
    });

    expect(container.getByText('ui-checkin.statusModal.cancel')).toBeInTheDocument();
    expect(container.getByText('ui-checkin.statusModal.confirm')).toBeInTheDocument();
  });

  it('unique id should be generated if property is not provided', () => {
    const container = renderModal({
      ...initialProps,
      id: undefined,
    });

    expect(container.getByTestId('modal-window')
      .getAttribute('id'))
      .toContain('confirmation-');
  });
});

