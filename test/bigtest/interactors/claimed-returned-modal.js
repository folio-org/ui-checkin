import {
  clickable,
  interactor,
  text,
  property,
} from '@bigtest/interactor';

@interactor class ClaimedReturnedModalInteractor {
  defaultScope = '[data-test-claimed-returned-modal]';

  clickCancel = clickable('[data-test-cancel-button]');
}

export default ClaimedReturnedModalInteractor;
