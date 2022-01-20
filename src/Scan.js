import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment-timezone';
import SafeHTMLMessage from '@folio/react-intl-safe-html';
import { escapeCqlValue } from '@folio/stripes/util';
import {
  FormattedMessage,
  injectIntl,
} from 'react-intl';
import {
  get,
  isEmpty,
  keyBy,
  upperFirst,
  cloneDeep,
  countBy,
  chunk,
} from 'lodash';

import {
  Modal,
  ModalFooter,
  Button,
} from '@folio/stripes/components';

import CheckIn from './CheckIn';
import {
  statuses,
  cancelFeeClaimReturned,
  MAX_RECORDS,
} from './consts';
import ConfirmStatusModal from './components/ConfirmStatusModal';
import RouteForDeliveryModal from './components/RouteForDeliveryModal';
import SelectItemModal from './components/SelectItemModal';
import ModalManager from './ModalManager';

import {
  buildDateTime,
  convertToSlipData,
  getCheckinSettings,
} from './util';

class Scan extends React.Component {
  static propTypes = {
    intl: PropTypes.object,
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
      }),
      checkinSettings: PropTypes.shape({
        records: PropTypes.arrayOf(PropTypes.object),
      }),
    }),

    mutator: PropTypes.shape({
      accounts: PropTypes.shape({
        GET: PropTypes.func,
        PUT: PropTypes.func,
      }),
      feefineactions: PropTypes.shape({
        GET: PropTypes.func.isRequired,
        POST: PropTypes.func.isRequired,
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
      activeAccount: PropTypes.shape({
        update: PropTypes.func,
      }).isRequired,
      lostItemPolicy: PropTypes.shape({
        GET: PropTypes.func,
      }),
    }),
    history: PropTypes.shape({
      push: PropTypes.func,
    }),
    okapi: PropTypes.shape({
      currentUser: PropTypes.object.isRequired,
    }).isRequired,
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
      path: `staff-slips-storage/staff-slips?limit=${MAX_RECORDS}`,
      throwErrors: false,
    },
    servicePoints: {
      type: 'okapi',
      records: 'servicepoints',
      path: `service-points?limit=${MAX_RECORDS}`,
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
    checkinSettings: {
      type: 'okapi',
      records: 'configs',
      path: 'configurations/entries?query=(module=CHECKOUT and configName=other_settings)',
    },
    feefineactions: {
      type: 'okapi',
      records: 'feefineactions',
      path: 'feefineactions',
      fetch: false,
      accumulate: true,
    },
    lostItemPolicy: {
      type: 'okapi',
      path: 'lost-item-fees-policies',
      fetch: false,
      accumulate: true,
    },
    activeAccount: {},
  });

  constructor(props) {
    super(props);

    this.state = {
      loading: false,
      // itemClaimedReturnedResolution is a required checkin field for, unsurprisingly,
      // items with status 'Claimed returned'. It is set in ClaimedReturnedModal via
      // ModalManager.
      itemClaimedReturnedResolution: null,
      checkedinItems: null,
    };
  }

  store = this.props.stripes.store;
  barcode = React.createRef();
  checkInData = null;
  checkinFormRef = React.createRef();
  checkinInitialValues = {
    item: {
      checkinDate: '',
      checkinTime: '',
    },
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
    this.clearForm();

    if (!isEmpty(uniquePatrons)) {
      const endSessions = uniquePatrons.map(patronId => ({
        actionType: 'Check-in',
        patronId,
      }));

      await endSession({ endSessions });
    }
  };

  clearForm() {
    this.checkinFormRef.current.reset();
  }

  clearResources() {
    this.props.mutator.scannedItems.replace([]);
  }

  validate(item) {
    const { intl: { formatMessage } } = this.props;
    const checkin = formatMessage({ id: 'ui-checkin.fillOut' });
    if (!item || !item.barcode) {
      return { checkin };
    }

    return {};
  }

  onCloseErrorModal = () => {
    this.setState({ itemError: null },
      () => {
        this.clearField('item.barcode');
        this.setFocusInput();
      });
  }

  async fetchAllOpenRequests(items) {
    const { mutator: { requests } } = this.props;
    // Split the list of items into small chunks to create a short enough query string
    // that we can avoid a "414 Request URI Too Long" response from Okapi.
    const CHUNK_SIZE = 40;
    const chunkedItems = chunk(items, CHUNK_SIZE);
    requests.reset();

    const allRequests = chunkedItems.map(itemChunk => {
      let query = itemChunk.map(i => `itemId==${i.id}`).join(' or ');
      query = `(${query}) and (status="Open")`;
      return requests.GET({ params: { query, limit: 1000 } });
    });

    return Promise.all(allRequests).then(res => res.flat());
  }

  tryCheckIn = async (data) => {
    const { resources: { checkinSettings } } = this.props;
    const submitErrors = {};
    this.checkInData = cloneDeep(data);
    const errors = this.validate(data.item);

    if (!isEmpty(errors)) {
      return errors;
    }
    const parsed = getCheckinSettings(checkinSettings.records);
    const asterisk = parsed?.wildcardLookupEnabled ? '*' : '';
    const barcode = `"${escapeCqlValue(data.item.barcode)}${asterisk}"`;
    let checkedinItems = await this.fetchItems(barcode);
    const requests = await this.fetchAllOpenRequests(checkedinItems);
    const requestMap = countBy(requests, 'itemId');
    checkedinItems = checkedinItems.map(item => ({ ...item, requestQueue: requestMap[item.id] || 0 }));
    const checkedinItem = checkedinItems[0];

    if (checkedinItems.length > 1) {
      this.setState({ checkedinItems });
    } else if (isEmpty(checkedinItems)) {
      this.checkInData.item.barcode = barcode.replace(/(^")|("$)/g, '');
      try {
        await this.checkIn();
      } catch (error) {
        submitErrors.checkin = error;
      }
    } else {
      this.checkInData.item.barcode = checkedinItem.barcode;
      this.setState({ checkedinItem });
    }

    return submitErrors;
  }

  handleItemSelection = (_, item) => {
    this.checkInData.item.barcode = item.barcode;
    this.setState({
      checkedinItems: null,
      checkedinItem: item,
    });
  };

  handleCloseSelectItemModal = () => {
    this.setState({ checkedinItems: null });
    this.clearForm();
    this.setFocusInput();
  };

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
      intl: { timeZone },
    } = this.props;
    const { itemClaimedReturnedResolution } = this.state;

    const servicePointId = get(user, 'user.curServicePoint.id', '');

    const checkInDate = buildDateTime(checkinDate, checkinTime, timeZone, moment().tz(timeZone));
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
      .then(checkinResp => this.processClaimReturned(checkinResp))
      .then(checkinResp => this.fetchRequests(checkinResp))
      .then(checkinResp => this.addScannedItem(checkinResp))
      .then(() => this.clearField('item.barcode'))
      .catch(resp => this.processError(resp))
      .finally(() => this.processCheckInDone());
  }

  processClaimReturned(checkinResp) {
    const fetchLoan = () => {
      return checkinResp.loan;
    };

    const getAccounts = (loanId) => {
      const {
        mutator: {
          accounts: { GET },
        },
      } = this.props;

      const path = `accounts?query=loanId=="${loanId}"`;
      return GET({ path });
    };

    const getLostItemPolicy = (lostItemPolicyId) => {
      const { mutator } = this.props;
      const query = `id==${lostItemPolicyId}`;
      return mutator.lostItemPolicy.GET({ params: { query } });
    };

    const createCancelledFeeTemplate = (account) => {
      const {
        okapi: {
          currentUser: {
            id: currentUserId,
            curServicePoint: { id: servicePointId },
          },
        },
      } = this.props;

      const now = new Date().toISOString();

      return {
        dateAction: now,
        typeAction: cancelFeeClaimReturned.TYPE_ACTION,
        comments: '',
        notify: false,
        amountAction: account.amount,
        balance: 0,
        transactionInformation: '',
        source: `${this.props.okapi.currentUser.lastName}, ${this.props.okapi.currentUser.firstName}`,
        paymentMethod: '',
        accountId: account.id,
        userId: currentUserId,
        createdAt: servicePointId,
      };
    };

    const setPaymentStatus = (record) => {
      const updatedRec = cloneDeep(record);
      updatedRec.paymentStatus.name = cancelFeeClaimReturned.CANCEL_PAYMENT_STATUS;
      updatedRec.remaining = 0;
      updatedRec.status.name = 'Closed';
      return updatedRec;
    };

    const persistAccountRecord = (record) => {
      const {
        mutator: {
          activeAccount: { update },
          accounts: { PUT },
        },
      } = this.props;
      update({ id: record.id });
      return PUT(record);
    };

    const persistCancelledAction = (action) => {
      const {
        mutator: {
          feefineactions: { POST },
        },
      } = this.props;
      return POST(action);
    };

    const processAccounts = async () => {
      const loanItem = await fetchLoan();
      if (loanItem) {
        const accounts = await getAccounts(loanItem.id);
        const lostItemFeePolicies = await getLostItemPolicy(loanItem.lostItemPolicyId);
        const { returnedLostItemProcessingFee } = lostItemFeePolicies.lostItemFeePolicies[0];
        const filterAccounts = accounts.accounts.filter(
          record => record.paymentStatus.name && record.paymentStatus.name.startsWith(cancelFeeClaimReturned.PAYMENT_STATUS)
            && (record.feeFineType === cancelFeeClaimReturned.LOST_ITEM_FEE ||
              (record.feeFineType === cancelFeeClaimReturned.LOST_ITEM_PROCESSING_FEE && returnedLostItemProcessingFee))
        );

        const createActions = await Promise.all(filterAccounts
          .map(createCancelledFeeTemplate));

        const persistedCancelledActions = await Promise.all(
          createActions.map(persistCancelledAction)
        );

        await Promise.all(filterAccounts.map(setPaymentStatus).map(persistAccountRecord));
        await Promise.all(persistedCancelledActions);
      }
    };

    processAccounts();
    return checkinResp;
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
      checkinNotesMode: false,
    }, this.setFocusInput);
  }

  handleTextError(error) {
    this.setState({
      itemError: {
        message: error,
        _error: 'unknownError',
      },
    });
  }

  handleJsonError({
    errors: [
      {
        parameters,
        message,
      } = {},
    ] = [],
  }) {
    const itemError = (parameters?.length)
      ? {
        message,
        barcode: parameters[0].value,
        _error: parameters[0].key,
      }
      : {
        message,
        _error: 'unknownError',
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

  async fetchItems(barcode) {
    const { mutator } = this.props;
    const query = `barcode==${barcode}`;
    const LIMIT = 300;

    this.setState({
      checkedinItem: null,
      checkedinItems: null,
    });
    mutator.items.reset();
    const { items, totalRecords } = await mutator.items.GET({ params: { query, limit: LIMIT } });

    if (totalRecords > LIMIT) {
      // Split the list of items into small chunks to create a short enough query string
      // that we can avoid a "414 Request URI Too Long" response from Okapi.
      const restRecordsCount = totalRecords - LIMIT;
      const chunkedItems = chunk(new Array(restRecordsCount), LIMIT);

      const restItemsReq = chunkedItems.map((_, index) => {
        const offset = LIMIT * (index + 1);
        return mutator.items.GET({ params: { query, limit: LIMIT, offset } });
      });

      const restItemsResp = await Promise.all(restItemsReq);
      const restItems = restItemsResp.map(itemResp => itemResp.items).flat();

      return [...items, ...restItems];
    }

    return items;
  }

  addScannedItem(checkinResp) {
    const { loan, item, nextRequest, transitItem, holdItem, staffSlipContext, inHouseUse } = checkinResp;
    const { mutator, resources, intl: { timeZone } } = this.props;
    const { checkedinItem } = this.state;
    const scannedItem = loan || { item };

    if (!loan) {
      const {
        item: {
          checkinDate,
          checkinTime,
        },
      } = this.checkInData;

      scannedItem.returnDate = buildDateTime(checkinDate, checkinTime, timeZone, moment().tz(timeZone));
    }
    scannedItem.loanId = loan?.id || '';
    scannedItem.nextRequest = nextRequest;
    scannedItem.transitItem = transitItem;
    scannedItem.holdItem = holdItem;
    scannedItem.item.circulationNotes = (checkedinItem || {}).circulationNotes || [];
    scannedItem.staffSlipContext = staffSlipContext;
    scannedItem.inHouseUse = inHouseUse;
    const scannedItems = [scannedItem].concat(resources.scannedItems);

    return mutator.scannedItems.replace(scannedItems);
  }

  clearField = (fieldName) => {
    this.checkinFormRef.current.change(fieldName, '');
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

    const {
      item = {},
      patronComments,
    } = request;
    const slipData = convertToSlipData(staffSlipContext, intl, timezone, locale);
    const messages = [
      <SafeHTMLMessage
        id="ui-checkin.statusModal.hold.message"
        values={{
          title: item.title,
          barcode: item.barcode,
          materialType: upperFirst(get(item, 'materialType.name', '')),
          pickupServicePoint: get(request, 'pickupServicePoint.name', ''),
        }}
      />,
    ];

    if (patronComments) {
      messages.push(
        <FormattedMessage
          id="ui-checkin.statusModal.hold.comment"
          values={{
            comment: patronComments,
            strong: (chunks) => <strong>{chunks}</strong>,
          }}
        />
      );
    }

    return (
      <ConfirmStatusModal
        open={!!request}
        onConfirm={this.onModalClose}
        onCancel={this.handleOnAfterPrint}
        slipTemplate={this.getSlipTmpl('hold')}
        isPrintable={this.isPrintable('hold')}
        slipData={slipData}
        label={<FormattedMessage id="ui-checkin.statusModal.hold.heading" />}
        message={messages}
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
      },
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
    const messages = [
      <SafeHTMLMessage
        id="ui-checkin.statusModal.transit.message"
        values={{
          title: item.title,
          barcode: item.barcode,
          materialType: upperFirst(get(item, 'materialType.name', '')),
          servicePoint: destinationServicePoint,
        }}
      />,
    ];

    return (
      <ConfirmStatusModal
        open={!!loan}
        slipTemplate={this.getSlipTmpl('transit')}
        slipData={slipData}
        isPrintable={this.isPrintable('transit')}
        label={<FormattedMessage id="ui-checkin.statusModal.transit.heading" />}
        message={messages}
        onConfirm={this.onModalClose}
        onCancel={this.handleOnAfterPrint}
      />
    );
  }

  renderErrorModal({ message, barcode }) {
    const { formatMessage } = this.props.intl;
    let errorMessage;
    let label;

    if (message === `No item with barcode ${barcode} exists`) {
      errorMessage = (
        <SafeHTMLMessage
          id="ui-checkin.errorModal.noItemFound"
          values={{ barcode }}
        />
      );
      label = <FormattedMessage id="ui-checkin.itemNotFound" />;
    } else {
      errorMessage = (
        <div>
          {`${formatMessage({ id: 'ui-checkin.errorModal.unhandledError' })} ${message || null}`}
        </div>
      );
      label = <FormattedMessage id="ui-checkin.itemNotCheckedIn" />;
    }

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
        label={label}
        footer={footer}
        dismissible
        onClose={this.onCloseErrorModal}
      >
        {errorMessage}
      </Modal>
    );
  }

  onCancel = () => {
    this.clearForm();
    this.processCheckInDone();
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
      checkedinItems,
      checkinNotesMode,
      staffSlipContext,
      deliveryItem,
      loading,
    } = this.state;

    return (
      <div data-test-check-in-scan>
        {checkedinItems &&
          <SelectItemModal
            checkedinItems={checkedinItems}
            onClose={this.handleCloseSelectItemModal}
            onSelectItem={this.handleItemSelection}
          />}
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
          checkinFormRef={this.checkinFormRef}
          barcodeRef={this.barcode}
          initialValues={this.checkinInitialValues}
          showCheckinNotes={this.showCheckinNotes}
          onSubmit={this.tryCheckIn}
          onSessionEnd={this.onSessionEnd}
          {...this.props}
        />
      </div>
    );
  }
}

export default injectIntl(Scan);
