import {
  render,
  screen,
  fireEvent,
} from '@folio/jest-config-stripes/testing-library/react';

import {
  Modal,
  Paneset,
  Pane,
  MultiColumnList,
  MCLPagingTypes,
  NoValue,
} from '@folio/stripes/components';

import SelectItemModal, {
  formatter,
  COLUMN_NAMES,
  COLUMN_WIDTHS,
  COLUMN_MAP,
  MAX_HEIGHT,
} from './SelectItemModal';
import { PAGE_AMOUNT } from '../../consts';

import css from './SelectItemModal.css';

const testIds = {
  loadMoreButton: 'loadMoreButton',
};

describe('SelectItemModal', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('formatter', () => {
    const basicItem = {
      callNumber: 'callNumber',
      status: {
        name: 'statusName',
      },
      effectiveLocation: {
        name: 'effectiveLocationName',
      },
      materialType: {
        name: 'materialTypeName',
      },
      temporaryLoanType: {
        name: 'temporaryLoanTypeName',
      },
      permanentLoanType: {
        name: 'permanentLoanTypeName',
      },
    };

    describe('when all data exist', () => {
      it('should return correct "callNumber"', () => {
        expect(formatter.callNumber(basicItem)).toBe(basicItem.callNumber);
      });

      it('should return correct "status.name"', () => {
        expect(formatter.itemStatus(basicItem)).toBe(basicItem.status.name);
      });

      it('should return correct "effectiveLocation.name"', () => {
        expect(formatter.location(basicItem)).toBe(basicItem.effectiveLocation.name);
      });

      it('should return correct "materialType.name"', () => {
        expect(formatter.materialType(basicItem)).toBe(basicItem.materialType.name);
      });

      it('should return correct "temporaryLoanType.name"', () => {
        expect(formatter.loanType(basicItem)).toBe(basicItem.temporaryLoanType.name);
      });
    });

    describe('when "callNumber" does not have data', () => {
      const item = {
        ...basicItem,
        callNumber: '',
      };

      it('should return empty string for "callNumber"', () => {
        expect(formatter.callNumber(item)).toEqual(<NoValue />);
      });
    });

    describe('when "effectiveLocation" does not have data', () => {
      const item = {
        ...basicItem,
        effectiveLocation: {},
      };

      it('should return empty string for "location"', () => {
        expect(formatter.location(item)).toEqual(<NoValue />);
      });
    });

    describe('when "temporaryLoanType" does not have data', () => {
      const item = {
        ...basicItem,
        temporaryLoanType: {},
      };

      it('should return empty "permanentLoanType.name"', () => {
        expect(formatter.loanType(item)).toBe(item.permanentLoanType.name);
      });
    });

    describe('when "temporaryLoanType" and "permanentLoanType" do not have data', () => {
      const item = {
        ...basicItem,
        temporaryLoanType: {},
        permanentLoanType: {},
      };

      it('should return empty string for "loanType"', () => {
        expect(formatter.loanType(item)).toEqual(<NoValue />);
      });
    });
  });

  describe('component', () => {
    const props = {
      checkedinItems: [],
      onClose: jest.fn(),
      onSelectItem: jest.fn(),
      onNeedMoreData: jest.fn(),
      totalRecords: 10,
      pagingOffset: 0,
      barcode: 'itemBarcode',
    };
    const modalTestId = 'selectItemModal';

    beforeEach(() => {
      render(
        <SelectItemModal {...props} />
      );
    });

    it('should render modal window', () => {
      expect(screen.getByTestId(modalTestId)).toBeVisible();
    });

    it('should trigger "Modal" with correct props', () => {
      const expectedProps = {
        'data-test-select-item-modal': true,
        open: true,
        dismissible: true,
        onClose: props.onClose,
        contentClass: css.content,
      };

      expect(Modal).toHaveBeenCalledWith(expect.objectContaining(expectedProps), {});
    });

    it('should trigger "Paneset" with correct props', () => {
      const expectedProps = {
        id: 'itemsDialog',
        isRoot: true,
        static: true,
      };

      expect(Paneset).toHaveBeenCalledWith(expect.objectContaining(expectedProps), {});
    });

    it('should trigger "Pane" with correct props', () => {
      const expectedProps = {
        id: 'check-in-items-list',
        defaultWidth: 'fill',
      };

      expect(Pane).toHaveBeenCalledWith(expect.objectContaining(expectedProps), {});
    });

    it('should trigger "MultiColumnList" with correct props', () => {
      const expectedProps = {
        id: 'items-list',
        interactive: true,
        contentData: props.checkedinItems,
        visibleColumns: COLUMN_NAMES,
        columnMapping: COLUMN_MAP,
        columnWidths: COLUMN_WIDTHS,
        formatter,
        maxHeight: MAX_HEIGHT,
        onRowClick: props.onSelectItem,
        totalCount: props.totalRecords,
        pagingOffset: props.pagingOffset,
        onNeedMoreData: expect.any(Function),
        pageAmount: PAGE_AMOUNT,
        pagingType: MCLPagingTypes.PREV_NEXT,
        pagingCanGoPrevious: false,
        pagingCanGoNext: false,
      };

      expect(MultiColumnList).toHaveBeenCalledWith(expect.objectContaining(expectedProps), {});
    });

    it('should get more data', () => {
      const loadMoreButton = screen.getByTestId(testIds.loadMoreButton);

      fireEvent.click(loadMoreButton);

      expect(props.onNeedMoreData).toHaveBeenCalled();
    });
  });
});
