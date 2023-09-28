import {
  render,
  screen,
} from '@folio/jest-config-stripes/testing-library/react';

import {
  Icon,
  MultiColumnList,
} from '@folio/stripes/components';
import { effectiveCallNumber } from '@folio/stripes/util';

import ReturnedTime from './components/ReturnedTime';
import CheckedInListItems, {
  COLUMNS_NAME,
  visibleColumns,
  columnMapping,
  columnWidths,
  getItemListFormatter,
} from './CheckedInListItems';

const testIds = {
  listItemsLoading: 'listItemsLoading',
  listItems: 'listItems',
  returnedTime: 'returnedTime',
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

jest.mock('@folio/stripes/util', () => ({
  effectiveCallNumber: jest.fn(),
}));
jest.mock('./components/ReturnedTime', () => jest.fn(() => null));

describe('CheckedInListItems', () => {
  describe('component', () => {
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

      it('should trigger "MultiColumnList" with correct props', () => {
        const expectedProps = {
          id: 'list-items-checked-in',
          fullWidth: true,
          columnOverflow: {
            ' ': true,
          },
          rowMetadata: ['id'],
          interactive: false,
          contentData: scannedItems,
          visibleColumns,
          columnMapping,
          columnWidths,
        };

        expect(MultiColumnList).toHaveBeenCalledWith(expect.objectContaining(expectedProps), {});
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

  describe('getItemListFormatter', () => {
    const basicLoan = {
      item: {
        title: 'title',
        barcode: 'barcode',
        location: {
          name: 'location',
        },
        materialType: {
          name: 'materialType',
        },
        status: {
          name: 'status',
        },
        inTransitDestinationServicePoint: {
          name: 'inTransitDestinationServicePoint',
        },
      },
      inHouseUse: true,
    };

    it('should trigger "ReturnedTime" with correct props', () => {
      const returnedTime = getItemListFormatter(mutator, renderActions)[COLUMNS_NAME.TIME_RETURNED](basicLoan);
      const expectedProps = {
        mutator,
        loan: basicLoan,
      };

      render(returnedTime);

      expect(ReturnedTime).toHaveBeenCalledWith(expectedProps, {});
    });

    it('should return title', () => {
      const title = getItemListFormatter(mutator, renderActions)[COLUMNS_NAME.TITLE](basicLoan);

      expect(title).toBe(`${basicLoan.item.title} (${basicLoan.item.materialType.name})`);
    });

    it('should return barcode', () => {
      const barcode = getItemListFormatter(mutator, renderActions)[COLUMNS_NAME.BARCODE](basicLoan);

      expect(barcode).toBe(basicLoan.item.barcode);
    });

    it('should return location', () => {
      const location = getItemListFormatter(mutator, renderActions)[COLUMNS_NAME.LOCATION](basicLoan);

      expect(location).toBe(basicLoan.item.location.name);
    });

    it('should trigger "Icon" with correct props', () => {
      const inHouseUse = getItemListFormatter(mutator, renderActions)[COLUMNS_NAME.IN_HOUSE_USE](basicLoan);
      const expectedProps = {
        icon: 'house',
        iconClassName: 'houseIcon',
      };

      render(inHouseUse);

      expect(Icon).toHaveBeenCalledWith(expectedProps, {});
    });

    it('should return empty string as "In house use" column', () => {
      const loan = {
        ...basicLoan,
        inHouseUse: false,
      };
      const inHouseUse = getItemListFormatter(mutator, renderActions)[COLUMNS_NAME.IN_HOUSE_USE](loan);

      expect(inHouseUse).toBe('');
    });

    it('should return status with service point', () => {
      const status = getItemListFormatter(mutator, renderActions)[COLUMNS_NAME.STATUS](basicLoan);

      expect(status).toBe(`${basicLoan.item.status.name} - ${basicLoan.item.inTransitDestinationServicePoint.name}`);
    });

    it('should return status without service point', () => {
      const loan = {
        ...basicLoan,
        item: {
          ...basicLoan.item,
          inTransitDestinationServicePoint: {},
        },
      };
      const status = getItemListFormatter(mutator, renderActions)[COLUMNS_NAME.STATUS](loan);

      expect(status).toBe(basicLoan.item.status.name);
    });

    it('should trigger "effectiveCallNumber" with correct arguments', () => {
      getItemListFormatter(mutator, renderActions)[COLUMNS_NAME.EFFECTIVE_CALL_NUMBER](basicLoan);

      expect(effectiveCallNumber).toHaveBeenCalledWith(basicLoan);
    });

    it('should trigger "renderActions" with correct arguments', () => {
      getItemListFormatter(mutator, renderActions)[COLUMNS_NAME.ACTION](basicLoan);

      expect(renderActions).toHaveBeenCalledWith(basicLoan);
    });
  });
});
