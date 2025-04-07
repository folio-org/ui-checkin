import PropTypes from 'prop-types';

export const SLIP_DATA_PROP_TYPES = PropTypes.shape({
  currentDateTime: PropTypes.string,
  staffSlip: PropTypes.shape({
    Name: PropTypes.string,
    currentDateTime: PropTypes.string,
    staffUsername: PropTypes.string,
  }),
  item: PropTypes.shape({
    title: PropTypes.string,
    primaryContributor: PropTypes.string,
    allContributors: PropTypes.string,
    barcode: PropTypes.string,
    barcodeImage: PropTypes.string,
    callNumber: PropTypes.string,
    callNumberPrefix: PropTypes.string,
    callNumberSuffix: PropTypes.string,
    displaySummary: PropTypes.string,
    enumeration: PropTypes.string,
    volume: PropTypes.string,
    chronology: PropTypes.string,
    copy: PropTypes.string,
    yearCaption: PropTypes.string,
    materialType: PropTypes.string,
    loanType: PropTypes.string,
    numberOfPieces: PropTypes.string,
    descriptionOfPieces: PropTypes.string,
    lastCheckedInDateTime: PropTypes.string,
    fromServicePoint: PropTypes.string,
    toServicePoint: PropTypes.string,
    effectiveLocationInstitution: PropTypes.string,
    effectiveLocationCampus: PropTypes.string,
    effectiveLocationLibrary: PropTypes.string,
    effectiveLocationSpecific: PropTypes.string,
    effectiveLocationPrimaryServicePointName: PropTypes.string,
    accessionNumber: PropTypes.string,
    administrativeNotes: PropTypes.string,
    datesOfPublication: PropTypes.string,
    editions: PropTypes.string,
    physicalDescriptions: PropTypes.string,
    instanceHrid: PropTypes.string,
    instanceHridImage: PropTypes.string,
  }),
  requester: PropTypes.shape({
    firstName: PropTypes.string,
    lastName: PropTypes.string,
    middleName: PropTypes.string,
    preferredFirstName: PropTypes.string,
    patronGroup: PropTypes.string,
    addressLine1: PropTypes.string,
    addressLine2: PropTypes.string,
    country: PropTypes.string,
    city: PropTypes.string,
    stateProvRegion: PropTypes.string,
    zipPostalCode: PropTypes.string,
    barcode: PropTypes.string,
    barcodeImage: PropTypes.string,
    departments: PropTypes.string,
  }),
  request: PropTypes.shape({
    servicePointPickup: PropTypes.string,
    deliveryAddressType: PropTypes.string,
    requestExpirationDate: PropTypes.string,
    requestDate: PropTypes.string,
    holdShelfExpirationDate: PropTypes.string,
    requestID: PropTypes.string,
    patronComments: PropTypes.string,
    barcodeImage: PropTypes.string,
  }),
});

export const SLIPS_DATA_PROP_TYPES = PropTypes.arrayOf(SLIP_DATA_PROP_TYPES);

const statuses = {
  IN_TRANSIT: 'In transit',
  AWAITING_PICKUP: 'Awaiting pickup',
  MISSING: 'Missing',
  CHECK_IN: 'Check in',
  CLAIMED_RETURNED: 'Claimed returned',
  AWAITING_DELIVERY: 'Awaiting delivery',
  DECLARED_LOST: 'Declared lost',
  WITHDRAWN: 'Withdrawn',
  LOST_AND_PAID: 'Lost and paid',
  AGED_TO_LOST: 'Aged to lost',
  RESTRICTED: 'Restricted',
  IN_PROCESS_NON_REQUESTABLE: 'In process (non-requestable)',
  LONG_MISSING: 'Long missing',
  UNAVAILABLE: 'Unavailable',
  UNKNOWN: 'Unknown',
};

const statusMessages = {
  'Missing': 'ui-checkin.statuses.missing',
  'Declared lost': 'ui-checkin.statuses.declaredLost',
  'Withdrawn': 'ui-checkin.statuses.withdrawn',
  'Lost and paid': 'ui-checkin.statuses.lostAndPaid',
  'Restricted': 'ui-checkin.statuses.restricted',
  'Aged to lost': 'ui-checkin.statuses.agedToLost',
  'In process (non-requestable)': 'ui-checkin.statuses.inProcessNonRequestable',
  'Long missing': 'ui-checkin.statuses.longMissing',
  'Unavailable': 'ui-checkin.statuses.unavailable',
  'Unknown': 'ui-checkin.statuses.unknown',
};

const requestTypes = {
  HOLD_SHELF: 'Hold Shelf',
  DELIVERY: 'Delivery',
};

const claimedReturnedResolutions = {
  FOUND: 'Found by library',
  RETURNED: 'Returned by patron',
};

export {
  claimedReturnedResolutions,
  statuses,
  requestTypes,
  statusMessages,
};

export const cancelFeeClaimReturned = {
  CANCEL_PAYMENT_STATUS: 'Cancelled item returned',
  PAYMENT_STATUS: 'Suspended claim returned',
  LOST_ITEM_FEE: 'Lost item fee',
  LOST_ITEM_FEE_ACTUAL_COST: 'Lost item fee (actual cost)',
  LOST_ITEM_PROCESSING_FEE: 'Lost item processing fee',
  TYPE_ACTION: 'Cancelled item returned',
};

export const PAGE_AMOUNT = 100;
export const MAX_RECORDS = '1000';

export const DCB_USER_LASTNAME = 'DcbSystem';

export const DCB_USER = {
  lastName: DCB_USER_LASTNAME,
};

export const DCB_INSTANCE_ID = '9d1b77e4-f02e-4b7f-b296-3f2042ddac54';
export const DCB_HOLDINGS_RECORD_ID = '10cd3a5a-d36f-4c7a-bc4f-e1ae3cf820c9';

export const REQUEST_STATUSES = {
  AWAITING_DELIVERY: 'Open - Awaiting delivery',
  AWAITING_PICKUP: 'Open - Awaiting pickup',
};

export const ACCOUNT_STATUS_NAMES = {
  CLOSED: 'Closed',
};

export const STAFF_SLIP_TYPES = {
  TRANSIT: 'Transit',
  REQUEST_DELIVERY: 'Request delivery',
};
