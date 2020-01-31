import {
  clickable,
  interactor,
  isPresent,
  collection,
} from '@bigtest/interactor';

import CheckinNoteInteractor from './checkin-note';

@interactor class CheckinNoteModalInteractor {
  defaultScope = '[data-test-check-in-note-modal]';

  checkinNotes = collection('[data-test-check-in-note-modal] [class^="mclRow--"]', CheckinNoteInteractor);
  present = isPresent('[data-test-checkin-note-modal-confirm-button]');
  clickConfirm = clickable('[data-test-checkin-note-modal-confirm-button]');
}

export default CheckinNoteModalInteractor;
