import React from 'react';
import PropTypes from 'prop-types';
import SafeHTMLMessage from '@folio/react-intl-safe-html';
import {
  FormattedMessage,
  injectIntl,
  intlShape,
} from 'react-intl';
import {
  change,
  reset,
  SubmissionError,
} from 'redux-form';
import {
  get,
  isEmpty,
  keyBy,
  upperFirst,
  uniqBy,
} from 'lodash';

import {
  Modal,
  ModalFooter,
  Button,
} from '@folio/stripes/components';

import CheckIn from './CheckIn';
import { statuses } from './consts';
import ConfirmStatusModal from './components/ConfirmStatusModal';
import RouteForDeliveryModal from './components/RouteForDeliveryModal';
import ModalManager from './ModalManager';

import {
  buildDateTime,
  convertToSlipData,
} from './util';

class Scan extends React.Component {
  static propTypes = {
    intl: intlShape,
    stripes: PropTypes.object,
    resources: PropTypes.shape({
      accounts: PropTypes.shape({
        records: PropTypes.arrayOf(PropTypes.object),
      }),
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
      items: PropTypes.shape({
        records: PropTypes.arrayOf(PropTypes.object),
      })
    }),

    mutator: PropTypes.shape({
      accounts: PropTypes.shape({
        GET: PropTypes.func,
      }),
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
      endSession: PropTypes.shape({
        POST: PropTypes.func,
      }),
    }),
    history: PropTypes.shape({
      push: PropTypes.func,
    })
  };

  static manifest = Object.freeze({
    scannedItems: { initialValue: [] },
    query: { initialValue: {} },
    accounts: {
      type: 'okapi',
      accumulate: 'true',
      path: 'accounts',
      fetch: false,
    },
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
    endSession: {
      type: 'okapi',
      path: 'circulation/end-patron-action-session',
      fetch: false,
    },
  });

  constructor(props) {
    super(props);

    this.state = {
      loading: false,
      // itemClaimedReturnedResolution is a required checkin field for, unsurprisingly,
      // items with status 'Claimed returned'. It is set via 
      itemClaimedReturnedResolution: null,
    };
  }

  store = this.props.stripes.store;
  barcode = React.createRef();
  checkInData = null;
  checkinInst = null;
  checkinInitialValues = {
    item: {
      checkinDate: '',
      checkinTime: '',
    }
  };

  setFocusInput = () => {
    this.barcode.current.focus();
  };

  handleOnAfterPrint = () => {
    this.setFocusInput();
  };

  onSessionEnd = async () => {
    const {
      resources: { scannedItems },
      mutator: { endSession: { POST: endSession } },
    } = this.props;

    const uniquePatrons = scannedItems.reduce((patrons, item) => {
      const userId = get(item, 'userId');

      if (userId && !patrons.includes(userId)) {
        patrons.push(userId);
      }

      return patrons;
    }, []);

    this.clearResources();
    this.clearForm('CheckIn');

    if (!isEmpty(uniquePatrons)) {
      const endSessions = uniquePatrons.map(patronId => ({
        actionType: 'Check-in',
        patronId,
      }));

      await endSession({ endSessions });
    }
  };

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

  onCloseErrorModal = () => {
    this.setState({ itemError: false },
      () => {
        this.clearField('CheckIn', 'item.barcode');
        this.setFocusInput();
      });
  }

  tryCheckIn = async (data, checkInInst) => {
    this.checkInData = data;
    this.checkInInst = checkInInst;
    this.validate(data.item);
    const { item: { barcode } } = data;
    const checkedinItem = await this.fetchItem(barcode);

    if (!checkedinItem) {
      this.checkIn();
    } else {
      this.setState({ checkedinItem });
    }
  }

  checkIn = () => {
    if (this.state.loading) return undefined;

    const data = this.checkInData;
    const {
      item: {
        barcode,
        checkinDate,
        checkinTime,
      },
    } = data;
    const {
      mutator: { checkIn },
      stripes: { user },
    } = this.props;
    const { itemClaimedReturnedResolution } = this.state;

    const servicePointId = get(user, 'user.curServicePoint.id', '');
    const checkInDate = buildDateTime(checkinDate, checkinTime);
    const requestData = {
      servicePointId,
      checkInDate,
      itemBarcode: barcode.trim(),
    };

    // For items that have the status 'Claimed returned', the claimedReturnedResolution
    // parameter is required for checkin. For any other status, we don't want it.
    if (itemClaimedReturnedResolution) {
      requestData.claimedReturnedResolution = itemClaimedReturnedResolution;
    }

    this.setState({ loading: true });

    return checkIn.POST(requestData)
      .then(checkinResp => this.processResponse(checkinResp))
      .then(checkinResp => this.fetchRequests(checkinResp))
      .then(checkinResp => this.addScannedItem(checkinResp))
      .then(() => this.clearField('CheckIn', 'item.barcode'))
      .catch(resp => this.processError(resp))
      .finally(() => this.processCheckInDone());
  }

