import {
  interactor,
  text,
} from '@bigtest/interactor';

@interactor class CheckinNoteInteractor {
  name = text('[data-test-check-in-note-name]');
  date = text('[data-test-check-in-note-date]');
  source = text('[data-test-check-in-note-source]');
}

export default CheckinNoteInteractor;
