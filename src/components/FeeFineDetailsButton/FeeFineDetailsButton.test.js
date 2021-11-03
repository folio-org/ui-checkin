import React from 'react';
import {
  render,
  screen,
  fireEvent,
} from '@testing-library/react';

import '../../../test/jest/__mock__';

import { account as accountFixture } from '../../../test/jest/fixtures/account';
import { loan as loanFixture } from '../../../test/jest/fixtures/loan';
import FeeFineDetailsButton from './FeeFineDetailsButton';

const mockedQueryUpdate = jest.fn();

let pushHistorySpy;
const renderFeeFineDetailsButton = (loan, accountData) => {
  const {
    loan: {
      itemId,
      userId,
    } = {},
  } = loan;
  const parentMutator = {
    accounts: {
      GET: () => Promise.resolve(accountData),
      cancel: () => new Promise(jest.fn()),
    },
    query: {
      update: mockedQueryUpdate,
    },
  };
  pushHistorySpy = jest.fn();

  return render(
    <FeeFineDetailsButton
      userId={userId}
      itemId={itemId}
      mutator={parentMutator}
      onClick={pushHistorySpy}
    />
  );
};

describe('FeeFineDetailsButton', () => {
  let renderButton;
  describe('component without props', () => {
    beforeEach(() => {
      renderButton = renderFeeFineDetailsButton({}, accountFixture);
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should not be rendered', () => {
      const { container } = renderButton;
      const element = container.querySelector('[data-test-fee-fine-details]');
      const buttonText = container.querySelector('[data-test-button] span');

      expect(element).not.toBeInTheDocument();
      expect(buttonText).not.toBeInTheDocument();
    });
  });

  describe('component with props', () => {
    beforeEach(() => {
      renderButton = renderFeeFineDetailsButton(loanFixture, accountFixture);
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should be rendered', () => {
      const { container } = renderButton;
      const element = container.querySelector('[data-test-fee-fine-details]');

      expect(element).toBeVisible();
    });
  });

  describe('button href should redirect to', () => {
    const userId = loanFixture.loan.userId;
    const feeFineId = accountFixture.accounts[0].id;

    it('open fee/fine directly', async () => {
      const expectedResult = {
        _path: `/users/${userId}/accounts/view/${feeFineId}`,
      };

      await renderFeeFineDetailsButton(loanFixture, accountFixture);

      fireEvent.click(screen.getByRole('button'));
      expect(mockedQueryUpdate).toHaveBeenLastCalledWith(expectedResult);
    });

    it('all open fee/fines', async () => {
      const accountDataWithTwoOpenFeeFines = {
        accounts: [
          accountFixture.accounts[0],
          accountFixture.accounts[0],
        ],
        totalRecords: 2,
        resultInfo: {
          totalRecords: 2,
          facets: [],
          diagnostics: [],
        },
      };
      const expectedResult = {
        _path: `/users/${userId}/accounts/open`,
      };

      await renderFeeFineDetailsButton(loanFixture, accountDataWithTwoOpenFeeFines);

      fireEvent.click(screen.getByRole('button'));
      expect(mockedQueryUpdate).toHaveBeenLastCalledWith(expectedResult);
    });

    it('closed fee/fine directly', async () => {
      const accountDataWithOneClosedFeeFine = {
        accounts: [
          {
            ...accountFixture.accounts[0],
            status: { name: 'Closed' },
            id: 'closedFeeFineId',
          },
        ],
        totalRecords: 1,
        resultInfo: {
          totalRecords: 1,
          facets: [],
          diagnostics: [],
        },
      };
      const expectedResult = {
        _path: `/users/${userId}/accounts/view/closedFeeFineId`,
      };

      await renderFeeFineDetailsButton(loanFixture, accountDataWithOneClosedFeeFine);

      fireEvent.click(screen.getByRole('button'));
      expect(mockedQueryUpdate).toHaveBeenLastCalledWith(expectedResult);
    });

    it('all closed fee/fines', async () => {
      const accountDataWithTwoClosedFeeFines = {
        accounts: [
          {
            ...accountFixture.accounts[0],
            status: { name: 'Closed' },
          },
          {
            ...accountFixture.accounts[0],
            status: { name: 'Closed' },
          },
        ],
        totalRecords: 2,
        resultInfo: {
          totalRecords: 2,
          facets: [],
          diagnostics: [],
        },
      };
      const expectedResult = {
        _path: `/users/${userId}/accounts/closed`,
      };

      await renderFeeFineDetailsButton(loanFixture, accountDataWithTwoClosedFeeFines);

      fireEvent.click(screen.getByRole('button'));
      expect(mockedQueryUpdate).toHaveBeenLastCalledWith(expectedResult);
    });
  });
});
