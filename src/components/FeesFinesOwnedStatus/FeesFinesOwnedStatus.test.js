import React from 'react';
import { render } from '@testing-library/react';

import '../../../test/jest/__mock__';
import FeesFinesOwnedStatus from './FeesFinesOwnedStatus';

const parentMutator = {
  accounts: {
    GET: () => new Promise(jest.fn()),
  }
};

const renderFeesFinesOwnedStatus = ({
  userId = 'userId',
  itemId,
  loanId = 'loanId',
}) => {
  return render(
    <FeesFinesOwnedStatus
      userId={userId}
      itemId={itemId}
      loanId={loanId}
      mutator={parentMutator}
    />
  );
};

describe('FeesFinesOwnedStatus component', () => {
  const { container } = renderFeesFinesOwnedStatus({});
  it('should be rendered', () => {
    expect(document.querySelector('[data-test-fee-fine-owned-status]')).toBeInTheDocument();
    expect(container).toBeDefined();
  });
});
