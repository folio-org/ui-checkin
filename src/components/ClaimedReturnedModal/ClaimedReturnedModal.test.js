import React from 'react';
import {
  render,
  screen,
  fireEvent,
} from '@testing-library/react';

import '../../../test/jest/__mock__';

import {
  Modal,
} from '@folio/stripes/components';

import ClaimedReturnedModal from './ClaimedReturnedModal';

import { getById } from '../../../test/jest/helpers';

import { claimedReturnedResolutions } from '../../consts';

describe('ClaimedReturnedModal', () => {
  const labelIds = {
    cancel: 'ui-checkin.multipieceModal.cancel',
    found: 'ui-checkin.claimedReturnedModal.resolution.found',
    returned: 'ui-checkin.claimedReturnedModal.resolution.returned',
    label: 'ui-checkin.claimedReturnedModal.label',
    message: 'ui-checkin.claimedReturnedModal.message',
  };
  const testIds = {
    cancelButton: 'cancelButton',
    foundButton: 'foundButton',
    returnedButton: 'returnedButton',
    modalWindow: 'modalWindow',
  };
  const item = {
    title: 'testTitle',
    barcode: 'testBarcode',
    materialType: {
      name: 'testMaterialTypeName',
    },
  };
  const onCancel = jest.fn();
  const onConfirm = jest.fn();
  const open = true;
  const defaultProps = {
    item,
    onCancel,
    onConfirm,
    open,
  };

  beforeEach(() => {
    render(
      <ClaimedReturnedModal
        {...defaultProps}
      />
    );
  });

  afterEach(() => {
    Modal.mockClear();
    onCancel.mockClear();
    onConfirm.mockClear();
  });

  it('should render "Modal" label', () => {
    expect(getById(testIds.modalWindow).getByText(labelIds.label)).toBeInTheDocument();
  });

  it('should execute "Modal" with correct props', () => {
    expect(Modal).toHaveBeenCalledWith(expect.objectContaining({
      dismissible: true,
      open,
      onCancel,
    }), {});
  });

  it('should render "cancel" button', () => {
    expect(getById(testIds.cancelButton).getByText(labelIds.cancel)).toBeInTheDocument();
  });

  it('should execute correct function on "cancel" button click', () => {
    expect(onCancel).not.toBeCalled();

    fireEvent.click(screen.getByTestId(testIds.cancelButton));

    expect(onCancel).toBeCalled();
  });

  it('should render "found" button', () => {
    expect(getById(testIds.foundButton).getByText(labelIds.found)).toBeInTheDocument();
  });

  it('should execute correct function on "found" button click', () => {
    expect(onConfirm).not.toBeCalled();

    fireEvent.click(screen.getByTestId(testIds.foundButton));

    expect(onConfirm).toHaveBeenCalledWith(claimedReturnedResolutions.FOUND);
  });

  it('should render "returned" button', () => {
    expect(getById(testIds.returnedButton).getByText(labelIds.returned)).toBeInTheDocument();
  });

  it('should execute correct function on "returned" button click', () => {
    expect(onConfirm).not.toBeCalled();

    fireEvent.click(screen.getByTestId(testIds.returnedButton));

    expect(onConfirm).toHaveBeenCalledWith(claimedReturnedResolutions.RETURNED);
  });

  it('should correctly render "message"', () => {
    expect(screen.getByText(labelIds.message)).toBeInTheDocument();
  });
});
