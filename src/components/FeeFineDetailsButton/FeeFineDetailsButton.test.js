import React from 'react';
import {
  render,
  getByText,
} from '@testing-library/react';

import '../../../test/jest/__mock__';
import { account as accountFixture } from '../../../test/jest/fixtures/account';
import { loan as loanFixture } from '../../../test/jest/fixtures/loan';
import FeeFineDetailsButton from './FeeFineDetailsButton';

let pushHistorySpy;
const renderFeeFineDetailsButton = (loan) => {
  const {
    loan: {
      itemId,
      userId,
    } = {}
  } = loan;
  const parentMutator = {
    accounts: {
      GET: () => Promise.resolve(accountFixture),
      cancel: () => new Promise(jest.fn()),
    },
    query: {
      update: () => new Promise(jest.fn()),
    }
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
      renderButton = renderFeeFineDetailsButton({});
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should be rendered', () => {
      const { container } = renderButton;
      const element = container.querySelector('[data-test-fee-fine-details]');
      const buttonText = container.querySelector('[data-test-button] span');

      expect(element).toBeVisible();
      expect(buttonText).toBeVisible();
      expect(getByText(buttonText, 'ui-checkin.feeFineDetails')).toBeVisible();
    });
  });

  describe('component with props', () => {
    beforeEach(() => {
      renderButton = renderFeeFineDetailsButton(loanFixture);
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
});
