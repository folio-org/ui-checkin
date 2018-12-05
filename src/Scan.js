import { get, minBy, upperFirst } from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, injectIntl, intlShape } from 'react-intl';
import moment from 'moment-timezone';
import { SubmissionError, change, reset } from 'redux-form';
import SafeHTMLMessage from '@folio/react-intl-safe-html';

import CheckIn from './CheckIn';
import { statuses } from './consts';
import ConfirmStatusModal from './components/ConfirmStatusModal';

class Scan extends React.Component {
  static manifest = Object.freeze({
    scannedItems: { initialValue: [] },
    query: { initialValue: {} },
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
      path: 'staff-slips-storage/staff-slips',
      throwErrors: false,
    },
    checkIn: {
      type: 'okapi',
      path: 'circulation/check-in-by-barcode',
      fetch: false,
      throwErrors: false,
    }
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
      requests: PropTypes.shape({
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
      checkIn: PropTypes.shape({
        POST: PropTypes.func,
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

    this.checkIn = this.checkIn.bind(this);
    this.onSessionEnd = this.onSessionEnd.bind(this);
    this.onConfirm = this.onConfirm.bind(this);

    this.checkInRef = React.createRef();
    this.state = {};
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
  }

  validate(item) {
    const { intl: { formatMessage } } = this.props;
    const barcode = formatMessage({ id: 'ui-checkin.fillOut' });
    if (!item || !item.barcode) {
      throw new SubmissionError({ item: { barcode } });
    }
  }

  checkIn(data, checkInInst) {
    const { mutator: { checkIn }, stripes: { user } } = this.props;
    const { item } = data;
    this.validate(item);

    const { barcode, checkinDate, checkinTime } = item;
    const servicePointId = get(user, ['user', 'curServicePoint', 'id'], '');
    const checkInDate = this.buildDateTime(checkinDate, checkinTime);
    const requestData = {
      servicePointId,
      checkInDate,
      itemBarcode: barcode,
    };

    return checkIn.POST(requestData)
      .then(checkinResp => this.processResponse(checkinResp))
      .then(checkinResp => this.addScannedItem(checkinResp))
      .then(() => this.clearField('CheckIn', 'item.barcode'))
      .catch(resp => this.processError(resp))
      .finally(() => checkInInst.focusInput());
  }

  processResponse(checkinResp) {
    const { loan, item } = checkinResp;
    const transitItem = loan || { item };
    if (get(transitItem, 'item.status.name') === statuses.IN_TRANSIT) {
      this.setState({ transitItem });
      return checkinResp;
    }
    return this.fetchRequest(checkinResp);
  }

  processError(resp) {
    const contentType = resp.headers.get('Content-Type') || '';
    if (contentType.startsWith('application/json')) {
      return resp.json().then(error => this.handleJsonError(error));
    } else {
      return resp.text().then(error => this.handleTextError(error));
    }
  }

  handleTextError(error) {
    const item = { barcode: error };
    throw new SubmissionError({ item });
  }

  handleJsonError({
    errors: [
      {
        parameters,
        message,
      } = {},
    ] = [],
  }) {
    const itemError = (!parameters || !parameters.length)
      ? {
        barcode: <FormattedMessage id="ui-checkin.unknownError" />,
        _error: 'unknownError',
      }
      : {
        barcode: message,
        _error: parameters[0].key,
      };

    throw new SubmissionError({ item: itemError });
  }

  fetchRequest(checkinResp) {
    const { loan } = checkinResp;
    if (!loan) return checkinResp;

    const query = `(itemId==${loan.itemId} and requestType=="Hold" and (status=="Open - Not yet filled" or status=="Open - Awaiting pickup"))`;
    const { mutator } = this.props;
    mutator.requests.reset();
    return mutator.requests.GET({ params: { query } }).then((requests) => {
      if (requests.length) {
        const nextRequest = minBy(requests, 'position');
        nextRequest.item = loan.item;
        this.setState({ nextRequest });
      }

      return checkinResp;
    });
  }

  buildDateTime(date, time) {
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

  addScannedItem({ loan, item }) {
    const { mutator, resources } = this.props;
    const scannedItem = loan || { item };
    const scannedItems = [scannedItem].concat(resources.scannedItems);
    return mutator.scannedItems.replace(scannedItems);
  }

  clearField(formName, fieldName) {
    this.props.stripes.store.dispatch(change(formName, fieldName, ''));
  }

  throwError(error) {
    this.error = error;
    throw this.error;
  }

  onConfirm() {
    this.setState({
      nextRequest: null,
      transitItem: null
    });
  }

  getSlipTmpl(type) {
    const { resources } = this.props;
    const staffSlips = (resources.staffSlips || {}).records || [];
    const staffSlip = staffSlips.find(slip => slip.name.toLowerCase() === type);
    return get(staffSlip, ['template'], '');
  }

  renderHoldModal(request) {
    const { intl: { formatDate } } = this.props;
    const { item = {}, requester } = request;
    const slipData = {
      'Item title': item.title,
      'Item barcode': `<Barcode>${item.barcode}</Barcode>`,
      'Transaction Id': request.id,
      'Requester last name': requester.lastName,
      'Requester first name': requester.firstName,
      'Hold expiration':  formatDate(request.requestDate, { timeZone: 'UTC' }),
      'Item call number': request.itemId,
      'Requester barcode': `<Barcode>${requester.barcode}</Barcode>`,
    };

    const message = (
      <SafeHTMLMessage
        id="ui-checkin.statusModal.hold.message"
        values={{
          title: item.title,
          barcode: item.barcode,
          materialType: upperFirst(get(item, ['materialType', 'name'], ''))
        }}
      />
    );

    return (
      <ConfirmStatusModal
        open={!!request}
        onConfirm={this.onConfirm}
        slipTemplate={this.getSlipTmpl('hold')}
        slipData={slipData}
        label={<FormattedMessage id="ui-checkin.statusModal.hold.heading" />}
        message={message}
      />
    );
  }

  renderTransitionModal(loan) {
    const { intl: { formatDate } } = this.props;
    const { item = {} } = loan;
    const authors = (item.contributors || []).map(c => c.name).join(', ');
    const destinationServicePoint = get(item, 'inTransitDestinationServicePoint.name', '');
    const slipData = {
      'From Service Point': get(item, 'location.name', ''),
      'To Service Point': destinationServicePoint,
      'Item title': item.title,
      'Item barcode': `<Barcode>${item.barcode}</Barcode>`,
      'Item author(s)': authors || '',
      'Item call number': item.callNumber,
      'Staff slip name': 'Transit',
    };

    if (loan.dueDate) {
      slipData['Needed for'] = formatDate(loan.dueDate, { timeZone: 'UTC' });
    }

    if (loan.loanDate) {
      slipData.Date = formatDate(loan.loanDate, { timeZone: 'UTC' });
    }

    const message = (
      <SafeHTMLMessage
        id="ui-checkin.statusModal.transit.message"
        values={{
          title: item.title,
          barcode: item.barcode,
          materialType: upperFirst(get(item, ['materialType', 'name'], '')),
          servicePoint: destinationServicePoint
        }}
      />
    );

    return (
      <ConfirmStatusModal
        open={!!loan}
        onConfirm={this.onConfirm}
        slipTemplate={this.getSlipTmpl('transit')}
        slipData={slipData}
        label={<FormattedMessage id="ui-checkin.statusModal.transit.heading" />}
        message={message}
      />
    );
  }

  render() {
    const { resources } = this.props;
    const scannedItems = resources.scannedItems || [];
    const { nextRequest, transitItem } = this.state;

    return (
      <div data-test-check-in-scan>
        {nextRequest && this.renderHoldModal(nextRequest)}
        {transitItem && this.renderTransitionModal(transitItem)}
        <CheckIn
          submithandler={this.checkIn}
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
