import React from 'react';
import PropTypes from 'prop-types';
import dateFormat from 'dateformat';
import { SubmissionError, change } from 'redux-form';

import CheckIn from './CheckIn';

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

  static manifest = Object.freeze({
    scannedItems: { initialValue: [] },
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
      fetch: false,
    },
  });

  constructor(props) {
    super(props);
    this.onClickCheckin = this.onClickCheckin.bind(this);
  }

  onClickCheckin(data) {
    if (!data.item || !data.item.barcode) {
      throw new SubmissionError({ item: { barcode: 'Please fill this out to continue' } });
    }

    return this.fetchItemByBarcode(data.item.barcode)
      .then(item => this.fetchLoanByItemId(item.id))
      .then(loan => this.putReturn(loan))
      .then(loan => this.fetchLoanById(loan.id))
      .then(loan => this.fetchPatron(loan))
      .then(loan => this.addScannedItem(loan))
      .then(() => this.clearField('CheckIn', 'item.barcode'));
  }

  fetchItemByBarcode(barcode) {
    const query = `(barcode="${barcode}")`;
    this.props.mutator.items.reset();
    return this.props.mutator.items.GET({ params: { query } }).then((items) => {
      if (!items.length) {
        throw new SubmissionError({ item: { barcode: 'Item with this barcode does not exist', _error: 'Scan failed' } });
      }
      return items[0];
    });
  }

  fetchLoanByItemId(itemId) {
    const query = `(itemId=${itemId} AND status="Open")`;
    return this.fetchLoan(query);
  }

  fetchLoanById(loanId) {
    const query = `(id=${loanId})`;
    return this.fetchLoan(query);
  }

  fetchLoan(query) {
    this.props.mutator.loans.reset();
    return this.props.mutator.loans.GET({ params: { query } }).then((loans) => {
      if (!loans.length) {
        throw new SubmissionError({ item: { barcode: 'Loan does not exist', _error: 'Scan failed' } });
      }
      return loans[0];
    });
  }

  putReturn(loan) {
    Object.assign(loan, {
      returnDate: dateFormat(new Date(), "yyyy-mm-dd'T'HH:MM:ss'Z'"),
      status: { name: 'Closed' },
      action: 'checkedin',
    });

    return this.props.mutator.loans.PUT(loan);
  }

  fetchPatron(loan) {
    const query = `(id="${loan.userId}")`;
    this.props.mutator.patrons.reset();
    return this.props.mutator.patrons.GET({ params: { query } }).then((patrons) => {
      if (!patrons.length) {
        throw new SubmissionError({ patron: { identifier: `User with ${loan.userId} does not exist`, _error: 'Scan failed' } });
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

  render() {
    const scannedItems = this.props.resources.scannedItems || [];

    return (
      <CheckIn
        submithandler={this.onClickCheckin}
        scannedItems={scannedItems}
        initialValues={{ item: { checkinTime: new Date() } }}
        {...this.props}
      />
    );
  }
}

export default Scan;
