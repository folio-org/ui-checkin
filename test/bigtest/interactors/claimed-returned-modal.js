import {
  clickable,
  interactor,
  is,
  scoped,
} from '@bigtest/interactor';

@interactor class ClaimedReturnedModalInteractor {
  defaultScope = '[data-test-claimed-returned-modal]';

  clickCancel = clickable('[data-test-cancel-button]');
  clickFound = scoped('[data-test-found-button]', {
    click: clickable(),
    isFocused: is(':focus'),
  });

}

export default ClaimedReturnedModalInteractor;
