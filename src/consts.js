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
