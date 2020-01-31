import {
  clickable,
  interactor,
  isPresent,
} from '@bigtest/interactor';

@interactor class MultiPieceModalInteractor {
  present = isPresent('[data-test-checkin-button]');
  clickCheckinBtn = clickable('[data-test-checkin-button]');
}

export default MultiPieceModalInteractor;
