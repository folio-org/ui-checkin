import {
  clickable,
  interactor,
  isPresent,
  count,
} from '@bigtest/interactor';

@interactor class SelectItemModal {
  present = isPresent('[data-test-select-item-modal]');
  rowCount = count('[data-row-inner]');
  rowClick = clickable('[data-row-inner]');
}

export default SelectItemModal;
