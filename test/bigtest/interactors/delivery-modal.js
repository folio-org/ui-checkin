import {
  clickable,
  interactor,
  text,
  property,
} from '@bigtest/interactor';

@interactor class DeliveryModalInteractor {
  defaultScope = '[data-test-delivery-modal]';

  message = text('[data-test-modal-content]');
  printCheckboxIsChecked = property('[data-test-print-slip-checkbox]', 'checked');

  clickClose = clickable('[data-test="close"]');
  clickCloseAndCheckout = clickable('[data-test="closeAndCheckout"]');
}

export default DeliveryModalInteractor;
