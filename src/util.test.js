import moment from 'moment-timezone';
import {
  escape,
  noop,
} from 'lodash';

import {
  buildDateTime,
  buildTemplate,
  buildLocaleDateAndTime,
  convertToSlipData,
  escapeValue,
  getCheckinSettings,
  shouldConfirmStatusModalBeShown,
  isDcbUser,
  isDCBItem,
} from './util';

import {
  DCB_USER,
  DCB_INSTANCE_ID,
  DCB_HOLDINGS_RECORD_ID,
  statuses,
} from './consts';

describe('escapeValue', () => {
  it('escapes values', () => {
    const input = '<monkey>value</monkey>';

    expect(escapeValue(input)).toEqual(escape(input));
  });

  it('does not escape "<Barcode>" values', () => {
    const input = '<Barcode>value</Barcode>';

    expect(escapeValue(input)).toEqual(input);
  });
});

describe('buildTemplate', () => {
  it('substitutes strings and numbers', () => {
    const t = buildTemplate('{{a}}, {{b}}! {{a}}, {{b}}! And {{c}} and {{c}}');
    const v = t({ a: 1, b: 2, c: 'through' });

    expect(v).toEqual('1, 2! 1, 2! And through and through');
  });

  it('elides other types ', () => {
    const t = buildTemplate('The {{a}}{{b}}{{c}}vorpal blade went snicker-snack!');
    const v = t({
      a: Boolean(true),
      b: { key: 'value' },
      c: () => 'function',
    });

    expect(v).toEqual('The vorpal blade went snicker-snack!');
  });
});

