import React from 'react';
import PropTypes from 'prop-types';
import fetch from 'isomorphic-fetch';
import dateFormat from 'dateformat';
import { SubmissionError, change } from 'redux-form';

import CheckIn from './CheckIn';

class Scan extends React.Component {
  static contextTypes = {
    stripes: PropTypes.object,
  }

  static propTypes = {
    resources: PropTypes.shape({
      scannedItems: PropTypes.arrayOf(
        PropTypes.shape({
          id: PropTypes.string,
        }),
      ),
      patrons: PropTypes.arrayOf(
        PropTypes.shape({
          id: PropTypes.string,
        }),
      ),
    }),
    mutator: PropTypes.shape({
      mode: PropTypes.shape({
        replace: PropTypes.func,
      }),
      patrons: PropTypes.shape({
        replace: PropTypes.func,
      }),
      scannedItems: PropTypes.shape({
        replace: PropTypes.func,
      }),
    }),
  };

  static defaultProps = {
    mutator: {},
  };

  static manifest = Object.freeze({
    patrons: { initialValue: [] },
    scannedItems: { initialValue: [] },
  });

  constructor(props, context) {
    super(props);
    this.okapiUrl = context.stripes.okapi.url;
    this.httpHeaders = Object.assign({}, {
      'X-Okapi-Tenant': context.stripes.okapi.tenant,
      'X-Okapi-Token': context.stripes.store.getState().okapi.token,
      'Content-Type': 'application/json',
    });

    this.onClickCheckin = this.onClickCheckin.bind(this);
  }

  onClickCheckin(data) {
    if (!data.item || !data.item.barcode) {
      throw new SubmissionError({ item: { barcode: 'Please fill this out to continue' } });
    }

    return this.fetchItemByBarcode(data.item.barcode)
      .then(item => this.fetchLoanByItemId(item.id))
      .then(loan => this.putReturn(loan))
      .then(loan => this.fetchLoan(loan.id))
      .then(() => this.clearField('CheckIn', 'item.barcode'));
  }

  fetchItemByBarcode(barcode) {
    // fetch item by barcode to get item id
    return fetch(`${this.okapiUrl}/item-storage/items?query=(barcode="${barcode}")`, { headers: this.httpHeaders })
      .then((itemsResponse) => {
        if (itemsResponse.status >= 400) {
          throw new SubmissionError({ item: { barcode: `Error ${itemsResponse.status} retrieving item by barcode ${barcode}`, _error: 'Scan failed' } });
        } else {
          return itemsResponse.json();
        }
      })
      .then((itemsJson) => {
        if (itemsJson.items.length === 0) {
          throw new SubmissionError({ item: { barcode: 'Item with this barcode does not exist', _error: 'Scan failed' } });
        } else {
          const item = JSON.parse(JSON.stringify(itemsJson.items[0]));
          return item;
        }
      });
  }

  fetchLoanByItemId(itemId) {
    return fetch(`${this.okapiUrl}/circulation/loans?query=(itemId=${itemId} AND status="Open")`, { headers: this.httpHeaders })
      .then(loansResponse => loansResponse.json())
      .then((loansJson) => {
        if (loansJson.loans.length === 0) {
          throw new SubmissionError({ load: { barcode: 'Loan with this item id does not exist', _error: 'Scan failed' } });
        } else {
          // PUT the loan with a returnDate and status 'Closed'
          return loansJson.loans[0];
        }
      });
  }

  putReturn(loan) {
    Object.assign(loan, {
      returnDate: dateFormat(new Date(), "yyyy-mm-dd'T'HH:MM:ss'Z'"),
      status: { name: 'Closed' },
      action: 'checkedin',
    });

    return fetch(`${this.okapiUrl}/circulation/loans/${loan.id}`, {
      method: 'PUT',
      headers: this.httpHeaders,
      body: JSON.stringify(loan),
    })
    .then(() => loan);
  }

  fetchLoan(loanid) {
    return fetch(`${this.okapiUrl}/circulation/loans?query=(id=${loanid})`, {
      headers: this.httpHeaders,
    }).then(response =>
      response.json().then((json) => {
        const loans = JSON.parse(JSON.stringify(json.loans));
        return this.fetchPatron(loans)
          .then((patron) => {
            const extLoans = loans[0];
            extLoans.patron = patron;
            return extLoans;
          }).then((extLoans) => {
            const scannedItems = [];
            scannedItems.push(extLoans);
            return this.props.mutator.scannedItems.replace(scannedItems.concat(this.props.resources.scannedItems));
          });
      }),
    );
  }

  fetchPatron(loans) {
    return fetch(`${this.okapiUrl}/users/${loans[0].userId}`, { headers: this.httpHeaders })
      .then((response) => {
        if (response.status >= 400) {
          throw new SubmissionError({ patron: { identifier: `Error ${response.status} retrieving patron by id`, _error: 'Scan failed' } });
        } else {
          return response.json();
        }
      });
  }

  clearField(formName, fieldName) {
    this.context.stripes.store.dispatch(change(formName, fieldName, ''));
  }

  render() {
    const { resources: { scannedItems, patrons } } = this.props;

    return React.createElement(CheckIn, {
      submithandler: this.onClickCheckin,
      initialValues: {},
      patrons,
      scannedItems,
      parentProps: this.props,
    });
  }
}

export default Scan;
