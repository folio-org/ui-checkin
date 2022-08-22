import React from 'react';
import {
  render,
  screen,
} from '@testing-library/react';

import '../../../test/jest/__mock__';

import CheckedInListItems from './CheckedInListItems';

const testIds = {
  listItemsLoading: 'listItemsLoading',
  listItems: 'listItems',
};

const loading = false;
const scannedItems = [];
const mutator = {};
const renderActions = jest.fn();
const initialProps = {
  loading,
  scannedItems,
  mutator,
  renderActions,
};

describe('CheckedInListItems', () => {
  describe('with loading false', () => {
    beforeEach(() => {
      render(
        <CheckedInListItems
          {...initialProps}
        />
      );
    });

    it('should not render loading', () => {
      expect(screen.queryByTestId(testIds.listItemsLoading)).not.toBeInTheDocument();
    });

    it('should render list', () => {
      expect(screen.getByTestId(testIds.listItems)).toBeVisible();
    });
  });

  describe('with loading true', () => {
    const defaultProps = {
      ...initialProps,
      loading: true,
    };

    beforeEach(() => {
      render(
        <CheckedInListItems
          {...defaultProps}
        />
      );
    });

    it('should render loading', () => {
      expect(screen.getByTestId(testIds.listItemsLoading)).toBeVisible();
    });
  });
});