describe('convertToSlipData', () => {
  const intl = {
    formatMessage: (o) => o.id,
    formatDate: (d, options) => `${d} ${options.timeZone} ${options.locale}`,
  };
  const tz = 'America/New_York';
  const locale = 'en';

  const source = {
    requester: {
      'firstName': 'firstName',
      'lastName': 'lastName',
      'middleName': 'middleName',
      'preferredFirstName': 'preferredFirstName',
      'patronGroup': 'patronGroup',
      'addressLine1': 'addressLine1',
      'addressLine2': 'addressLine2',
      'countryId': 'countryId',
      'city': 'city',
      'stateProvRegion': 'region',
      'zipPostalCode': 'postalCode',
      'barcode': 'requester-barcode',
      'departments': 'departments',
    },
    item: {
      'title': 'title',
      'primaryContributor': 'primaryContributor',
      'allContributors': 'allContributors',
      'barcode': 'item-barcode',
      'callNumber': 'callNumber',
      'callNumberPrefix': 'callNumberPrefix',
      'callNumberSuffix': 'callNumberSuffix',
      'displaySummary': 'displaySummary',
      'enumeration': 'enumeration',
      'volume': 'volume',
      'chronology': 'chronology',
      'copy': 'copy',
      'yearCaption': 'yearCaption',
      'materialType': 'materialType',
      'loanType': 'loanType',
      'numberOfPieces': 'numberOfPieces',
      'descriptionOfPieces': 'descriptionOfPieces',
      'lastCheckedInDateTime': 'lastCheckedInDateTime',
      'fromServicePoint': 'fromServicePoint',
      'toServicePoint': 'toServicePoint',
      'effectiveLocationInstitution': 'effectiveLocationInstitution',
      'effectiveLocationCampus': 'effectiveLocationCampus',
      'effectiveLocationLibrary': 'effectiveLocationLibrary',
      'item.effectiveLocationSpecific': 'item.effectiveLocationSpecific',
      'effectiveLocationPrimaryServicePointName': 'effectiveLocationPrimaryServicePointName',
    },
    request: {
      'servicePointPickup': 'servicePointPickup',
      'deliveryAddressType': 'deliveryAddressType',
      'requestExpirationDate': 'requestExpirationDate',
      'requestDate': 'requestDate',
      'holdShelfExpirationDate': 'holdShelfExpirationDate',
      'requestID': 'requestID',
      'patronComments': 'patronComments',
    },
    currentDateTime: '3/18/22, 11:59 AM',
  };

  it('substitutes values', () => {
    const o = convertToSlipData(source, intl, tz, locale, 'Chicken');

    expect(o['staffSlip.Name']).toEqual('Chicken');
    expect(o['staffSlip.currentDateTime']).toEqual(buildLocaleDateAndTime(source.currentDateTime, tz, locale));
    expect(o['requester.firstName']).toEqual(source.requester.firstName);
    expect(o['requester.lastName']).toEqual(source.requester.lastName);
    expect(o['requester.middleName']).toEqual(source.requester.middleName);
    expect(o['requester.patronGroup']).toEqual(source.requester.patronGroup);
    expect(o['requester.preferredFirstName']).toEqual(source.requester.preferredFirstName);
    expect(o['requester.addressLine1']).toEqual(source.requester.addressLine1);
    expect(o['requester.addressLine2']).toEqual(source.requester.addressLine2);
    expect(o['requester.country']).toEqual(`stripes-components.countries.${source.requester.countryId}`);
    expect(o['requester.city']).toEqual(source.requester.city);
    expect(o['requester.stateProvRegion']).toEqual(source.requester.region);
    expect(o['requester.zipPostalCode']).toEqual(source.requester.postalCode);
    expect(o['requester.barcode']).toEqual(source.requester.barcode);
    expect(o['requester.barcodeImage']).toEqual(`<Barcode>${source.requester.barcode}</Barcode>`);
    expect(o['requester.departments']).toEqual(source.requester.departments);

    expect(o['item.title']).toEqual(source.item.title);
    expect(o['item.primaryContributor']).toEqual(source.item.primaryContributor);
    expect(o['item.allContributors']).toEqual(source.item.allContributors);
    expect(o['item.barcode']).toEqual(source.item.barcode);
    expect(o['item.barcodeImage']).toEqual(`<Barcode>${source.item.barcode}</Barcode>`);
    expect(o['item.callNumber']).toEqual(source.item.callNumber);
    expect(o['item.callNumberPrefix']).toEqual(source.item.callNumberPrefix);
    expect(o['item.callNumberSuffix']).toEqual(source.item.callNumberSuffix);
    expect(o['item.displaySummary']).toEqual(source.item.displaySummary);
    expect(o['item.enumeration']).toEqual(source.item.enumeration);
    expect(o['item.volume']).toEqual(source.item.volume);
    expect(o['item.chronology']).toEqual(source.item.chronology);
    expect(o['item.copy']).toEqual(source.item.copy);
    expect(o['item.yearCaption']).toEqual(source.item.yearCaption);
    expect(o['item.materialType']).toEqual(source.item.materialType);
    expect(o['item.loanType']).toEqual(source.item.loanType);
    expect(o['item.numberOfPieces']).toEqual(source.item.numberOfPieces);
    expect(o['item.descriptionOfPieces']).toEqual(source.item.descriptionOfPieces);
    expect(o['item.lastCheckedInDateTime']).toEqual(`lastCheckedInDateTime ${tz} ${locale}`);
    expect(o['item.fromServicePoint']).toEqual(source.item.fromServicePoint);
    expect(o['item.toServicePoint']).toEqual(source.item.toServicePoint);
    expect(o['item.effectiveLocationInstitution']).toEqual(source.item.effectiveLocationInstitution);
    expect(o['item.effectiveLocationCampus']).toEqual(source.item.effectiveLocationCampus);
    expect(o['item.effectiveLocationLibrary']).toEqual(source.item.effectiveLocationLibrary);
    expect(o['item.effectiveLocationSpecific']).toEqual(source.item.effectiveLocationSpecific);

    expect(o['request.servicePointPickup']).toEqual(source.request.servicePointPickup);
    expect(o['request.deliveryAddressType']).toEqual(source.request.deliveryAddressType);
    expect(o['request.requestExpirationDate']).toEqual(`requestExpirationDate ${tz} ${locale}`);
    expect(o['request.holdShelfExpirationDate']).toEqual(`holdShelfExpirationDate ${tz} ${locale}`);
    expect(o['request.requestID']).toEqual(source.request.requestID);
    expect(o['request.patronComments']).toEqual(source.request.patronComments);
  });

  it('handles missing elements', () => {
    const emptySource = {};
    const o = convertToSlipData(emptySource, intl, tz, locale);

    expect(o['staffSlip.Name']).toEqual('Hold');
    expect(o['requester.country']).toEqual('');
    expect(o['request.requestExpirationDate']).toBeUndefined();
    expect(o['request.holdShelfExpirationDate']).toBeUndefined();
  });

  it('handles missing elements', () => {
    const emptySource = {};
    const o = convertToSlipData(emptySource, intl, tz, locale, 'Chicken');

    expect(o['requester.country']).toEqual('');
    expect(o['request.requestExpirationDate']).toBeUndefined();
    expect(o['request.holdShelfExpirationDate']).toBeUndefined();
  });

  it('handles empty requester barcode', () => {
    const sourceWithoutRequesterBarcode = {
      ...source,
      requester: {
        ...source.requester,
        barcode: noop(),
      },
    };
    const o = convertToSlipData(sourceWithoutRequesterBarcode, intl, tz, locale, 'Chicken');

    expect(o['requester.barcodeImage']).toEqual('');
  });

  it('should handle preferred first name when preferred first name is null', () => {
    const sourceWithoutRequesterPrefferedFirstname = {
      ...source,
      requester: {
        ...source.requester,
        preferredFirstName: null,
      },
    };
    const o = convertToSlipData(sourceWithoutRequesterPrefferedFirstname, intl, tz, locale, 'Chicken');

    expect(o['requester.preferredFirstName']).toEqual('firstName');
  });
});

