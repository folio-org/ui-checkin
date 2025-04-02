import {
  escape,
  includes,
} from 'lodash';

import {
  dayjs,
} from '@folio/stripes/components';

import {
  DCB_USER,
  statuses,
  DCB_INSTANCE_ID,
  DCB_HOLDINGS_RECORD_ID,
} from './consts';

export const escapeValue = (val) => {
  if (typeof val === 'string' && val.startsWith('<Barcode>') && val.endsWith('</Barcode>')) {
    return val;
  }

  return escape(val);
};

export function buildTemplate(str) {
  return o => {
    return str.replace(/{{([^{}]*)}}/g, (a, b) => {
      const r = o[b];
      return typeof r === 'string' || typeof r === 'number' ? escapeValue(r) : '';
    });
  };
}

export function buildDateTime(date, time, timezone, now) {
  if (date && time && timezone) {
    const formattedDate = date.substring(0, 10);
    const formattedTime = dayjs(`${date} ${time}`).format('HH:mm');
    const effectiveReturnDate = dayjs.tz(`${formattedDate}T${formattedTime}`, timezone);

    return effectiveReturnDate.toISOString();
  } else {
    return dayjs(now).toISOString();
  }
}

export function getCheckinSettings(checkinSettings) {
  if (!checkinSettings.length) {
    return undefined;
  }

  try {
    return JSON.parse(checkinSettings[0].value);
  } catch (e) {
    return {};
  }
}

export function shouldConfirmStatusModalBeShown(item) {
  return includes([
    statuses.WITHDRAWN,
    statuses.DECLARED_LOST,
    statuses.MISSING,
    statuses.LOST_AND_PAID,
    statuses.AGED_TO_LOST,
    statuses.RESTRICTED,
    statuses.IN_PROCESS_NON_REQUESTABLE,
    statuses.LONG_MISSING,
    statuses.UNAVAILABLE,
    statuses.UNKNOWN,
  ], item?.status?.name);
}

export const isDcbUser = (user) => user?.lastName === DCB_USER.lastName;

export const isDCBItem = (item) => item.instanceId === DCB_INSTANCE_ID && item.holdingsRecordId === DCB_HOLDINGS_RECORD_ID;

export default {};
