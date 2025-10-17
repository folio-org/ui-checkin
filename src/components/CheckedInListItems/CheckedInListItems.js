import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { get } from 'lodash';

import {
  Icon,
  MultiColumnList,
  NoValue,
} from '@folio/stripes/components';
import { effectiveCallNumber } from '@folio/stripes/util';

import ReturnedTime from './components/ReturnedTime';

import css from './CheckedInListItems.css';

export const COLUMNS_NAME = {
  TIME_RETURNED: 'timeReturned',
  TITLE: 'title',
  BARCODE: 'barcode',
  EFFECTIVE_CALL_NUMBER: 'effectiveCallNumber',
  LOCATION: 'location',
  IN_HOUSE_USE: 'inHouseUse',
  STATUS: 'status',
  FOR_USE_AT_LOCATION: 'forUseAtLocation',
  ACTION: ' ',
};
export const visibleColumns = [
  COLUMNS_NAME.TIME_RETURNED,
  COLUMNS_NAME.TITLE,
  COLUMNS_NAME.BARCODE,
  COLUMNS_NAME.EFFECTIVE_CALL_NUMBER,
  COLUMNS_NAME.LOCATION,
  COLUMNS_NAME.IN_HOUSE_USE,
  COLUMNS_NAME.STATUS,
  COLUMNS_NAME.FOR_USE_AT_LOCATION,
  COLUMNS_NAME.ACTION,
];
export const columnWidths = {
  [COLUMNS_NAME.TIME_RETURNED]: { max: 120 },
  [COLUMNS_NAME.TITLE]: { max: 300 },
  [COLUMNS_NAME.BARCODE]: { max: 200 },
  [COLUMNS_NAME.EFFECTIVE_CALL_NUMBER]: { max: 200 },
  [COLUMNS_NAME.LOCATION]: { max: 200 },
  [COLUMNS_NAME.IN_HOUSE_USE]: { max: 80 },
  [COLUMNS_NAME.STATUS]: { max: 120 },
  [COLUMNS_NAME.FOR_USE_AT_LOCATION]: { max: 120 },
  [COLUMNS_NAME.ACTION]: { max: 80 },
};
export const columnMapping = {
  [COLUMNS_NAME.TIME_RETURNED]: <FormattedMessage id="ui-checkin.timeReturned" />,
  [COLUMNS_NAME.TITLE]: <FormattedMessage id="ui-checkin.title" />,
  [COLUMNS_NAME.BARCODE]: <FormattedMessage id="ui-checkin.barcode" />,
  [COLUMNS_NAME.EFFECTIVE_CALL_NUMBER]: <FormattedMessage id="ui-checkin.effectiveCallNumber" />,
  [COLUMNS_NAME.LOCATION]: <FormattedMessage id="ui-checkin.location" />,
  [COLUMNS_NAME.IN_HOUSE_USE]: <FormattedMessage id="ui-checkin.inHouseUse" />,
  [COLUMNS_NAME.STATUS]: <FormattedMessage id="ui-checkin.status" />,
  [COLUMNS_NAME.FOR_USE_AT_LOCATION]: <FormattedMessage id="ui-checkin.forUseAtLocation" />,
  [COLUMNS_NAME.ACTION]: <FormattedMessage id="ui-checkin.actions" />,
};
export const getItemListFormatter = (mutator, renderActions) => ({
  [COLUMNS_NAME.TIME_RETURNED]: loan => (
    <ReturnedTime
      loan={loan}
      mutator={mutator}
    />
  ),
  [COLUMNS_NAME.TITLE]: (loan) => {
    const title = `${get(loan, ['item', 'title'])}`;
    const materialType = `${get(loan, ['item', 'materialType', 'name'])}`;

    return `${title} (${materialType})`;
  },
  [COLUMNS_NAME.BARCODE]: (loan) => `${get(loan, ['item', 'barcode'])}`,
  [COLUMNS_NAME.LOCATION]: (loan) => `${get(loan, ['item', 'location', 'name'])}`,
  [COLUMNS_NAME.IN_HOUSE_USE]: loan => {
    return get(loan, 'inHouseUse') ?
      <Icon
        icon="house"
        iconClassName={css.houseIcon}
      /> :
      <NoValue />;
  },
  [COLUMNS_NAME.STATUS]: (loan) => {
    const status = `${get(loan, ['item', 'status', 'name'])}`;
    const inTransitSp = get(loan, ['item', 'inTransitDestinationServicePoint', 'name']);

    return (inTransitSp) ? `${status} - ${inTransitSp}` : status;
  },
  [COLUMNS_NAME.FOR_USE_AT_LOCATION]: (loan) => (
    loan.forUseAtLocation?.status ?
      <FormattedMessage id={`ui-checkin.forUseAtLocation.${loan.forUseAtLocation.status}`} /> :
      <NoValue />
  ),
  [COLUMNS_NAME.EFFECTIVE_CALL_NUMBER]: (loan) => effectiveCallNumber(loan) || <NoValue />,
  [COLUMNS_NAME.ACTION]: (loan) => renderActions(loan),
});

class CheckedInListItems extends React.Component {
  static propTypes = {
    loading: PropTypes.bool.isRequired,
    scannedItems: PropTypes.arrayOf(PropTypes.shape({
      title: PropTypes.string,
      barcode: PropTypes.string,
      materialType: PropTypes.shape({
        name: PropTypes.string,
      }),
      location: PropTypes.shape({
        name: PropTypes.string,
      }),
      status: PropTypes.shape({
        name: PropTypes.string,
      }),
      inTransitDestinationServicePoint: PropTypes.shape({
        name: PropTypes.string,
      }),
    })),
    mutator: PropTypes.shape({
      accounts: PropTypes.shape({
        GET: PropTypes.func.isRequired,
        cancel: PropTypes.func.isRequired,
      }).isRequired,
    }).isRequired,
    renderActions: PropTypes.func.isRequired,
  }

  render() {
    const {
      loading,
      scannedItems,
      mutator,
      renderActions,
    } = this.props;
    const emptyMessage = loading
      ? null
      : <FormattedMessage id="ui-checkin.noItems" />;

    const itemListFormatter = getItemListFormatter(mutator, renderActions);

    return (
      <>
        {loading &&
          <Icon
            data-testid="listItemsLoading"
            icon="spinner-ellipsis"
            width="10px"
          />
        }
        <div
          data-test-checked-in-items
          data-testid="listItems"
        >
          <MultiColumnList
            id="list-items-checked-in"
            fullWidth
            visibleColumns={visibleColumns}
            columnMapping={columnMapping}
            columnWidths={columnWidths}
            columnOverflow={{ ' ': true }}
            rowMetadata={['id']}
            interactive={false}
            contentData={scannedItems}
            formatter={itemListFormatter}
            isEmptyMessage={emptyMessage}
          />
        </div>
      </>
    );
  }
}

export default CheckedInListItems;
