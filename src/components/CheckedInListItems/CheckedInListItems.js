import React from 'react';
import PropTypes from 'prop-types';
import {
  FormattedMessage,
  injectIntl,
} from 'react-intl';
import { get } from 'lodash';

import { IfPermission } from '@folio/stripes/core';
import {
  FormattedTime,
  Icon,
  InfoPopover,
  KeyValue,
  MultiColumnList,
} from '@folio/stripes/components';
import { effectiveCallNumber } from '@folio/stripes/util';

import FeesFinesOwnedStatus from './components/FeesFinesOwnedStatus';

import css from './CheckedInListItems.css';

const COLUMNS_NAME = {
  TIME_RETURNED: 'timeReturned',
  TITLE: 'title',
  BARCODE: 'barcode',
  EFFECTIVE_CALL_NUMBER: 'effectiveCallNumber',
  LOCATION: 'location',
  IN_HOUSE_USE: 'inHouseUse',
  STATUS: 'status',
  ACTION: ' ',
};
const visibleColumns = [
  COLUMNS_NAME.TIME_RETURNED,
  COLUMNS_NAME.TITLE,
  COLUMNS_NAME.BARCODE,
  COLUMNS_NAME.EFFECTIVE_CALL_NUMBER,
  COLUMNS_NAME.LOCATION,
  COLUMNS_NAME.IN_HOUSE_USE,
  COLUMNS_NAME.STATUS,
  COLUMNS_NAME.ACTION,
];
const columnWidths = {
  [COLUMNS_NAME.TIME_RETURNED]: { max: 120 },
  [COLUMNS_NAME.TITLE]: { max: 300 },
  [COLUMNS_NAME.BARCODE]: { max: 200 },
  [COLUMNS_NAME.EFFECTIVE_CALL_NUMBER]: { max: 200 },
  [COLUMNS_NAME.LOCATION]: { max: 200 },
  [COLUMNS_NAME.IN_HOUSE_USE]: { max: 80 },
  [COLUMNS_NAME.STATUS]: { max: 120 },
  [COLUMNS_NAME.ACTION]: { max: 80 },
};
const columnMapping = {
  [COLUMNS_NAME.TIME_RETURNED]: <FormattedMessage id="ui-checkin.timeReturned" />,
  [COLUMNS_NAME.TITLE]: <FormattedMessage id="ui-checkin.title" />,
  [COLUMNS_NAME.BARCODE]: <FormattedMessage id="ui-checkin.barcode" />,
  [COLUMNS_NAME.EFFECTIVE_CALL_NUMBER]: <FormattedMessage id="ui-checkin.effectiveCallNumber" />,
  [COLUMNS_NAME.LOCATION]: <FormattedMessage id="ui-checkin.location" />,
  [COLUMNS_NAME.IN_HOUSE_USE]: <FormattedMessage id="ui-checkin.inHouseUse" />,
  [COLUMNS_NAME.STATUS]: <FormattedMessage id="ui-checkin.status" />,
  [COLUMNS_NAME.ACTION]: <FormattedMessage id="ui-checkin.actions" />,
};
const TIME_FORMAT = {
  day: 'numeric',
  month: 'numeric',
  year: 'numeric',
};

class CheckedInListItems extends React.Component {
  static propTypes = {
    intl: PropTypes.object.isRequired,
    loading: PropTypes.bool.isRequired,
    scannedItems: PropTypes.arrayOf(PropTypes.object),
    mutator: PropTypes.object.isRequired,
    renderActions: PropTypes.func.isRequired,
  }

  showInfo(loan) {
    const content =
      (
        <>
          <KeyValue label={<FormattedMessage id="ui-checkin.processedAs" />}>
            <FormattedTime
              value={loan.returnDate}
              {...TIME_FORMAT}
            />
          </KeyValue>
          <KeyValue label={<FormattedMessage id="ui-checkin.actual" />}>
            <FormattedTime
              value={new Date()}
              {...TIME_FORMAT}
            />
          </KeyValue>
        </>
      );

    return (
      <InfoPopover content={content} />
    );
  }

  render() {
    const {
      intl: {
        formatTime,
      },
      loading,
      scannedItems,
      mutator,
      renderActions,
    } = this.props;
    const emptyMessage = loading
      ? null
      : <FormattedMessage id="ui-checkin.noItems" />;
    const itemListFormatter = {
      [COLUMNS_NAME.TIME_RETURNED]: loan => (
        <div>
          { loan.returnDate ?
            <div className={css.timeReturned}>
              <div data-test-check-in-return-time>
                {loan.returnDate && formatTime(`${get(loan, ['returnDate'])}`)}
              </div>
              <div key={loan.id}>
                {this.showInfo(loan)}
              </div>
            </div> :
            null
          }
          { loan.userId && loan.itemId &&
          <IfPermission perm="accounts.collection.get">
            <FeesFinesOwnedStatus
              key={loan.id}
              userId={loan.userId}
              itemId={loan.itemId}
              mutator={mutator}
              loanId={loan.id}
            />
          </IfPermission>
          }
        </div>
      ),
      [COLUMNS_NAME.TITLE]: (loan) => {
        const title = `${get(loan, ['item', 'title'])}`;
        const materialType = `${get(loan, ['item', 'materialType', 'name'])}`;

        return `${title} (${materialType})`;
      },
      [COLUMNS_NAME.BARCODE]: (loan) => `${get(loan, ['item', 'barcode'])}`,
      [COLUMNS_NAME.LOCATION]: (loan) => `${get(loan, ['item', 'location', 'name'])}`,
      [COLUMNS_NAME.IN_HOUSE_USE]: loan => {
        return get(loan, 'inHouseUse')
          ? <Icon
              icon="house"
              iconClassName={css.houseIcon}
          />
          : '';
      },
      [COLUMNS_NAME.STATUS]: (loan) => {
        const status = `${get(loan, ['item', 'status', 'name'])}`;
        const inTransitSp = get(loan, ['item', 'inTransitDestinationServicePoint', 'name']);

        return (inTransitSp) ? `${status} - ${inTransitSp}` : status;
      },
      [COLUMNS_NAME.EFFECTIVE_CALL_NUMBER]: (loan) => effectiveCallNumber(loan),
      [COLUMNS_NAME.ACTION]: (loan) => renderActions(loan),
    };

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

export default injectIntl(CheckedInListItems);
