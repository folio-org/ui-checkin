import { get, minBy, upperFirst, isEmpty } from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, injectIntl, intlShape } from 'react-intl';
import moment from 'moment-timezone';
import { SubmissionError, change, reset } from 'redux-form';
import SafeHTMLMessage from '@folio/react-intl-safe-html';
import {
  Modal,
  ModalFooter,
  Button,
} from '@folio/stripes/components';
import MultipieceModal from './components/MultipieceModal';
import CheckIn from './CheckIn';
import { statuses } from './consts';
import ConfirmStatusModal from './components/ConfirmStatusModal';


class Scan extends React.Component {
  static manifest = Object.freeze({
    scannedItems: { initialValue: [] },
    query: { initialValue: {} },
    items: {
      type: 'okapi',
      path: 'inventory/items',
      resourceShouldRefresh: true,
      accumulate: 'true',
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
      items: PropTypes.shape({
        GET: PropTypes.func,
        reset: PropTypes.func,
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
    this.onClose = this.onClose.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
    this.closeMultipieceModal = this.closeMultipieceModal.bind(this);
    this.checkInRef = React.createRef();
    this.checkInData = null;
    this.checkinInst = null;
    this.state = {};
  }

  onSessionEnd() {
    this.clearResources();
    this.clearForm('CheckIn');
  }

  closeMultipieceModal() {
    this.setState({ showMultipieceModal: false });
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

  onClose() {
    this.setState({ itemError: false }, () => this.clearField('CheckIn', 'item.barcode'));
  }

  onSubmit(data, checkInInst) {
    this.checkinData = data;
    this.checkinInst = checkInInst;
    const { item } = data;
    this.validate(item);
    const { barcode } = item;
    const { mutator } = this.props;
    const query = `barcode==${barcode}`;
    mutator.items.reset();
    mutator.items.GET({ params: { query } }).then((itemObject) => {
      if (isEmpty(itemObject.items)) {
        this.checkIn(data, checkInInst);
      } else {
        const { items } = itemObject;
        const checkedinItem = items[0];
        const { numberOfPieces, numberOfMissingPieces, descriptionOfPieces, missingPieces } = checkedinItem;
        if ((!numberOfPieces || numberOfPieces <= 1) && !descriptionOfPieces && !numberOfMissingPieces && !missingPieces) {
          this.checkIn(data, checkInInst);
        } else {
          this.setState({ showMultipieceModal: true, checkedinItem });
        }
      }
    });
  }

  checkIn(data, checkInInst) {
    const { mutator: { checkIn }, stripes: { user } } = this.props;
    const { item } = data;
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
      .finally(() => this.setState({ showMultipieceModal: false }, () => checkInInst.focusInput()));
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
      } = {},
    ] = [],
  }) {
    const itemError = (!parameters || !parameters.length)
      ? {
        barcode: <FormattedMessage id="ui-checkin.unknownError" />,
        _error: 'unknownError',
      }
      : {
        barcode: parameters[0].value,
        _error: parameters[0].key,
      };

    this.setState({ itemError });
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

  renderErrorModal(error) {
    const message = (
      <SafeHTMLMessage
        id="ui-checkin.errorModal.noItemFound"
        values={{
          barcode: error.barcode,
        }}
      />
    );

    const footer = (
      <ModalFooter>
        <Button onClick={this.onClose}>
          <FormattedMessage id="ui-checkin.close" />
        </Button>
      </ModalFooter>
    );

    return (
      <Modal
        open
        size="small"
        label={
          <FormattedMessage
            id="ui-checkin.itemNotFound"
          />}
        footer={footer}
        dismissible
        onClose={this.onClose}
      >
        {message}
      </Modal>
    );
  }

  renderMultipieceModal() {
    const { checkedinItem, showMultipieceModal } = this.state;
    const data = this.checkinData;
    const checkInInst = this.checkinInst;
    return (
      <MultipieceModal
        open={showMultipieceModal}
        item={checkedinItem}
        onConfirm={() => this.checkIn(data, checkInInst)}
        onClose={this.closeMultipieceModal}
      />
    );
  }

  render() {
    const { resources } = this.props;
    const scannedItems = resources.scannedItems || [];
    const items = resources.items || {};
    const { nextRequest, transitItem, itemError, showMultipieceModal } = this.state;
    return (
      <div data-test-check-in-scan>
        {nextRequest && this.renderHoldModal(nextRequest)}
        {transitItem && this.renderTransitionModal(transitItem)}
        {itemError && this.renderErrorModal(itemError)}
        {showMultipieceModal && items && !isEmpty(items.records) && this.renderMultipieceModal()}
        <CheckIn
          submithandler={this.onSubmit}
          onSessionEnd={this.onSessionEnd}
          scannedItems={scannedItems}
          items={items}
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