  processResponse(checkinResp) {
    const { loan, item, staffSlipContext } = checkinResp;
    const checkinRespItem = loan || { item };
    this.setState({ staffSlipContext, itemClaimedReturnedResolution: null });
    if (get(checkinRespItem, 'item.status.name') === statuses.IN_TRANSIT) {
      checkinResp.transitItem = checkinRespItem;
      this.setState({ transitItem: checkinRespItem });
    } else if (get(checkinRespItem, 'item.status.name') === statuses.AWAITING_PICKUP) {
      checkinResp.holdItem = checkinRespItem;
      this.setState({ holdItem: checkinRespItem });
    } else if (get(checkinRespItem, 'item.status.name') === statuses.AWAITING_DELIVERY) {
      checkinResp.deliveryItem = checkinRespItem;
      this.setState({ deliveryItem: checkinRespItem });
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

  processCheckInDone() {
    this.setState({
      checkedinItem: null,
      loading: false,
    }, this.setFocusInput);
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

  fetchRequests(checkinResp) {
    const { item } = checkinResp;
    const query = `(itemId==${item.id} and (status=="Open - Awaiting pickup" or status=="Open - Awaiting delivery"))`;
    const { mutator } = this.props;
    mutator.requests.reset();
    return mutator.requests.GET({ params: { query } }).then((requests) => {
      if (requests.length) {
        const nextRequest = requests[0];
        nextRequest.item = item;
        checkinResp.nextRequest = nextRequest;
        this.setState({ nextRequest });
      }
      return checkinResp;
    });
  }

  async fetchItem(barcode) {
    const { mutator } = this.props;
    const query = `barcode==${barcode}`;
    this.setState({ checkedinItem: null });
    mutator.items.reset();
    const itemsResp = await mutator.items.GET({ params: { query } });

    return get(itemsResp, 'items[0]');
  }

  addScannedItem(checkinResp) {
    const { loan, item, nextRequest, transitItem, holdItem, staffSlipContext, inHouseUse } = checkinResp;
    const { mutator, resources } = this.props;
    const { checkedinItem } = this.state;
    const scannedItem = loan || { item };

    if (!loan) {
      const {
        item: {
          checkinDate,
          checkinTime,
        },
      } = this.checkInData;

      scannedItem.returnDate = buildDateTime(checkinDate, checkinTime);
    }

    scannedItem.nextRequest = nextRequest;
    scannedItem.transitItem = transitItem;
    scannedItem.holdItem = holdItem;
    scannedItem.item.circulationNotes = (checkedinItem || {}).circulationNotes || [];
    scannedItem.staffSlipContext = staffSlipContext;
    scannedItem.inHouseUse = inHouseUse;
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

  onModalClose = () => {
    this.setState({
      nextRequest: null,
      transitItem: null,
      holdItem: null,
      deliveryItem: null,
    }, this.setFocusInput);
  };

  getSlipTmpl(type) {
    const { resources } = this.props;
    const staffSlips = (resources.staffSlips || {}).records || [];
    const staffSlip = staffSlips.find(slip => slip.name.toLowerCase() === type);

    return get(staffSlip, 'template', '');
  }

  isPrintable(type) {
    const { stripes: { user }, resources } = this.props;
    const staffSlips = (resources.staffSlips || {}).records || [];
    const servicePoints = (resources.servicePoints || {}).records || [];
    const servicePointId = get(user, 'user.curServicePoint.id', '');
    const spMap = keyBy(servicePoints, 'id');
    const slipMap = keyBy(staffSlips, slip => slip.name.toLowerCase());
    const servicePoint = spMap[servicePointId];
    const staffSlip = slipMap[type];

    if (!servicePoint || !staffSlip) return false;

    const spSlip = servicePoint.staffSlips.find(slip => slip.id === staffSlip.id);

    return (!spSlip || spSlip.printByDefault);
  }

  // Used by ModalManager and ClaimedReturnedModal to assign a claimedReturnedResolution
  // value for items with the 'claimed returned' status, required for checkin.
  claimedReturnedHandler = (resolution) => {
    this.setState({ itemClaimedReturnedResolution: resolution });
  }

  renderHoldModal(request, staffSlipContext) {
    const {
      intl,
      stripes: {
        timezone,
        locale,
      },
    } = this.props;

    const { item = {} } = request;
    const slipData = convertToSlipData(staffSlipContext, intl, timezone, locale);
    const message = (
      <SafeHTMLMessage
        id="ui-checkin.statusModal.hold.message"
        values={{
          title: item.title,
          barcode: item.barcode,
          materialType: upperFirst(get(item, 'materialType.name', '')),
          pickupServicePoint: get(request, 'pickupServicePoint.name', '')
        }}
      />
    );

    return (
      <ConfirmStatusModal
        open={!!request}
        onConfirm={this.onModalClose}
        onCancel={this.handleOnAfterPrint}
        slipTemplate={this.getSlipTmpl('hold')}
        isPrintable={this.isPrintable('hold')}
        slipData={slipData}
        label={<FormattedMessage id="ui-checkin.statusModal.hold.heading" />}
        message={message}
      />
    );
  }

  renderDeliveryModal(deliveryItem, staffSlipContext) {
    const {
      intl,
      stripes: {
        timezone,
        locale,
      },
    } = this.props;

    const slipData = convertToSlipData(staffSlipContext, intl, timezone, locale);
    const message = (
      <SafeHTMLMessage
        id="ui-checkin.statusModal.delivery.message"
        values={{
          itemTitle: deliveryItem.item.title,
          itemBarcode: deliveryItem.item.barcode,
          itemType: deliveryItem.item.materialType.name,
        }}
      />
    );

    return (
      <RouteForDeliveryModal
        open
        slipTemplate={this.getSlipTmpl('request delivery')}
        isPrintableByDefault={this.isPrintable('request delivery')}
        slipData={slipData}
        label={<FormattedMessage id="ui-checkin.statusModal.delivery.heading" />}
        modalContent={message}
        onClose={this.onModalClose}
        onCloseAndCheckout={this.redirectToCheckout}
      />
    );
  }

  redirectToCheckout = () => {
    const {
      deliveryItem,
      nextRequest,
    } = this.state;

    this.props.history.push({
      pathname: '/checkout',
      state: {
        itemBarcode: deliveryItem.item.barcode,
        patronBarcode: nextRequest.requester.barcode,
      }
    });
  }

  renderTransitionModal(loan, staffSlipContext) {
    const {
      intl,
      stripes: {
        timezone,
        locale,
      },
    } = this.props;

    const { item = {} } = loan;
    const slipData = convertToSlipData(staffSlipContext, intl, timezone, locale, 'Transit');

    const destinationServicePoint = get(item, 'inTransitDestinationServicePoint.name', '');
    const message = (
      <SafeHTMLMessage
        id="ui-checkin.statusModal.transit.message"
        values={{
          title: item.title,
          barcode: item.barcode,
          materialType: upperFirst(get(item, 'materialType.name', '')),
          servicePoint: destinationServicePoint
        }}
      />
    );

    return (
      <ConfirmStatusModal
        open={!!loan}
        slipTemplate={this.getSlipTmpl('transit')}
        slipData={slipData}
        isPrintable={this.isPrintable('transit')}
        label={<FormattedMessage id="ui-checkin.statusModal.transit.heading" />}
        message={message}
        onConfirm={this.onModalClose}
        onCancel={this.handleOnAfterPrint}
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
        <Button
          data-test-close-error-modal-button
          onClick={this.onCloseErrorModal}
        >
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
          />
}
        footer={footer}
        dismissible
        onClose={this.onCloseErrorModal}
      >
        {message}
      </Modal>
    );
  }

  onCancel = () => {
    this.clearForm('CheckIn');
  };

  showCheckinNotes = (loan) => {
    const { item } = loan;
    this.setState({
      checkinNotesMode: true,
      checkedinItem: item,
    });
  };

  render() {
    const { resources } = this.props;
    const scannedItems = resources.scannedItems || [];
    const items = resources.items || {};
    const {
      nextRequest,
      transitItem,
      itemError,
      holdItem,
      checkedinItem,
      checkinNotesMode,
      staffSlipContext,
      deliveryItem,
      loading,
    } = this.state;

    return (
      <div data-test-check-in-scan>
        { /* manages pre checkin modals */}
        {checkedinItem &&
          <ModalManager
            checkedinItem={checkedinItem}
            checkinNotesMode={checkinNotesMode}
            claimedReturnedHandler={this.claimedReturnedHandler}
            onDone={this.checkIn}
            onCancel={this.onCancel}
          />}
        {nextRequest && holdItem && this.renderHoldModal(nextRequest, staffSlipContext)}
        {nextRequest && deliveryItem && this.renderDeliveryModal(deliveryItem, staffSlipContext)}
        {transitItem && this.renderTransitionModal(transitItem, staffSlipContext)}
        {itemError && this.renderErrorModal(itemError)}

        <CheckIn
          loading={loading}
          scannedItems={scannedItems}
          items={items}
          barcodeRef={this.barcode}
          initialValues={this.checkinInitialValues}
          showCheckinNotes={this.showCheckinNotes}
          submithandler={this.tryCheckIn}
          onSessionEnd={this.onSessionEnd}
          {...this.props}
        />
      </div>
    );
  }
}

export default injectIntl(Scan);
