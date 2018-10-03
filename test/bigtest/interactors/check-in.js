import {
  blurrable,
  clickable,
  fillable,
  interactor,
  isPresent,
  text,
  triggerable
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

export default interactor(class CheckInInteractor {
  processDate = new DatepickerInteractor('[data-test-process-date]')
  processTime = new TimepickerInteractor('[data-test-process-time]')
  selectElipse = clickable('[data-test-elipse-select]');
  selectLoanDetails = clickable('[data-test-loan-details]');
  selectPatronDetails = clickable('[data-test-patron-details]');
  selectItemDetails = clickable('[data-test-item-details]');
  fillOutError = text('[data-test-check-in-scan] [class^="feedbackError"]');
  barcodePresent = isPresent('[data-test-check-in-barcode]');
  barcode = fillable('#input-item-barcode');
  clickEnter = clickable('#clickable-add-item');
  checkedInBookTitle = text('#list-items-checked-in div[role="gridcell"]:nth-child(2)');
  barcodeError = text('[data-test-check-in-scan] [class^="feedbackError"]');
  endSession = clickable('#clickable-end-session');
  hasCheckedInItems = isPresent('#list-items-checked-in');
  clickChangeDate = clickable('[data-test-checkin-modify-date]');
  clickChangeTime = clickable('[data-test-checkin-modify-time]');
});
