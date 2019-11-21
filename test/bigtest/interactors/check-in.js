import {
  blurrable,
  clickable,
  fillable,
  interactor,
  isPresent,
  text,
  triggerable,
  property,
  scoped,
  collection,
  value,
} from '@bigtest/interactor';

// eslint-disable-next-line import/no-extraneous-dependencies
import MultiColumnListInteractor from '@folio/stripes-components/lib/MultiColumnList/tests/interactor';

@interactor class DatepickerInteractor {
  clickInput = clickable('input');
  fillInput = fillable('input');
  blurInput = blurrable('input');

  pressEnter = triggerable('keydown', {
    bubbles: true,
    cancelable: true,
    keyCode: 13
  });

  fillAndBlur(date) {
    return this
      .clickInput()
      .fillInput(date)
      .pressEnter()
      .blurInput();
  }
}

@interactor class TimepickerInteractor {
  fillInput = fillable('input');
}

@interactor class ConfirmStatusModal {
  clickPrintHoldCheckbox = clickable('[data-test-print-slip-checkbox]');
  clickConfirmButton = clickable('[data-test-confirm-button]');

  isPrintTransitChecked = property('[data-test-print-slip-checkbox]', 'checked');
}

@interactor class MultiPieceModalInteractor {
  present = isPresent('[data-test-checkin-button]');
  clickCheckinBtn = clickable('[data-test-checkin-button]');
}

@interactor class MissingItemModalInteractor {
  present = isPresent('[data-test-confirmation-modal-confirm-button]');
  clickConfirm = clickable('[data-test-confirmation-modal-confirm-button]');
}
@interactor class CheckinNoteInteractor {
  name = text('[data-test-check-in-note-name]');
  date = text('[data-test-check-in-note-date]');
  source = text('[data-test-check-in-note-source]');
}

@interactor class CheckinNoteModalInteractor {
  defaultScope = '[data-test-check-in-note-modal]';

  checkinNotes = collection('[data-test-check-in-note-modal] [class^="mclRow--"]', CheckinNoteInteractor);
  present = isPresent('[data-test-checkin-note-modal-confirm-button]');
  clickConfirm = clickable('[data-test-checkin-note-modal-confirm-button]');
}

@interactor class DeliveryModalInteractor {
  defaultScope = '[data-test-delivery-modal]';

  message = text('[data-test-modal-content]');
  printCheckboxIsChecked = property('[data-test-print-slip-checkbox]', 'checked');

  clickClose = clickable('[data-test="close"]');
  clickCloseAndCheckout = clickable('[data-test="closeAndCheckout"]');
}

@interactor class CheckInInteractor {
  processDate = new DatepickerInteractor('[data-test-process-date]');
  processTime = new TimepickerInteractor('[data-test-process-time]');
  confirmModal = new ConfirmStatusModal('[data-test-confirm-status-modal]');
  multiPieceModal = new MultiPieceModalInteractor('[data-test-multi-piece-modal]');
  missingItemModal = new MissingItemModalInteractor();
  checkinNoteModal = new CheckinNoteModalInteractor();
  selectElipse = clickable('[data-test-elipse-select] button');
  checkedInItemsList = scoped('[data-test-checked-in-items] div', MultiColumnListInteractor);
  selectLoanDetails = clickable('[data-test-loan-details]');
  selectPatronDetails = clickable('[data-test-patron-details]');
  selectItemDetails = clickable('[data-test-item-details]');
  fillOutError = text('[data-test-check-in-scan] [class^="feedbackError"]');
  barcodePresent = isPresent('[data-test-check-in-barcode]');
  barcodeInput = isPresent('[data-test-check-in-barcode]');
  barcodeInputValue = value('[data-test-check-in-barcode]')
  barcodeInputIsFocused = isPresent('[data-test-check-in-barcode]:focus');
  confirmStatusModalPresent = isPresent('[data-test-confirm-status-modal]');
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
