import React from 'react';
import { render } from '@testing-library/react';

import '../../../test/jest/__mock__';
import { loan as loanFixture } from '../../../test/jest/fixtures/loan';
import FeesFinesOwnedStatus from './FeesFinesOwnedStatus';

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
});
