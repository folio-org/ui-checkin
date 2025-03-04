import moment from 'moment-timezone';
import {
  escape,
} from 'lodash';

import {
  buildDateTime,
  buildTemplate,
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

  it('given an effective return date in non-DST, currenty in DST, returns an ISO-8601 string', () => {
    const d = '2021-03-13';
    const t = '12:14:00';
    const z = 'America/New_York';

    const now = moment('2021-03-14T12:14:00').tz(z);
    const v = buildDateTime(d, t, z, now);

    // America/New_York is offset -4 hrs in DST, -5 hours in non-DST.
    // expect to match the non-DST offset of 5 hours in UTC time...
    const expected = moment.tz(`${d}T${t}`, 'UTC').add(5, 'hours').toISOString();
    expect(v).toMatch(expected);
  });

  it('given an effective return date in DST, currently non-DST, returns an ISO-8601 string', () => {
    const d = '2021-11-06';
    const t = '12:14:00';
    const z = 'America/New_York';
    const now = moment('2021-11-07T12:14:00').tz(z);
    const v = buildDateTime(d, t, z, now);

    // America/New_York is offset -4 hrs in DST, -5 hours in non-DST.
    // expect to match the DST offset of 4 hours in UTC time...
    const expected = moment.tz(`${d}T${t}`, 'UTC').add(4, 'hours').toISOString();
    expect(v).toMatch(expected);
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
