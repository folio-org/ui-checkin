import {
  clickable,
  fillable,
  blurrable,
  interactor,
  Interactor,
  isPresent,
  text,
  scoped,
  value,
} from '@bigtest/interactor';

// eslint-disable-next-line import/no-extraneous-dependencies
import MultiColumnListInteractor from '@folio/stripes-components/lib/MultiColumnList/tests/interactor';

import DatepickerInteractor from './datepicker';
import TimepickerInteractor from './timepicker';
import ConfirmStatusModal from './confirm-status-modal';
import DeliveryModalInteractor from './delivery-modal';
import CheckinNoteModalInteractor from './checkin-note-modal';
import MultiPieceModalInteractor from './multi-piece-modal';
import ClaimedReturnedModalInteractor from './claimed-returned-modal';
import ConfrmModalInteractor from './confirm-modal';
import SelectItemModalInteractor from './select-item-modal';

import { DEFAULT_TIMEOUT } from '../constants';

@interactor class CheckInInteractor {
  homeButton = new Interactor({ scope: '#ModuleMainHeading', timeout: DEFAULT_TIMEOUT });
  processDate = new DatepickerInteractor({ scope: '[data-test-process-date]', timeout: DEFAULT_TIMEOUT });
  processTime = new TimepickerInteractor({ scope: '[data-test-process-time]', timeout: DEFAULT_TIMEOUT });
  confirmStatusModal = new ConfirmStatusModal({ scope: '[data-test-confirm-status-modal]', timeout: DEFAULT_TIMEOUT });
  multiPieceModal = new MultiPieceModalInteractor({ scope: '[data-test-multi-piece-modal]', timeout: DEFAULT_TIMEOUT });
  checkinNoteModal = new CheckinNoteModalInteractor({ timeout: DEFAULT_TIMEOUT });
  claimedReturnedModal = new ClaimedReturnedModalInteractor({ timeout: DEFAULT_TIMEOUT });
  confirmModal = new ConfrmModalInteractor({ timeout: DEFAULT_TIMEOUT });
  selectItemModal = new SelectItemModalInteractor({ timeout: DEFAULT_TIMEOUT });

  selectEllipse = clickable('[data-test-elipse-select] button');
  checkedInItemsList = scoped('#list-items-checked-in', MultiColumnListInteractor);
  selectLoanDetails = clickable('[data-test-loan-details] a');
  selectPatronDetails = clickable('[data-test-patron-details] a');
  selectItemDetails = clickable('[data-test-item-details] a');
  selectRequestDetails = clickable('[data-test-request-details] a');
  selectFeeFineDetails = clickable('[data-test-fee-fine-details] a');
  fillOutError = text('[data-test-check-in-scan] [class^="error"]');
  barcodePresent = isPresent('[data-test-check-in-barcode]');
  barcodeInputValue = value('[data-test-check-in-barcode]');
  barcodeInputIsFocused = isPresent('[data-test-check-in-barcode]:focus');
  confirmStatusModalPresent = isPresent('[data-test-confirm-status-modal]');
  confirmFeeFineOwnedStatusPresent = isPresent('[data-test-fee-fine-owned-status]');
  confirmFeeFineDetailsPresent = isPresent('[data-test-fee-fine-details] a');
  barcode = fillable('#input-item-barcode');
  blurBarcodeField = blurrable('#input-item-barcode');
  clickEnter = clickable('#clickable-add-item');
  checkedInBookTitle = text('#list-items-checked-in div[role="gridcell"]:nth-child(2)');
  checkedInTimeReturned = text('[data-test-check-in-return-time]');
  barcodeError = text('#OverlayContainer [class^="modalContent"]');
  endSession = clickable('#clickable-end-session');
  hasCheckedInItems = isPresent('#list-items-checked-in');
  clickChangeDate = clickable('[data-test-checkin-modify-date]');
  clickChangeTime = clickable('[data-test-checkin-modify-time]');
  printHoldSlipItemPresent = isPresent('[data-test-print-hold-slip]');
  printTransitSlipItemPresent = isPresent('[data-test-print-transit-slip]');
  checkinNotesPresent = isPresent('[data-test-checkin-notes]');
  checkinNotesButton= scoped('[data-test-checkin-notes] button');
  deliveryModal = new DeliveryModalInteractor({ timeout: DEFAULT_TIMEOUT });
  deliveryModalIsDisplayed = isPresent('[data-test-delivery-modal]');
  errorModal = isPresent('#OverlayContainer');
  clickCancelErrorModalBtn = clickable('[data-test-close-error-modal-button]');
  isPresentConfirmModal = isPresent('[data-test-confirm-status-modal]');
  claimedReturnedModalPresent = isPresent('[data-test-claimed-returned-modal]');

  whenItemsAreLoaded(amount) {
    return this.when(() => this.checkedInItemsList.rowCount === amount);
  }
}

export default CheckInInteractor;
