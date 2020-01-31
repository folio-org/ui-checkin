import {
  blurrable,
  clickable,
  fillable,
  interactor,
  triggerable,
} from '@bigtest/interactor';

@interactor class DatepickerInteractor {
  clickInput = clickable('input');
  fillInput = fillable('input');
  blurInput = blurrable('input');

  pressEnter = triggerable('keydown', {
    bubbles: true,
    cancelable: true,
    keyCode: 13
  });

  fillAndBlur(date) {
    return this
      .clickInput()
      .fillInput(date)
      .pressEnter()
      .blurInput();
  }
}

export default DatepickerInteractor;
