import {
  clickable,
  fillable,
  interactor,
  isPresent,
  text
} from '@bigtest/interactor';

import DatepickerInteractor from '@folio/stripes-components/lib/Datepicker/tests/interactor';
import TimepickerInteractor from '@folio/stripes-components/lib/Timepicker/tests/interactor';

export default interactor(class CheckInInteractor {
  processDate = new DatepickerInteractor('[data-test-process-date]')
  processTime = new TimepickerInteractor('[data-test-process-time]')
  barcodePresent = isPresent('[data-test-check-in-barcode]');
  barcode = fillable('#input-item-barcode');
  clickEnter = clickable('#clickable-add-item');
  checkedInBookTitle = text('#list-items-checked-in div[role="gridcell"]:nth-child(2)');
  barcodeError = text('[data-test-check-in-scan] [class^="feedbackError"]');
  endSession = clickable('#clickable-end-session');
  hasCheckedInItems = isPresent('#list-items-checked-in');
});
