const statuses = {
  IN_TRANSIT: 'In transit',
  AWAITING_PICKUP: 'Awaiting pickup',
  MISSING: 'Missing',
  CHECK_IN: 'Check in',
  CLAIMED_RETURNED: 'Claimed returned',
  AWAITING_DELIVERY: 'Awaiting delivery',
  DECLARED_LOST: 'Declared lost',
  WITHDRAWN: 'Withdrawn',
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
};

export default {};
