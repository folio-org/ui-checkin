import {
  clickable,
  interactor,
  isPresent,
} from '@bigtest/interactor';

@interactor class DeclaredLostModal {
  defaultScope = '#test-declared-lost-modal';
  present = isPresent('[data-test-confirmation-modal-confirm-button]');
  clickConfirm = clickable('[data-test-confirmation-modal-confirm-button]');
}

export default DeclaredLostModal;
