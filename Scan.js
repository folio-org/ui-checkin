import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import dateFormat from 'dateformat';
import { FormattedMessage } from 'react-intl';
import Button from '@folio/stripes-components/lib/Button';
import DropdownMenu from '@folio/stripes-components/lib/DropdownMenu';
import MenuItem from '@folio/stripes-components/lib/MenuItem';
import { SubmissionError, change, reset } from 'redux-form';
import { UncontrolledDropdown } from '@folio/stripes-components/lib/Dropdown';
import InfoPopover from '@folio/stripes-components/lib/structures/InfoPopover';
import CheckIn from './CheckIn';
import formatDateTimePicker from './util';

class Scan extends React.Component {
  static propTypes = {
    stripes: PropTypes.object,
    resources: PropTypes.shape({
      scannedItems: PropTypes.arrayOf(
        PropTypes.shape({
          id: PropTypes.string,
        }),
      ),
      patrons: PropTypes.shape({
        records: PropTypes.arrayOf(PropTypes.object),
      }),
      items: PropTypes.shape({
        records: PropTypes.arrayOf(PropTypes.object),
      }),
      holdings: PropTypes.shape({
        records: PropTypes.arrayOf(PropTypes.object),
      }),
    }),
    mutator: PropTypes.shape({
      query: {},
      patrons: PropTypes.shape({
        GET: PropTypes.func,
        reset: PropTypes.func,
      }),
      items: PropTypes.shape({
        GET: PropTypes.func,
        reset: PropTypes.func,
      }),
      loans: PropTypes.shape({
        GET: PropTypes.func,
        PUT: PropTypes.func,
        reset: PropTypes.func,
      }),
      holdings: PropTypes.shape({
        GET: PropTypes.func,
        reset: PropTypes.func,
      }),
      scannedItems: PropTypes.shape({
        replace: PropTypes.func,
      }),
    }),
  };

  static contextTypes = {
    history: PropTypes.object,
  };

  static manifest = Object.freeze({
    scannedItems: { initialValue: [] },
    query: { initialValue: {} },
    items: {
      type: 'okapi',
      records: 'items',
      path: 'inventory/items',
      accumulate: 'true',
      fetch: false,
    },
    patrons: {
      type: 'okapi',
      records: 'users',
      path: 'users',
      accumulate: 'true',
      fetch: false,
    },
    loans: {
      type: 'okapi',
      records: 'loans',
      accumulate: 'true',
      path: 'circulation/loans',
      fetch: false,
    },
    holdings: {
      type: 'okapi',
      records: 'holdingsRecords',
      path: 'holdings-storage/holdings',
      accumulate: 'true',
      fetch: false,
    },
  });

  constructor(props, context) {
    super(props, context);
    this.context = context;
    this.store = props.stripes.store;
    this.formatDateTime = props.stripes.formatDateTime;
    this.onClickCheckin = this.onClickCheckin.bind(this);
    this.timezone = this.props.stripes.timezone;
    this.dateTime = props.stripes.dateTime;
    this.renderActions = this.renderActions.bind(this);
    this.showInfo = this.showInfo.bind(this);
    this.onSessionEnd = this.onSessionEnd.bind(this);
    this.handleOptionsChange = this.handleOptionsChange.bind(this);
    this.getChildRef = this.getChildRef.bind(this);
    this.barcodeElement = null;
  }

  handleOptionsChange(itemMeta, e) {
    e.preventDefault();
    e.stopPropagation();

    const { loan, action } = itemMeta;

    if (action && this[action]) {
      this[action](loan);
    }
  }

  showLoanDetails(loan, e) {
    if (e) e.preventDefault();
    this.props.mutator.query.update({
      _path: `/users/view/${loan.userId}?layer=loan&loan=${loan.id}`,
    });
  }

  showPatronDetails(loan, e) {
    if (e) e.preventDefault();
    this.props.mutator.query.update({
      _path: `/users/view/${_.get(loan, ['patron', 'id'])}`,
    });
  }

  showItemDetails(loan, e) {
    if (e) e.preventDefault();
    this.props.mutator.query.update({
      _path: `/inventory/view/${loan.item.instanceId}/${loan.item.holdingsRecordId}/${loan.itemId}`,
    });
  }

  renderActions(loan) {
    return (
      <UncontrolledDropdown onSelectItem={this.handleOptionsChange}>
        <Button data-role="toggle" buttonStyle="hover dropdownActive"><strong>•••</strong></Button>
        <DropdownMenu data-role="menu" overrideStyle={{ padding: '6px 0' }}>
          <MenuItem itemMeta={{ loan, action: 'showLoanDetails' }}>
            <Button buttonStyle="dropdownItem" href={`/users/view/${loan.userId}?layer=loan&loan=${loan.id}`}>
              <FormattedMessage id="ui-checkin.loanDetails" />
            </Button>
          </MenuItem>
          <MenuItem itemMeta={{ loan, action: 'showPatronDetails' }}>
            <Button buttonStyle="dropdownItem" href={`/users/view/${_.get(loan, ['patron', 'id'])}`}>
              <FormattedMessage id="ui-checkin.patronDetails" />
            </Button>
          </MenuItem>
          <MenuItem itemMeta={{ loan, action: 'showItemDetails' }}>
            <Button buttonStyle="dropdownItem" href={`/inventory/view/${loan.item.instanceId}/${loan.item.holdingsRecordId}/${loan.itemId}`}>
              <FormattedMessage id="ui-checkin.itemDetails" />
            </Button>
          </MenuItem>
        </DropdownMenu>
      </UncontrolledDropdown>
    );
  }

