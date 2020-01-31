import {
  clickable,
  interactor,
  property,
} from '@bigtest/interactor';

@interactor class ConfirmStatusModal {
  clickPrintHoldCheckbox = clickable('[data-test-print-slip-checkbox]');
  clickConfirmButton = clickable('[data-test-confirm-button]');

  isPrintTransitChecked = property('[data-test-print-slip-checkbox]', 'checked');
}

export default ConfirmStatusModal;
