import moment from 'moment-timezone';
import { get } from 'lodash';

export function buildTemplate(str) {
  return o => {
    return str.replace(/{{([^{}]*)}}/g, (a, b) => {
      const r = o[b];
      return typeof r === 'string' || typeof r === 'number' ? r : '';
    });
  };
}

export function convertToSlipData(source = {}, intl, timeZone, locale, slipName = 'Hold') {
  const {
    item = {},
    request = {},
    requester = {},
  } = source;

  const slipData = {
    'staffSlip.Name': slipName,
    'requester.firstName': requester.firstName,
    'requester.lastName': requester.lastName,
    'requester.middleName': requester.middleName,
    'requester.addressLine1': requester.addressLine1,
    'requester.addressLine2': requester.addressLine2,
    'requester.country': intl.formatMessage({ id: `stripes-components.countries.${requester.countryId}` }),
    'requester.city': requester.city,
    'requester.stateProvRegion': requester.region,
    'requester.zipPostalCode': requester.postalCode,
    'requester.barcode': requester.barcode,
    'requester.barcodeImage': `<Barcode>${requester.barcode}</Barcode>`,
    'item.title': item.title,
    'item.primaryContributor': item.primaryContributor,
    'item.allContributors': item.allContributors,
    'item.barcode': item.barcode,
    'item.barcodeImage': `<Barcode>${item.barcode}</Barcode>`,
    'item.callNumber': item.callNumber,
    'item.callNumberPrefix': item.callNumberPrefix,
    'item.callNumberSuffix': item.callNumberSuffix,
    'item.enumeration': item.enumeration,
    'item.volume': item.volume,
    'item.chronology': item.chronology,
    'item.copy': item.copy,
    'item.yearCaption': item.yearCaption,
    'item.materialType': item.materialType,
    'item.loanType': item.loanType,
    'item.numberOfPieces': item.numberOfPieces,
    'item.descriptionOfPieces': item.descriptionOfPieces,
    'item.lastCheckedInDateTime': item.lastCheckedInDateTime,
    'item.fromServicePoint': item.fromServicePoint,
    'item.toServicePoint': item.toServicePoint,
    'item.effectiveLocationInstitution': item.effectiveLocationInstitution,
    'item.effectiveLocationCampus': item.effectiveLocationCampus,
    'item.effectiveLocationLibrary': item.effectiveLocationLibrary,
    'item.effectiveLocationSpecific': item.effectiveLocationSpecific,
    'request.servicePointPickup': request.servicePointPickup,
    'request.deliveryAddressType': request.deliveryAddressType,
    'request.requestExpirationDate': request.requestExpirationDate
      ? intl.formatDate(request.requestExpirationDate, { timeZone, locale })
      : request.requestExpirationDate,
    'request.holdShelfExpirationDate': request.holdShelfExpirationDate
      ? intl.formatDate(request.holdShelfExpirationDate, { timeZone, locale })
      : request.holdShelfExpirationDate,
    'request.requestID': request.requestID,
  };

  return slipData;
}

export function buildDateTime(date, time) {
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

export function getFullName(user = {}) {
  const firstName = get(user, 'personal.firstName', '');
  const lastName = get(user, 'personal.lastName', '');

  return [firstName, lastName].filter(e => e).join(', ');
}

export default {};
