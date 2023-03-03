import {
  render,
  screen,
  cleanup,
} from '@testing-library/react';

import '../../../../../test/jest/__mock__';

import ReturnedTime from "./ReturnedTime";
import FeesFinesOwnedStatus from '../FeesFinesOwnedStatus';

const testIds = {
  returnedDate: 'returnedDate',
};
const messageIds = {
  processedAs: 'ui-checkin.processedAs',
  actualTime: 'ui-checkin.actual',
};

jest.mock('../FeesFinesOwnedStatus', () => jest.fn(() => null));

describe('ReturnedTime', () => {
  const basicProps = {
    mutator: {},
    loan: {
      returnDate: '2023-03-02T10:51:22.527Z',
      id: 'loanId',
      userId: 'userId',
      itemId: 'itemId',
    },
  };

  describe('when all data provided', () => {
    beforeEach(() => {
      render(
        <ReturnedTime
          {...basicProps}
        />
      );
    });

    afterEach(cleanup);

    it('should render returned date into the document', () => {
      const returnedDate = screen.getByTestId(testIds.returnedDate);

      expect(returnedDate).toBeInTheDocument();
    });

    it('should render "Processes as" label', () => {
      const processedAsLabel = screen.getByText(messageIds.processedAs);

      expect(processedAsLabel).toBeInTheDocument();
    });

    it('should render "Actual" label', () => {
      const actualTimeLabel = screen.getByText(messageIds.actualTime);

      expect(actualTimeLabel).toBeInTheDocument();
    });

    it('should trigger "FeesFinesOwnedStatus" with correct props', () => {
      const expectedProps = {
        userId: basicProps.loan.userId,
        itemId: basicProps.loan.itemId,
        loanId: basicProps.loan.id,
        mutator: basicProps.mutator,
      };

      expect(FeesFinesOwnedStatus).toHaveBeenCalledWith(expectedProps, {});
    });
  });

  describe('when there are no "returnDate", "userId", "itemId"', () => {
    const props = {
      ...basicProps,
      loan: {},
    };

    beforeEach(() => {
      FeesFinesOwnedStatus.mockClear();

      render(
        <ReturnedTime
          {...props}
        />
      );
    });

    it('should not render returned date into the document', () => {
      const returnedDate = screen.queryByTestId(testIds.returnedDate);

      expect(returnedDate).not.toBeInTheDocument();
    });

    it('should not trigger "FeesFinesOwnedStatus"', () => {
      expect(FeesFinesOwnedStatus).not.toHaveBeenCalled();
    });
  });
});
