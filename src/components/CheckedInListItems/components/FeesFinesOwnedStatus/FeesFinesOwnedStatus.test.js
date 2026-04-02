import { render, act } from '@folio/jest-config-stripes/testing-library/react';

import { loan as loanFixture } from '../../../../../test/jest/fixtures/loan';
import FeesFinesOwnedStatus from './FeesFinesOwnedStatus';

const labelIds = {
  feesFinesOwedLabel: 'ui-checkin.feesFinesOwed',
};

const renderFeesFinesOwnedStatus = (loan) => {
  const {
    loan: {
      id: loanId,
      itemId,
      userId,
    } = {}
  } = loan;
  const parentMutator = {
    accounts: {
      GET: () => new Promise(jest.fn()),
      cancel: () => new Promise(jest.fn()),
    }
  };

  return render(
    <FeesFinesOwnedStatus
      userId={userId}
      itemId={itemId}
      loanId={loanId}
      mutator={parentMutator}
    />
  );
};

describe('FeesFinesOwnedStatus', () => {
  describe('component without props', () => {
    beforeEach(() => {
      renderFeesFinesOwnedStatus({});
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should be rendered', () => {
      expect(document.querySelector('[data-test-fee-fine-owned-status]')).toBeInTheDocument();
    });
  });
  describe('render component with props', () => {
    beforeEach(() => {
      renderFeesFinesOwnedStatus(loanFixture);
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should be rendered', () => {
      expect(document.querySelector('[data-test-fee-fine-owned-status]')).toBeInTheDocument();
    });
  });

  it('should show message if fees/fines are owed', async () => {
    const parentMutator = {
      accounts: {
        GET: jest.fn(() => Promise.resolve({ totalRecords: 1 })),
        cancel: jest.fn(),
      }
    };

    await act(async () => {
      render(
        <FeesFinesOwnedStatus
          userId="user1"
          itemId="item1"
          loanId="loan1"
          mutator={parentMutator}
        />
      );
    });

    expect(document.querySelector('[data-test-fee-fine-owned-status]')).toHaveTextContent(labelIds.feesFinesOwedLabel);
  });

  it('should not show message if no fees/fines are owed', async () => {
    const parentMutator = {
      accounts: {
        GET: jest.fn(() => Promise.resolve({ totalRecords: 0 })),
        cancel: jest.fn(),
      }
    };

    await act(async () => {
      render(
        <FeesFinesOwnedStatus
          userId="user1"
          itemId="item1"
          loanId="loan1"
          mutator={parentMutator}
        />
      );
    });

    expect(document.querySelector('[data-test-fee-fine-owned-status]')).not.toHaveTextContent('(fees/fines owed)');
  });

  it('should call cancel and fetch on prop change', async () => {
    const parentMutator = {
      accounts: {
        GET: jest.fn(() => Promise.resolve({ totalRecords: 0 })),
        cancel: jest.fn(),
      }
    };
    let rerender;

    await act(async () => {
      const utils = render(
        <FeesFinesOwnedStatus
          userId="user1"
          itemId="item1"
          loanId="loan1"
          mutator={parentMutator}
        />
      );
      rerender = utils.rerender;
    });
    await act(async () => {
      rerender(
        <FeesFinesOwnedStatus
          userId="user2"
          itemId="item2"
          loanId="loan2"
          mutator={parentMutator}
        />
      );
    });

    expect(parentMutator.accounts.cancel).toHaveBeenCalled();
    expect(parentMutator.accounts.GET).toHaveBeenCalledTimes(2);
  });

  it('should call cancel on unmount if async request exists', async () => {
    const parentMutator = {
      accounts: {
        GET: jest.fn(() => new Promise(() => {})),
        cancel: jest.fn(),
      }
    };
    let unmount;

    await act(async () => {
      const utils = render(
        <FeesFinesOwnedStatus
          userId="user1"
          itemId="item1"
          loanId="loan1"
          mutator={parentMutator}
        />
      );
      unmount = utils.unmount;
    });
    await act(async () => {
      unmount();
    });

    expect(parentMutator.accounts.cancel).toHaveBeenCalled();
  });
});
