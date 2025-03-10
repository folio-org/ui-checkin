import {
  render,
  screen,
  fireEvent,
  waitFor,
  cleanup,
} from '@folio/jest-config-stripes/testing-library/react';

import { account as accountFixture } from '../../../test/jest/fixtures/account';
import { loan as loanFixture } from '../../../test/jest/fixtures/loan';
import FeeFineDetailsButton from './FeeFineDetailsButton';
import { DCB_USER_LASTNAME } from '../../consts';

const mockedHistoryPush = jest.fn();
const labelIds = {
  feeFineDetails: 'ui-checkin.feeFineDetails',
};
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
  };
  const history = {
    push: mockedHistoryPush,
  };
  pushHistorySpy = jest.fn();

  return render(
    <FeeFineDetailsButton
      userId={userId}
      itemId={itemId}
      mutator={parentMutator}
      onClick={pushHistorySpy}
      history={history}
    />
  );
};

describe('FeeFineDetailsButton', () => {
  let renderButton;

  afterEach(() => {
    cleanup();
  });

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
      renderFeeFineDetailsButton(loanFixture, accountFixture);
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should be rendered', async () => {
      await waitFor(() => {
        const feeFineDetailsLabel = screen.getByText(labelIds.feeFineDetails);

        expect(feeFineDetailsLabel).toBeVisible();
      });
    });
  });

  describe('button href should redirect to', () => {
    const buttonRole = 'menuitem';
    const userId = loanFixture.loan.userId;
    const feeFineId = accountFixture.accounts[0].id;

    it('open fee/fine directly', async () => {
      const expectedResult = `/users/${userId}/accounts/view/${feeFineId}`;

      renderFeeFineDetailsButton(loanFixture, accountFixture);

      await waitFor(() => {
        fireEvent.click(screen.getByRole(buttonRole));

        expect(mockedHistoryPush).toHaveBeenLastCalledWith(expectedResult);
      });
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
      const expectedResult = `/users/${userId}/accounts/open`;

      renderFeeFineDetailsButton(loanFixture, accountDataWithTwoOpenFeeFines);

      await waitFor(() => {
        fireEvent.click(screen.getByRole(buttonRole));

        expect(mockedHistoryPush).toHaveBeenLastCalledWith(expectedResult);
      });
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
      const expectedResult = `/users/${userId}/accounts/view/closedFeeFineId`;

      renderFeeFineDetailsButton(loanFixture, accountDataWithOneClosedFeeFine);

      await waitFor(() => {
        fireEvent.click(screen.getByRole(buttonRole));

        expect(mockedHistoryPush).toHaveBeenLastCalledWith(expectedResult);
      });
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
      const expectedResult = `/users/${userId}/accounts/closed`;

      renderFeeFineDetailsButton(loanFixture, accountDataWithTwoClosedFeeFines);

      await waitFor(() => {
        fireEvent.click(screen.getByRole(buttonRole));

        expect(mockedHistoryPush).toHaveBeenLastCalledWith(expectedResult);
      });
    });
  });

  describe('when borrower is virtual user', () => {
    it('should not render FeeFineDetails button', () => {
      const alteredLoanFixture = {
        ...loanFixture,
        loan: {
          ...loanFixture.loan,
          borrower: {
            ...loanFixture.loan.borrower,
            lastName: DCB_USER_LASTNAME,
          }
        }
      };
      renderFeeFineDetailsButton(alteredLoanFixture, accountFixture);

      expect(screen.queryByText(labelIds.feeFineDetails)).toBeNull();
    });
  });
});
