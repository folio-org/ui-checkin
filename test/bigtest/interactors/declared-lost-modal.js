import {
  clickable,
  interactor,
  isPresent,
} from '@bigtest/interactor';

@interactor class DeclaredLostModal {
  defaultScope = '#test-declaredLost-modal';
  present = isPresent('[data-test-confirmation-modal-confirm-button]');
  clickConfirm = clickable('[data-test-confirmation-modal-confirm-button]');
}

export default DeclaredLostModal;
