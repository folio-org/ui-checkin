import {
  fireEvent,
  render,
  screen,
} from '@folio/jest-config-stripes/testing-library/react';

import CheckinDateTime, {
  parser,
} from './CheckinDateTime';

const labelIds = {
  dateReturnedLabel: 'ui-checkin.dateReturnedLabel',
  checkinDate: 'ui-checkin.checkinDate',
  timeReturnedLabel: 'ui-checkin.timeReturnedLabel',
  checkinTime: 'ui-checkin.checkinTime',
};
const testIds = {
  datePickerOnClick: 'datePickerOnClick',
  timePickerOnClick: 'timePickerOnClick',
};

const showPickers = true;
const onClick = jest.fn();
const initialProps = {
  showPickers,
  onClick,
};

describe('CheckinDateTime', () => {
  describe('parser', () => {
    it('should return value without changes', () => {
      const value = '11:11';

      expect(parser(value)).toEqual(value);
    });
  });

  describe('with show pickers true', () => {
    beforeEach(() => {
      render(
        <CheckinDateTime
          {...initialProps}
        />
      );
    });

    describe('date picker', () => {
      it('should render label', () => {
        expect(screen.getByText(labelIds.dateReturnedLabel)).toBeVisible();
      });

      it('should not be present', () => {
        expect(screen.queryByTestId(testIds.datePickerOnClick)).not.toBeInTheDocument();
      });
    });

    describe('time picker', () => {
      it('should render label', () => {
        expect(screen.getByText(labelIds.timeReturnedLabel)).toBeVisible();
      });

      it('should not be present', () => {
        expect(screen.queryByTestId(testIds.timePickerOnClick)).not.toBeInTheDocument();
      });
    });
  });

  describe('without show pickers true', () => {
    beforeEach(() => {
      render(
        <CheckinDateTime
          showPickers={false}
          onClick={onClick}
        />
      );
    });

    describe('date picker', () => {
      it('should render label', () => {
        expect(screen.getByText(labelIds.dateReturnedLabel)).toBeVisible();
      });

      it('should trigger on click event', () => {
        fireEvent.click(screen.getByTestId(testIds.datePickerOnClick));

        expect(onClick).toBeCalled();
      });
    });

    describe('time picker', () => {
      it('should render label', () => {
        expect(screen.getByText(labelIds.timeReturnedLabel)).toBeVisible();
      });

      it('should trigger on click event', () => {
        fireEvent.click(screen.getByTestId(testIds.timePickerOnClick));

        expect(onClick).toBeCalled();
      });
    });
  });
});
