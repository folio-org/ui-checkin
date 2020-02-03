import {
  fillable,
  interactor,
} from '@bigtest/interactor';

@interactor class TimepickerInteractor {
  fillInput = fillable('input');
}

export default TimepickerInteractor;
