import { get, minBy, upperFirst, isEmpty, keyBy } from 'lodash';
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
  ConfirmationModal
} from '@folio/stripes/components';
import MultipieceModal from './components/MultipieceModal';
import CheckIn from './CheckIn';
import { statuses } from './consts';
import ConfirmStatusModal from './components/ConfirmStatusModal';
import CheckinNoteModal from './components/CheckinNoteModal';

import {
  convertRequestToHold,
  convertLoanToTransition,
} from './util';

class Scan extends React.Component {
  static manifest = Object.freeze({
    scannedItems: { initialValue: [] },
    query: { initialValue: {} },
    patronGroups: {
      type: 'okapi',
      path: 'groups',
      records: 'usergroups',
    },
    users: {
      type: 'okapi',
      path: 'users',
      records: 'users',
      accumulate: 'true',
    },
    items: {
      type: 'okapi',
      path: 'inventory/items',
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
      path: 'staff-slips-storage/staff-slips?limit=100',
      throwErrors: false,
    },
    servicePoints: {
      type: 'okapi',
      records: 'servicepoints',
      path: 'service-points?limit=100',
    },
    checkIn: {
      type: 'okapi',
      path: 'circulation/check-in-by-barcode',
      fetch: false,
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
      requests: PropTypes.shape({
        records: PropTypes.arrayOf(PropTypes.object),
      }),
      staffSlips: PropTypes.shape({
        records: PropTypes.arrayOf(PropTypes.object),
      }),
      servicePoints: PropTypes.shape({
        records: PropTypes.arrayOf(PropTypes.object),
      }),
    }),

    mutator: PropTypes.shape({
      query: PropTypes.shape({
        update: PropTypes.func,
      }),
      items: PropTypes.shape({
        GET: PropTypes.func,
        PUT: PropTypes.func,
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
    this.hideMissingDialog = this.hideMissingDialog.bind(this);
    this.confirmMissing = this.confirmMissing.bind(this);
    this.confirmCheckinNoteModal = this.confirmCheckinNoteModal.bind(this);
    this.hideCheckinNoteModal = this.hideCheckinNoteModal.bind(this);
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
        const { numberOfPieces,
          numberOfMissingPieces,
          descriptionOfPieces,
          missingPieces,
          status: { name } } = checkedinItem;

        const isCheckInNote = element => element.noteType === 'Check in';
        const showCheckinNoteModal = get(checkedinItem, ['circulationNotes'], []).some(isCheckInNote);
        let showMissingModal = false;

        if (name === 'Missing') showMissingModal = true;
        if ((!numberOfPieces || numberOfPieces <= 1) && !descriptionOfPieces && !numberOfMissingPieces && !missingPieces) {
          if (showMissingModal || showCheckinNoteModal) {
            this.setState({ showMissingModal, checkedinItem, showCheckinNoteModal });
          } else {
            this.checkIn(data, checkInInst);
          }
        } else {
          this.setState({ showMultipieceModal: true, showMissingModal, checkedinItem, showCheckinNoteModal });
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
      .then(checkinResp => this.fetchRequest(checkinResp))
      .then(checkinResp => this.addScannedItem(checkinResp))
      .then(() => this.clearField('CheckIn', 'item.barcode'))
      .catch(resp => this.processError(resp))
      .finally(() => this.setState({ showMultipieceModal: false }, () => checkInInst.focusInput()));
  }

  processResponse(checkinResp) {
    const { loan, item } = checkinResp;
    const checkinRespItem = loan || { item };
    if (get(checkinRespItem, 'item.status.name') === statuses.IN_TRANSIT) {
      checkinResp.transitItem = checkinRespItem;
      this.setState({ transitItem: checkinRespItem });
    } else if (get(checkinRespItem, 'item.status.name') === statuses.AWAITING_PICKUP) {
      checkinResp.holdItem = checkinRespItem;
      this.setState({ holdItem: checkinRespItem });
    }
    return checkinResp;
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
    const { item } = checkinResp;
    const query = `(itemId==${item.id} and status=="Open - Awaiting pickup")`;
    const { mutator } = this.props;
    mutator.requests.reset();
    return mutator.requests.GET({ params: { query } }).then((requests) => {
      if (requests.length) {
        const nextRequest = minBy(requests, 'position');
        nextRequest.item = item;
        checkinResp.nextRequest = nextRequest;
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

  addScannedItem(checkinResp) {
    const { loan, item, nextRequest, transitItem, holdItem } = checkinResp;
    const { mutator, resources } = this.props;
    const scannedItem = loan || { item };
    scannedItem.nextRequest = nextRequest;
    scannedItem.transitItem = transitItem;
    scannedItem.holdItem = holdItem;
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
      transitItem: null,
      holdItem: null
    });
  }

  getSlipTmpl(type) {
    const { resources } = this.props;
    const staffSlips = (resources.staffSlips || {}).records || [];
    const staffSlip = staffSlips.find(slip => slip.name.toLowerCase() === type);
    return get(staffSlip, ['template'], '');
  }

  isPrintable(type) {
    const { stripes: { user }, resources } = this.props;
    const staffSlips = (resources.staffSlips || {}).records || [];
    const servicePoints = (resources.servicePoints || {}).records || [];
    const servicePointId = get(user, ['user', 'curServicePoint', 'id'], '');
    const spMap = keyBy(servicePoints, 'id');
    const slipMap = keyBy(staffSlips, slip => slip.name.toLowerCase());
    const servicePoint = spMap[servicePointId];
    const staffSlip = slipMap[type];

    if (!servicePoint || !staffSlip) return false;

    const spSlip = servicePoint.staffSlips.find(slip => slip.id === staffSlip.id);

    return (!spSlip || spSlip.printByDefault);
  }

  renderHoldModal(request) {
    const { intl } = this.props;
    const { item = {} } = request;
    const slipData = convertRequestToHold(request, intl);
    const message = (
      <SafeHTMLMessage
        id="ui-checkin.statusModal.hold.message"
        values={{
          title: item.title,
          barcode: item.barcode,
          materialType: upperFirst(get(item, ['materialType', 'name'], '')),
          pickupServicePoint: get(request, ['pickupServicePoint', 'name'], '')
        }}
      />
    );

    return (
      <ConfirmStatusModal
        open={!!request}
        onConfirm={this.onConfirm}
        slipTemplate={this.getSlipTmpl('hold')}
        isPrintable={this.isPrintable('hold')}
        slipData={slipData}
        label={<FormattedMessage id="ui-checkin.statusModal.hold.heading" />}
        message={message}
      />
    );
  }

  renderTransitionModal(loan) {
    const { intl } = this.props;
    const { item = {} } = loan;
    const slipData = convertLoanToTransition(loan, intl);
    const destinationServicePoint = get(item, 'inTransitDestinationServicePoint.name', '');
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
        isPrintable={this.isPrintable('transit')}
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

  hideMissingDialog() {
    this.setState({ showMissingModal: false });
  }

  confirmMissing() {
    const data = this.checkinData;
    const checkInInst = this.checkinInst;
    this.setState({ showMissingModal: false }, () => this.checkIn(data, checkInInst));
  }

  confirmCheckinNoteModal() {
    const data = this.checkinData;
    const checkInInst = this.checkinInst;
    this.setState({ showCheckinNoteModal: false }, () => this.checkIn(data, checkInInst));
  }

  hideCheckinNoteModal() {
    this.setState({ showCheckinNoteModal: false });
  }

  renderMissingModal() {
    const { checkedinItem, showMissingModal } = this.state;
    const { intl: { formatMessage } } = this.props;
    const { title, barcode, discoverySuppress } = checkedinItem;
    const discoverySuppressMessage = discoverySuppress ? formatMessage({ id:'ui-checkin.missingModal.discoverySuppress' }) : '';

    const message = (
      <SafeHTMLMessage
        id="ui-checkin.missingModal.message"
        values={{
          title,
          barcode,
          discoverySuppressMessage,
          materialType: upperFirst(get(checkedinItem, ['materialType', 'name'], '')),
        }}
      />
    );

    return (
      <ConfirmationModal
        data-test-missing-item-modal
        open={showMissingModal}
        heading={<FormattedMessage id="ui-checkin.missingModal.heading" />}
        onConfirm={this.confirmMissing}
        onCancel={this.hideMissingDialog}
        cancelLabel={<FormattedMessage id="ui-checkin.multipieceModal.cancel" />}
        confirmLabel={<FormattedMessage id="ui-checkin.multipieceModal.confirm" />}
        message={message}
      />
    );
  }

  renderCheckinNoteModal() {
    const { checkedinItem, showCheckinNoteModal } = this.state;
    const { title, barcode } = checkedinItem;

    const checkinNotesArray = get(checkedinItem, ['circulationNotes'], [])
      .filter(noteObject => noteObject.noteType === 'Check in');


    const notes = checkinNotesArray.map(checkinNoteObject => {
      const { note } = checkinNoteObject;
      return { note };
    });
    const formatter = { note: item => `${item.note}` };
    const columnMapping = { note: <FormattedMessage id="ui-checkin.note" /> };
    const visibleColumns = ['note'];
    const columnWidths = { note : '100%' };

    const message = (
      <SafeHTMLMessage
        id="ui-checkin.checkinNoteModal.message"
        values={{
          title,
          barcode,
          materialType: upperFirst(get(checkedinItem, ['materialType', 'name'], '')),
          count: notes.length
        }}
      />
    );

    return (
      <CheckinNoteModal
        data-test-checkinNote-modal
        open={showCheckinNoteModal}
        heading={<FormattedMessage id="ui-checkin.checkinNoteModal.heading" />}
        onConfirm={this.confirmCheckinNoteModal}
        onCancel={this.hideCheckinNoteModal}
        cancelLabel={<FormattedMessage id="ui-checkin.multipieceModal.cancel" />}
        confirmLabel={<FormattedMessage id="ui-checkin.multipieceModal.confirm" />}
        notes={notes}
        formatter={formatter}
        message={message}
        columnMapping={columnMapping}
        visibleColumns={visibleColumns}
        columnWidths={columnWidths}
      />
    );
  }

  render() {
    const { resources } = this.props;
    const scannedItems = resources.scannedItems || [];
    const items = resources.items || {};
    const { nextRequest, transitItem, itemError, showMultipieceModal, holdItem, showMissingModal, showCheckinNoteModal } = this.state;
    return (
      <div data-test-check-in-scan>
        {showMissingModal && this.renderMissingModal()}
        {showCheckinNoteModal && this.renderCheckinNoteModal()}
        {nextRequest && holdItem && this.renderHoldModal(nextRequest)}
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
