import moment from 'moment-timezone';
import {
  escape,
  includes,
} from 'lodash';

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

export function buildLocaleDateAndTime(dateTime, timezone, locale) {
  return moment(dateTime)
    .tz(timezone)
    .locale(locale)
    .format('L LT');
}

export function convertToSlipData(source = {}, intl, timeZone, locale, slipName = 'Hold') {
  const {
    item = {},
    request = {},
    requester = {},
    currentDateTime = null,
  } = source;

  const DEFAULT_DATE_OPTIONS = {
    timeZone,
    locale,
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  };

  const slipData = {
    'staffSlip.Name': slipName,
    'staffSlip.currentDateTime': buildLocaleDateAndTime(currentDateTime, timeZone, locale),
    'requester.firstName': requester.firstName,
    'requester.lastName': requester.lastName,
    'requester.middleName': requester.middleName,
    'requester.preferredFirstName': requester.preferredFirstName ? requester.preferredFirstName : requester.firstName,
    'requester.patronGroup': requester.patronGroup,
    'requester.addressLine1': requester.addressLine1,
    'requester.addressLine2': requester.addressLine2,
    'requester.country': requester.countryId
      ? intl.formatMessage({ id: `stripes-components.countries.${requester.countryId}` })
      : '',
    'requester.city': requester.city,
    'requester.stateProvRegion': requester.region,
    'requester.zipPostalCode': requester.postalCode,
    'requester.barcode': requester.barcode,
    'requester.barcodeImage': requester.barcode ? `<Barcode>${requester.barcode}</Barcode>` : '',
    'requester.departments': requester.departments,
    'item.title': item.title,
    'item.primaryContributor': item.primaryContributor,
    'item.allContributors': item.allContributors,
    'item.barcode': item.barcode,
    'item.barcodeImage': `<Barcode>${item.barcode}</Barcode>`,
    'item.callNumber': item.callNumber,
    'item.callNumberPrefix': item.callNumberPrefix,
    'item.callNumberSuffix': item.callNumberSuffix,
    'item.displaySummary': item.displaySummary,
    'item.enumeration': item.enumeration,
    'item.volume': item.volume,
    'item.chronology': item.chronology,
    'item.copy': item.copy,
    'item.yearCaption': item.yearCaption,
    'item.materialType': item.materialType,
    'item.loanType': item.loanType,
    'item.numberOfPieces': item.numberOfPieces,
    'item.descriptionOfPieces': item.descriptionOfPieces,
    'item.lastCheckedInDateTime': item.lastCheckedInDateTime
      ? intl.formatDate(item.lastCheckedInDateTime, DEFAULT_DATE_OPTIONS)
      : item.lastCheckedInDateTime,
    'item.fromServicePoint': item.fromServicePoint,
    'item.toServicePoint': item.toServicePoint,
    'item.effectiveLocationInstitution': item.effectiveLocationInstitution,
    'item.effectiveLocationCampus': item.effectiveLocationCampus,
    'item.effectiveLocationLibrary': item.effectiveLocationLibrary,
    'item.effectiveLocationSpecific': item.effectiveLocationSpecific,
    'item.effectiveLocationPrimaryServicePointName': item.effectiveLocationPrimaryServicePointName,
    'item.accessionNumber': item.accessionNumber,
    'item.administrativeNotes': item.administrativeNotes,
    'item.datesOfPublication': item.datesOfPublication,
    'item.editions': item.editions,
    'item.physicalDescriptions': item.physicalDescriptions,
    'item.instanceHrid': item.instanceHrid,
    'item.instanceHridImage': `<Barcode>${item.instanceHrid}</Barcode>`,
    'request.servicePointPickup': request.servicePointPickup,
    'request.deliveryAddressType': request.deliveryAddressType,
    'request.requestExpirationDate': request.requestExpirationDate
      ? intl.formatDate(request.requestExpirationDate, DEFAULT_DATE_OPTIONS)
      : request.requestExpirationDate,
    'request.requestDate' : request.requestDate ? intl.formatDate(request.requestDate, DEFAULT_DATE_OPTIONS) : request.requestDate,
    'request.holdShelfExpirationDate': request.holdShelfExpirationDate
      ? intl.formatDate(request.holdShelfExpirationDate, DEFAULT_DATE_OPTIONS)
      : request.holdShelfExpirationDate,
    'request.requestID': request.requestID,
    'request.patronComments': request.patronComments,
    'request.barcodeImage': request.requestID ? `<Barcode>${request.requestID}</Barcode>` : '',
  };

  return slipData;
}

export function buildDateTime(date, time, timezone, now) {
  if (date && time && timezone) {
    const formattedDate = date.substring(0, 10);
    const formattedTime = moment(time, ['HH:mm', 'HH:mm a']).format('HH:mm');
    const effectiveReturnDate = moment.tz(`${formattedDate}T${formattedTime}`, timezone);

    return effectiveReturnDate.toISOString();
  } else {
    return moment(now).toISOString();
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
