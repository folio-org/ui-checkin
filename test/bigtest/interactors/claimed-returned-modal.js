import {
  clickable,
  interactor,
  text,
  property,
} from '@bigtest/interactor';

@interactor class ClaimedReturnedModalInteractor {
  defaultScope = '[data-test-claimed-returned-modal]';

  // message = text('[data-test-modal-content]');
  // printCheckboxIsChecked = property('[data-test-print-slip-checkbox]', 'checked');

  clickCancel = clickable('[data-test-cancel-button]');
  // clickCloseAndCheckout = clickable('[data-test="closeAndCheckout"]');
}

export default ClaimedReturnedModalInteractor;
