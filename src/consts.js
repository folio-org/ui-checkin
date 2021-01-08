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
};

const statusMessages = {
  'Missing': 'ui-checkin.statuses.missing',
  'Declared lost': 'ui-checkin.statuses.declaredLost',
  'Withdrawn': 'ui-checkin.statuses.withdrawn',
  'Lost and paid': 'ui-checkin.statuses.lostAndPaid',
  'Restricted': 'ui-checkin.statuses.restricted',
  'Aged to lost': 'ui-checkin.statuses.agedToLost',
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

export default {};
