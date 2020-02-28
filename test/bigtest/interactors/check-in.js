import {
  clickable,
  fillable,
  interactor,
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
import MissingItemModalInteractor from './missing-item-modal';
import MultiPieceModalInteractor from './multi-piece-modal';
import DeclaredLostModalInteractor from './declared-lost-modal';

@interactor class CheckInInteractor {
  processDate = new DatepickerInteractor('[data-test-process-date]');
  processTime = new TimepickerInteractor('[data-test-process-time]');
  confirmModal = new ConfirmStatusModal('[data-test-confirm-status-modal]');
  multiPieceModal = new MultiPieceModalInteractor('[data-test-multi-piece-modal]');
  missingItemModal = new MissingItemModalInteractor();
  checkinNoteModal = new CheckinNoteModalInteractor();
  declaredLostModal = new DeclaredLostModalInteractor();
  selectEllipse = clickable('[data-test-elipse-select] button');
  checkedInItemsList = scoped('#list-items-checked-in', MultiColumnListInteractor);
  selectLoanDetails = clickable('[data-test-loan-details] a');
  selectPatronDetails = clickable('[data-test-patron-details] a');
  selectItemDetails = clickable('[data-test-item-details] a');
  selectFeeFineDetails = clickable('[data-test-fee-fine-details] a');
  fillOutError = text('[data-test-check-in-scan] [class^="feedbackError"]');
  barcodePresent = isPresent('[data-test-check-in-barcode]');
  barcodeInputValue = value('[data-test-check-in-barcode]');
  barcodeInputIsFocused = isPresent('[data-test-check-in-barcode]:focus');
  confirmStatusModalPresent = isPresent('[data-test-confirm-status-modal]');
  confirmFeeFineOwnedStatusPresent = isPresent('[data-test-fee-fine-owned-status]');
  barcode = fillable('#input-item-barcode');
  clickEnter = clickable('#clickable-add-item');
  checkedInBookTitle = text('#list-items-checked-in div[role="gridcell"]:nth-child(2)');
  checkedInTimeReturned = text('[data-test-check-in-return-time]');
  barcodeError = text('#OverlayContainer [class^="modalContent"]>span');
  endSession = clickable('#clickable-end-session');
  hasCheckedInItems = isPresent('#list-items-checked-in');
  clickChangeDate = clickable('[data-test-checkin-modify-date]');
  clickChangeTime = clickable('[data-test-checkin-modify-time]');
  printHoldSlipItemPresent = isPresent('[data-test-print-hold-slip]');
  printTransitSlipItemPresent = isPresent('[data-test-print-transit-slip]');
  checkinNotesPresent = isPresent('[data-test-checkin-notes]');
  checkinNotesButton= scoped('[data-test-checkin-notes] button');
  deliveryModal = new DeliveryModalInteractor();
  deliveryModalIsDisplayed = isPresent('[data-test-delivery-modal]');
  errorModal = isPresent('#OverlayContainer');
  clickCancelErrorModalBtn = clickable('[data-test-close-error-modal-button]');
  isPresentConfirmModal = isPresent('[data-test-confirm-status-modal]');

  whenItemsAreLoaded(amount) {
    return this.when(() => this.checkedInItemsList.rowCount === amount);
  }
}

export default CheckInInteractor;
