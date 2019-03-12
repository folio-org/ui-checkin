import {
  blurrable,
  clickable,
  fillable,
  interactor,
  isPresent,
  text,
  triggerable,
  property
} from '@bigtest/interactor';

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

@interactor class CheckInInteractor {
  processDate = new DatepickerInteractor('[data-test-process-date]');
  processTime = new TimepickerInteractor('[data-test-process-time]');
  confirmModal = new ConfirmStatusModal('[data-test-confirm-status-modal]');
  multiPieceModal = new MultiPieceModalInteractor('[data-test-multi-piece-modal]');
  missingItemModal = new MissingItemModalInteractor();

  selectElipse = clickable('[data-test-elipse-select] button');
  selectLoanDetails = clickable('[data-test-loan-details]');
  selectPatronDetails = clickable('[data-test-patron-details]');
  selectItemDetails = clickable('[data-test-item-details]');
  fillOutError = text('[data-test-check-in-scan] [class^="feedbackError"]');
  barcodePresent = isPresent('[data-test-check-in-barcode]');
  confirmStatusModalPresent = isPresent('[data-test-confirm-status-modal]');
  barcode = fillable('#input-item-barcode');
  clickEnter = clickable('#clickable-add-item');
  checkedInBookTitle = text('#list-items-checked-in div[role="gridcell"]:nth-child(2)');
  barcodeError = text('#OverlayContainer [class^="modalContent"]>span');
  endSession = clickable('#clickable-end-session');
  hasCheckedInItems = isPresent('#list-items-checked-in');
  clickChangeDate = clickable('[data-test-checkin-modify-date]');
  clickChangeTime = clickable('[data-test-checkin-modify-time]');
  printHoldSlipItemPresent = isPresent('[data-test-print-hold-slip]');
  printTransitSlipItemPresent = isPresent('[data-test-print-transit-slip]');
}

export default CheckInInteractor;