describe('buildDateTime', () => {
  it('without separate date/time input, returns the "now" value', () => {
    const ts = '2021-02-14T18:14:16.000Z';
    const v = buildDateTime('', '', 'UTC', ts);

    expect(v).toEqual(ts);
  });

  it('given an effective-return-date, returns an ISO-8601 string', () => {
    const d = '2021-02-14';
    const t = '12:14:00';
    const z = 'America/New_York';
    const now = moment(d).tz(z);
    const v = buildDateTime(d, t, z, now);

    expect(v).toMatch('2021-02-14T17:14:00.000Z');
  });

  it('given an effective return date before DST, returns an ISO-8601 string', () => {
    const d = '2021-03-13';
    const t = '12:14:00';
    const z = 'America/New_York';
    const now = moment('2021-03-14T12:14:00').tz(z);
    const v = buildDateTime(d, t, z, now);

    expect(v).toMatch('2021-03-13T18:14:00.000Z');
  });

  it('given an effective return date after DST, returns an ISO-8601 string', () => {
    const d = '2021-11-06';
    const t = '12:14:00';
    const z = 'America/New_York';
    const now = moment('2021-11-07T12:14:00').tz(z);
    const v = buildDateTime(d, t, z, now);

    expect(v).toMatch('2021-11-06T15:14:00.000Z');
  });
});

describe('getCheckinSettings', () => {
  it('returns undefined given an empty array', () => {
    const v = getCheckinSettings([]);

    expect(v).toBeUndefined();
  });

  it('returns {} given non-JSON data', () => {
    const v = getCheckinSettings([{ value: 'not json data' }]);

    expect(v).toMatchObject({});
  });

  it('receives an object given JSON data in av[0].value', () => {
    const v = getCheckinSettings([{ value: '{ "key": "value" }' }]);

    expect(v).toMatchObject({ key: 'value' });
  });
});

describe('shouldConfirmStatusModalBeShown', () => {
  it('returns false given nullish input.status.name', () => {
    const v = shouldConfirmStatusModalBeShown({ status: { } });

    expect(v).toBeFalsy();
  });

  it('returns false given nullish input.status', () => {
    const v = shouldConfirmStatusModalBeShown({ key: 'value' });

    expect(v).toBeFalsy();
  });

  it('returns false given nullish input', () => {
    const v = shouldConfirmStatusModalBeShown(null);

    expect(v).toBeFalsy();
  });

  it('returns false given non-confirm status', () => {
    const v = shouldConfirmStatusModalBeShown({ status: { name: 'chicken' } });

    expect(v).toBeFalsy();
  });

  it('returns true given confirm status', () => {
    const list = [
      statuses.AGED_TO_LOST,
      statuses.DECLARED_LOST,
      statuses.IN_PROCESS_NON_REQUESTABLE,
      statuses.LONG_MISSING,
      statuses.LOST_AND_PAID,
      statuses.MISSING,
      statuses.RESTRICTED,
      statuses.UNAVAILABLE,
      statuses.UNKNOWN,
      statuses.WITHDRAWN,
    ];

    list.forEach(i => {
      const v = shouldConfirmStatusModalBeShown({ status: { name: i } });

      expect(v).toBeTruthy();
    });
  });
});

describe('isDcbUser', () => {
  it('should return true when user has lastName as "DcbSystem"', () => {
    const user = DCB_USER;

    expect(isDcbUser(user)).toBeTruthy();
  });

  it('should return false when user does not have lastName as "DcbSystem"', () => {
    const user = {
      lastName: 'test',
    };

    expect(isDcbUser(user)).toBeFalsy();
  });
});

describe('isDCBItem ', () => {
  it('should return true when both item instance id and item holdings record id are DCB_INSTANCE_ID and DCB_HOLDINGS_RECORD_ID respectively', () => {
    const item = {
      instanceId: DCB_INSTANCE_ID,
      holdingsRecordId: DCB_HOLDINGS_RECORD_ID,
    };
    expect(isDCBItem(item)).toBeTruthy();
  });

  it('should return false when item instance id is DCB_INSTANCE_ID and item holdings record id is not DCB_HOLDINGS_RECORD_ID', () => {
    const item = {
      instanceId: DCB_INSTANCE_ID,
      holdingsRecordId: 'test',
    };
    expect(isDCBItem(item)).toBeFalsy();
  });

  it('should return false when item instance id is not DCB_INSTANCE_ID and item holdings record id is DCB_HOLDINGS_RECORD_ID', () => {
    const item = {
      instanceId: 'test',
      holdingsRecordId: DCB_HOLDINGS_RECORD_ID,
    };
    expect(isDCBItem(item)).toBeFalsy();
  });

  it('should return false when item instance id is not DCB_INSTANCE_ID and item holdings record id is not DCB_HOLDINGS_RECORD_ID', () => {
    const item = {
      instanceId: 'test',
      holdingsRecordId: 'test',
    };
    expect(isDCBItem(item)).toBeFalsy();
  });
});
