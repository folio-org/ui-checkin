import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

import {
  Modal,
  Paneset,
  Pane,
  MultiColumnList,
  MCLPagingTypes,
  NoValue,
} from '@folio/stripes/components';

import { PAGE_AMOUNT } from '../../consts';

import css from './SelectItemModal.css';

export const COLUMN_NAMES = [
  'barcode',
  'title',
  'callNumber',
  'itemStatus',
  'location',
  'materialType',
  'loanType',
];

export const COLUMN_WIDTHS = {
  barcode: '14%',
  title: '14%',
  callNumber: '14%',
  itemStatus: '14%',
  location: '14%',
  materialType: '14%',
  loanType: '14%',
};

export const COLUMN_MAP = {
  barcode: <FormattedMessage id="ui-checkin.selectItemModal.barcode" />,
  title: <FormattedMessage id="ui-checkin.selectItemModal.title" />,
  callNumber: <FormattedMessage id="ui-checkin.selectItemModal.callNumber" />,
  itemStatus: <FormattedMessage id="ui-checkin.selectItemModal.itemStatus" />,
  location: <FormattedMessage id="ui-checkin.selectItemModal.location" />,
  materialType: <FormattedMessage id="ui-checkin.selectItemModal.materialType" />,
  loanType: <FormattedMessage id="ui-checkin.selectItemModal.loanType" />,
};

export const formatter = {
  callNumber: item => item.callNumber || <NoValue />,
  itemStatus: item => item.status.name,
  location: item => item.effectiveLocation?.name ?? <NoValue />,
  materialType: item => item.materialType.name,
  loanType: item => (item.temporaryLoanType?.name || item.permanentLoanType?.name || <NoValue />),
};

export const MAX_HEIGHT = 500;

const propTypes = {
  checkedinItems: PropTypes.arrayOf(PropTypes.shape({
    callNumber: PropTypes.string,
    status: PropTypes.shape({
      name: PropTypes.string,
    }),
    effectiveLocation: PropTypes.shape({
      name: PropTypes.string,
    }),
    materialType: PropTypes.shape({
      name: PropTypes.string,
    }),
    temporaryLoanType: PropTypes.shape({
      name: PropTypes.string,
    }),
    permanentLoanType: PropTypes.shape({
      name: PropTypes.string,
    }),
  })),
  onClose: PropTypes.func.isRequired,
  onSelectItem: PropTypes.func.isRequired,
  totalRecords: PropTypes.number.isRequired,
  onNeedMoreData: PropTypes.func.isRequired,
  barcode: PropTypes.oneOfType([
    PropTypes.oneOf([null, PropTypes.string])
  ]).isRequired,
  pagingOffset: PropTypes.number.isRequired,
};

const SelectItemModal = ({
  checkedinItems,
  onClose,
  onSelectItem,
  totalRecords,
  onNeedMoreData,
  barcode,
  pagingOffset,
}) => {
  const getMoreData = (askAmount, index) => {
    onNeedMoreData(barcode, index);
  };
  const pagingCanGoPrevious = pagingOffset > 0;
  const pagingCanGoNext = pagingOffset < totalRecords && totalRecords - pagingOffset > PAGE_AMOUNT;

  return (
    <Modal
      data-testid="selectItemModal"
      data-test-select-item-modal
      label={<FormattedMessage id="ui-checkin.selectItemModal.heading" />}
      open
      contentClass={css.content}
      onClose={onClose}
      dismissible
    >
      <Paneset
        id="itemsDialog"
        isRoot
        static
      >
        <Pane
          id="check-in-items-list"
          paneTitle={<FormattedMessage id="ui-checkin.selectItemModal.itemListHeader" />}
          paneSub={<FormattedMessage id="ui-checkin.selectItemModal.resultCount" values={{ count: totalRecords }} />}
          defaultWidth="fill"
        >
          <MultiColumnList
            id="items-list"
            interactive
            contentData={checkedinItems}
            visibleColumns={COLUMN_NAMES}
            columnMapping={COLUMN_MAP}
            columnWidths={COLUMN_WIDTHS}
            formatter={formatter}
            maxHeight={MAX_HEIGHT}
            onRowClick={onSelectItem}
            totalCount={totalRecords}
            onNeedMoreData={getMoreData}
            pageAmount={PAGE_AMOUNT}
            pagingType={MCLPagingTypes.PREV_NEXT}
            pagingCanGoPrevious={pagingCanGoPrevious}
            pagingCanGoNext={pagingCanGoNext}
            pagingOffset={pagingOffset}
          />
        </Pane>
      </Paneset>
    </Modal>
  );
};

SelectItemModal.propTypes = propTypes;

export default SelectItemModal;
