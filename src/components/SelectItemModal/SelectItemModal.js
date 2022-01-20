import { get } from 'lodash';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import {
  Modal,
  Paneset,
  Pane,
  MultiColumnList,
} from '@folio/stripes/components';

import css from './SelectItemModal.css';

const COLUMN_NAMES = [
  'barcode',
  'itemStatus',
  'requestQueue',
  'location',
  'materialType',
  'loanType',
];

const COLUMN_WIDTHS = {
  barcode: '16%',
  itemStatus: '16%',
  requestQueue: '16%',
  location: '16%',
  materialType: '16%',
  loanType: '16%',
};

const COLUMN_MAP = {
  barcode: <FormattedMessage id="ui-checkin.selectItemModal.barcode" />,
  itemStatus: <FormattedMessage id="ui-checkin.selectItemModal.itemStatus" />,
  requestQueue: <FormattedMessage id="ui-checkin.selectItemModal.requestQueue" />,
  location: <FormattedMessage id="ui-checkin.selectItemModal.location" />,
  materialType: <FormattedMessage id="ui-checkin.selectItemModal.materialType" />,
  loanType: <FormattedMessage id="ui-checkin.selectItemModal.loanType" />,
};

const formatter = {
  itemStatus: item => item.status.name,
  location: item => item.effectiveLocation?.name ?? '',
  materialType: item => item.materialType.name,
  loanType: item => (item.temporaryLoanType
    ? item.temporaryLoanType.name ?? ''
    : item.permanentLoanType?.name ?? ''
  ),
};

const MAX_HEIGHT = 500;

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
          paneTitle={<FormattedMessage id="ui-checkin.selectItemModal.itemsList" />}
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