  showInfo(loan) {
    this.systemReturnDate = loan.systemReturnDate;
    const content =
    (
      <div style={{ textAlign: 'left' }}>
        <div>
          <strong>
            <FormattedMessage id="ui-checkin.processedAs" />
          </strong>
        </div>
        <div>{this.formatDateTime(this.systemReturnDate)}</div>
        <br />
        <div>
          <strong>
            <FormattedMessage id="ui-checkin.actual" />
          </strong>
        </div>
        <div>{this.formatDateTime(new Date())}</div>
      </div>
    );

    return (
      <InfoPopover content={content} />
    );
  }

  onSessionEnd() {
    this.clearResources();
    this.clearForm('CheckIn');
  }

  clearForm(formName) {
    this.store.dispatch(reset(formName));
  }

  clearResources() {
    this.props.mutator.scannedItems.replace([]);
    this.props.mutator.patrons.reset();
    this.props.mutator.items.reset();
    this.props.mutator.loans.reset();
  }

  onClickCheckin(data) {
    const fillOutMsg = this.props.stripes.intl.formatMessage({ id: 'ui-checkin.fillOut' });
    if (!data.item || !data.item.barcode) {
      throw new SubmissionError({ item: { barcode: fillOutMsg } });
    }

    const input = this.barcodeElement.getRenderedComponent().input;
    return this.fetchItemByBarcode(data.item.barcode)
      .then(item => this.fetchLoanByItemId(item.id))
      .then(loan => this.putReturn(loan, data.item.checkinDate, data.item.checkinTime))
      .then(loan => this.fetchLoanById(loan.id))
      .then(loan => this.fetchPatron(loan))
      .then(loan => this.fetchHoldings(loan))
      .then(loan => this.addScannedItem(loan))
      .then(() => {
        this.clearField('CheckIn', 'item.barcode');
        setTimeout(() => input.focus());
      })
      .catch((error) => {
        setTimeout(() => input.select());
        throw new SubmissionError(error);
      });
  }

  fetchItemByBarcode(barcode) {
    const itemNoExistMsg = this.props.stripes.intl.formatMessage({ id: 'ui-checkin.itemNoExist' });
    const query = `(barcode=="${barcode}")`;
    this.props.mutator.items.reset();
    return this.props.mutator.items.GET({ params: { query } }).then((items) => {
      if (!items.length) {
        this.throwError({ item: { barcode: itemNoExistMsg, _error: 'Scan failed' } });
      }
      return items[0];
    });
  }

  fetchLoanByItemId(itemId) {
    const query = `(itemId==${itemId} AND status.name=="Open")`;
    return this.fetchLoan(query);
  }

  fetchLoanById(loanId) {
    const query = `(id==${loanId})`;
    return this.fetchLoan(query);
  }

  fetchLoan(query) {
    const loanNoExistMsg = this.props.stripes.intl.formatMessage({ id: 'ui-checkin.loanNoExist' });
    this.props.mutator.loans.reset();
    return this.props.mutator.loans.GET({ params: { query } }).then((loans) => {
      if (!loans.length) {
        this.throwError({ item: { barcode: loanNoExistMsg, _error: 'Scan failed' } });
      }
      return loans[0];
    });
  }

  putReturn(loan, checkinDate, checkinTime) {
    //  Get the Date Time combo in UTC to be sent down to the server
    const systemReturnDateUTC = formatDateTimePicker(checkinDate, checkinTime, this.timezone);
    Object.assign(loan, {
      systemReturnDate: systemReturnDateUTC,
      returnDate: dateFormat(new Date(), "yyyy-mm-dd'T'HH:MM:ss'Z'"),
      status: { name: 'Closed' },
      action: 'checkedin',
    });
    return this.props.mutator.loans.PUT(loan);
  }

  fetchPatron(loan) {
    const userNoExistMsg = this.props.stripes.intl.formatMessage({ id: 'ui-checkin.userNoExist' }, { userId: loan.userId });
    const query = `(id=="${loan.userId}")`;
    this.props.mutator.patrons.reset();
    return this.props.mutator.patrons.GET({ params: { query } }).then((patrons) => {
      if (!patrons.length) {
        this.throwError({ patron: { identifier: userNoExistMsg, _error: 'Scan failed' } });
      }
      return Object.assign(loan, { patron: patrons[0] });
    });
  }

  fetchHoldings(loan) {
    const query = `(id=="${loan.userId}")`;
    return this.props.mutator.holdings.GET({ params: { query } }).then(holdings => Object.assign(loan, { holding: holdings[0] }));
  }

  addScannedItem(loan) {
    const scannedItems = [loan].concat(this.props.resources.scannedItems);
    return this.props.mutator.scannedItems.replace(scannedItems);
  }

  clearField(formName, fieldName) {
    this.props.stripes.store.dispatch(change(formName, fieldName, ''));
  }

  getChildRef(r) {
    this.barcodeElement = r;
  }

  throwError(error) {
    this.error = error;
    throw this.error;
  }

  render() {
    const scannedItems = this.props.resources.scannedItems || [];

    return (
      <CheckIn
        submithandler={this.onClickCheckin}
        renderActions={this.renderActions}
        showInfo={this.showInfo}
        onSessionEnd={this.onSessionEnd}
        scannedItems={scannedItems}
        retrieveRef={this.getChildRef}
        initialValues={
          { item:
            {
              checkinDate: 'today',
              checkinTime: 'now',
            } }
        }
        {...this.props}
      />
    );
  }
}

export default Scan;
