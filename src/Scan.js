import get from 'lodash/get';
import minBy from 'lodash/minBy';
import React from 'react';
import PropTypes from 'prop-types';
import dateFormat from 'dateformat';
import { FormattedMessage, FormattedTime, injectIntl, intlShape } from 'react-intl';
import moment from 'moment-timezone';
import {
  Button,
  DropdownMenu,
  KeyValue,
  MenuItem,
  UncontrolledDropdown,
  InfoPopover
} from '@folio/stripes/components';

import { SubmissionError, change, reset } from 'redux-form';
import CheckIn from './CheckIn';
import ConfirmStatusModal from './components/ConfirmStatusModal';

class Scan extends React.Component {
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
    requests: {
      type: 'okapi',
      records: 'requests',
      accumulate: 'true',
      path: 'circulation/requests',
      fetch: false,
    },
    staffSlips: {
      type: 'okapi',
      records: 'staffSlips',
      path: 'staff-slips-storage/staff-slips?query=(name=="Hold")',
      throwErrors: false,
    },
  });

  static propTypes = {
    intl: intlShape,
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
      requests: PropTypes.shape({
        records: PropTypes.arrayOf(PropTypes.object),
      }),
      loans: PropTypes.shape({
        records: PropTypes.arrayOf(PropTypes.object),
      }),
      staffSlips: PropTypes.shape({
        records: PropTypes.arrayOf(PropTypes.object),
      }),
    }),

    mutator: PropTypes.shape({
      query: PropTypes.shape({
        update: PropTypes.func,
      }),
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
      requests: PropTypes.shape({
        GET: PropTypes.func,
        reset: PropTypes.func,
      }),
      scannedItems: PropTypes.shape({
        replace: PropTypes.func,
      }),
      staffSlips: PropTypes.shape({
        GET: PropTypes.func,
      }),
    }),
  };

  constructor(props) {
    super(props);
    this.store = props.stripes.store;
    this.onClickCheckin = this.onClickCheckin.bind(this);
    this.renderActions = this.renderActions.bind(this);
    this.showInfo = this.showInfo.bind(this);
    this.onSessionEnd = this.onSessionEnd.bind(this);
    this.handleOptionsChange = this.handleOptionsChange.bind(this);
    this.onConfirm = this.onConfirm.bind(this);
    this.onCancel = this.onCancel.bind(this);

    this.checkInRef = React.createRef();
    this.state = {};
  }

  handleOptionsChange(itemMeta, e) {
    e.preventDefault();
    e.stopPropagation();

    const { loan, action } = itemMeta;

    if (action && this[action]) {
      this[action](loan);
    }
  }

  showLoanDetails(loan) {
    this.props.mutator.query.update({
      _path: `/users/view/${loan.userId}?layer=loan&loan=${loan.id}`,
    });
  }

  showPatronDetails(loan) {
    this.props.mutator.query.update({
      _path: `/users/view/${get(loan, ['patron', 'id'])}`,
    });
  }

  showItemDetails(loan) {
    this.props.mutator.query.update({
      _path: `/inventory/view/${loan.item.instanceId}/${loan.item.holdingsRecordId}/${loan.itemId}`,
    });
  }

  renderActions(loan) {
    return (
      <div data-test-elipse-select>
        <UncontrolledDropdown onSelectItem={this.handleOptionsChange}>
          <Button data-role="toggle" buttonStyle="hover dropdownActive"><strong>•••</strong></Button>
          <DropdownMenu data-role="menu" overrideStyle={{ padding: '6px 0' }}>
            <MenuItem itemMeta={{ loan, action: 'showLoanDetails' }}>
              <div data-test-loan-details>
                <Button buttonStyle="dropdownItem" href={`/users/view/${loan.userId}?layer=loan&loan=${loan.id}`}>
                  <FormattedMessage id="ui-checkin.loanDetails" />
                </Button>
              </div>
            </MenuItem>
            <MenuItem itemMeta={{ loan, action: 'showPatronDetails' }}>
              <div data-test-patron-details>
                <Button buttonStyle="dropdownItem" href={`/users/view/${get(loan, ['patron', 'id'])}`}>
                  <FormattedMessage id="ui-checkin.patronDetails" />
                </Button>
              </div>
            </MenuItem>
            <MenuItem itemMeta={{ loan, action: 'showItemDetails' }}>
              <div data-test-item-details>
                <Button buttonStyle="dropdownItem" href={`/inventory/view/${loan.item.instanceId}/${loan.item.holdingsRecordId}/${loan.itemId}`}>
                  <FormattedMessage id="ui-checkin.itemDetails" />
                </Button>
              </div>
            </MenuItem>
          </DropdownMenu>
        </UncontrolledDropdown>
      </div>
    );
  }

  showInfo(loan) {
    this.systemReturnDate = loan.systemReturnDate;
    const content =
    (
      <div>
        <KeyValue label={<FormattedMessage id="ui-checkin.processedAs" />}>
          <FormattedTime value={this.systemReturnDate} day="numeric" month="numeric" year="numeric" />
        </KeyValue>
        <KeyValue label={<FormattedMessage id="ui-checkin.actual" />}>
          <FormattedTime value={new Date()} day="numeric" month="numeric" year="numeric" />
        </KeyValue>
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

  onClickCheckin(data, checkInInst) {
    const { intl: { formatMessage } } = this.props;
    const fillOutMsg = formatMessage({ id: 'ui-checkin.fillOut' });

    if (!data.item || !data.item.barcode) {
      throw new SubmissionError({ item: { barcode: fillOutMsg } });
    }

    return this.fetchItemByBarcode(data.item.barcode)
      .then(item => this.fetchLoanByItemId(item.id))
      .then(loan => this.putReturn(loan, data.item.checkinDate, data.item.checkinTime))
      .then(loan => this.fetchLoanById(loan.id))
      .then(loan => this.fetchPatron(loan))
      .then(loan => this.fetchRequest(loan))
      .then(loan => this.addScannedItem(loan))
      .then(() => {
        this.clearField('CheckIn', 'item.barcode');
        setTimeout(() => checkInInst.focusInput());
      })
      .catch((error) => {
        setTimeout(() => checkInInst.focusInput());
        throw new SubmissionError(error);
      });
  }

  fetchItemByBarcode(barcode) {
    const { intl: { formatMessage } } = this.props;
    const itemNoExistMsg = formatMessage({ id: 'ui-checkin.itemNoExist' });
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
    const { intl: { formatMessage } } = this.props;
    const loanNoExistMsg = formatMessage({ id: 'ui-checkin.loanNoExist' });
    this.props.mutator.loans.reset();
    return this.props.mutator.loans.GET({ params: { query } }).then((loans) => {
      if (!loans.length) {
        this.throwError({ item: { barcode: loanNoExistMsg, _error: 'Scan failed' } });
      }
      return loans[0];
    });
  }

  fetchRequest(loan) {
    const query = `(itemId==${loan.itemId} and requestType=="Hold" and (status=="Open - Not yet filled" or status=="Open - Awaiting pickup"))`;
    this.props.mutator.requests.reset();
    return this.props.mutator.requests.GET({ params: { query } }).then((requests) => {
      if (requests.length) {
        const nextRequest = minBy(requests, 'position');
        this.setState({ nextRequest });
      }
      return loan;
    });
  }

  buildDateTime = (date, time) => {
    if (date && time) {
      let timeString = time;

      if (time.indexOf('T') > -1) {
        timeString = time.split('T')[1];
      }

      return `${date.substring(0, 10)}T${timeString}`;
    } else {
      return moment().tz('UTC').format();
    }
  }

  putReturn(loan, checkinDate, checkinTime) {
    //  Get the Date Time combo in UTC to be sent down to the server
    Object.assign(loan, {
      systemReturnDate: this.buildDateTime(checkinDate, checkinTime),
      returnDate: dateFormat(new Date(), "yyyy-mm-dd'T'HH:MM:ss'Z'"),
      status: { name: 'Closed' },
      action: 'checkedin',
    });
    return this.props.mutator.loans.PUT(loan);
  }

  fetchPatron(loan) {
    const { intl: { formatMessage } } = this.props;
    const userNoExistMsg = formatMessage({ id: 'ui-checkin.userNoExist' }, { userId: loan.userId });
    const query = `(id=="${loan.userId}")`;
    this.props.mutator.patrons.reset();
    return this.props.mutator.patrons.GET({ params: { query } }).then((patrons) => {
      if (!patrons.length) {
        this.throwError({ patron: { identifier: userNoExistMsg, _error: 'Scan failed' } });
      }
      return Object.assign(loan, { patron: patrons[0] });
    });
  }

  addScannedItem(loan) {
    const scannedItems = [loan].concat(this.props.resources.scannedItems);
    return this.props.mutator.scannedItems.replace(scannedItems);
  }

  clearField(formName, fieldName) {
    this.props.stripes.store.dispatch(change(formName, fieldName, ''));
  }

  throwError(error) {
    this.error = error;
    throw this.error;
  }

  onConfirm() {
    // TODO: handle transit
    this.setState({ nextRequest: null });
  }

  onCancel() {
    this.setState({ nextRequest: null });
  }

  render() {
    const { resources } = this.props;
    const { nextRequest } = this.state;
    const scannedItems = resources.scannedItems || [];
    const staffSlips = (resources.staffSlips || {}).records || [];
    const holdSlip = staffSlips[0] || {};

    return (
      <div data-test-check-in-scan>
        {nextRequest &&
          <ConfirmStatusModal
            open={!!nextRequest}
            request={nextRequest}
            onConfirm={this.onConfirm}
            holdSlipTemplate={holdSlip.template}
            onCancel={this.onCancel}
          />
        }
        <CheckIn
          submithandler={this.onClickCheckin}
          renderActions={this.renderActions}
          showInfo={this.showInfo}
          onSessionEnd={this.onSessionEnd}
          scannedItems={scannedItems}
          ref={this.checkInRef}
          initialValues={
            { item:
              {
                checkinDate: '',
                checkinTime: '',
              } }
          }
          {...this.props}
        />
      </div>
    );
  }
}

export default injectIntl(Scan);
