import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import {
  Modal,
  Paneset,
  Pane,
  MultiColumnList,
} from '@folio/stripes/components';

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
  itemStatus: item => item.status.name,
  location: item => item.effectiveLocation?.name ?? '',
  materialType: item => item.materialType.name,
  loanType: item => (item.temporaryLoanType?.name || item.permanentLoanType?.name || ''),
};

export const MAX_HEIGHT = 500;

const propTypes = {
  checkedinItems: PropTypes.arrayOf(PropTypes.object),
  onClose: PropTypes.func.isRequired,
  onSelectItem: PropTypes.func.isRequired,
};

const SelectItemModal = ({
  checkedinItems,
  onClose,
  onSelectItem,
}) => {
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
          paneSub={<FormattedMessage id="ui-checkin.selectItemModal.resultCount" values={{ count: checkedinItems.length }} />}
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
          />
        </Pane>
      </Paneset>
    </Modal>
  );
};

SelectItemModal.propTypes = propTypes;

export default SelectItemModal;
