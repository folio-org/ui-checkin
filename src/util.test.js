import {
  escape,
} from 'lodash';

import {
  dayjs,
} from '@folio/stripes/components';

import {
  buildDateTime,
  buildTemplate,
  escapeValue,
  getCheckinSettings,
  shouldConfirmStatusModalBeShown,
  isDCBItem,
  focusModalPrimaryButton,
} from './util';

import {
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
  describe('When date, time and timezone are provided', () => {
    const date = '2021-10-05';
    const time = '12:14:00';
    const timezone = 'America/New_York';
    const timeFormat = 'HH:mm';
    const formattedTime = '12:14';
    const isoString = 'Wed Oct 05 2021 12:14:00 GMT-0400';
    const format = jest.fn(() => formattedTime);
    const toISOString = jest.fn(() => isoString);
    const tz = jest.fn(() => ({
      toISOString,
    }));

    beforeEach(() => {
      dayjs.mockImplementation(() => ({
        format,
      }));
      dayjs.tz = tz;
    });

    it('should generate time in "HH:mm" format', () => {
      buildDateTime(date, time, timezone);

      expect(format).toHaveBeenCalledWith(timeFormat);
    });

    it('should get timezone information with correct arguments', () => {
      buildDateTime(date, time, timezone);

      expect(tz).toHaveBeenCalledWith(`${date}T${formattedTime}`, timezone);
    });

    it('should return data format in ISO string', () => {
      const result = buildDateTime(date, time, timezone);

      expect(result).toBe(isoString);
    });
  });

  describe('When date, time or timezone are not provided', () => {
    const isoString = 'Wed Oct 05 2021 12:14:00 GMT-0400';
    const now = '2021-10-05T12:14:00';
    const toISOString = jest.fn(() => isoString);

    beforeEach(() => {
      dayjs.mockImplementation(() => ({
        toISOString,
      }));
    });

    it('should return data format in ISO string', () => {
      const result = buildDateTime(null, null, null, now);

      expect(result).toBe(isoString);
    });
  });
});

describe('getCheckinSettings', () => {
  it('should returns undefined for empty array', () => {
    expect(getCheckinSettings([])).toBeUndefined();
  });

  it('should returns value of first element (object)', () => {
    const obj = {
      key: 'value',
    };

    expect(getCheckinSettings([{ value: obj }])).toBe(obj);
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

describe('focusModalPrimaryButton', () => {
  it('should do nothing when ref is null', () => {
    // Should not throw even when the ref object itself is null/undefined
    expect(() => focusModalPrimaryButton(null)).not.toThrow();
    expect(() => focusModalPrimaryButton(undefined)).not.toThrow();
  });

  it('should do nothing when ref.current is null', () => {
    const ref = { current: null };

    expect(() => focusModalPrimaryButton(ref)).not.toThrow();
  });

  it('should call focus() directly when ref.current is not a DIV (e.g. a Button element)', () => {
    // Simulates a ref attached directly to a focusable <button> element.
    // focusModalPrimaryButton should call focus() on it without walking the DOM.
    const focus = jest.fn();
    const ref = { current: { tagName: 'BUTTON', focus } };

    focusModalPrimaryButton(ref);

    expect(focus).toHaveBeenCalledTimes(1);
  });

  it('should call focus() directly when ref.current is a non-DIV element (e.g. SPAN)', () => {
    const focus = jest.fn();
    const ref = { current: { tagName: 'SPAN', focus } };

    focusModalPrimaryButton(ref);

    expect(focus).toHaveBeenCalledTimes(1);
  });

  it('should find and focus the first <button> inside a DIV wrapper (e.g. PrintButton)', () => {
    // Simulates a ref attached to a <div> wrapper around a composite component
    // like <PrintButton> that does not forward its own ref.
    // focusModalPrimaryButton should walk the DOM via querySelector to find the button.
    const focus = jest.fn();
    const btn = { focus };
    const ref = {
      current: {
        tagName: 'DIV',
        querySelector: jest.fn().mockReturnValue(btn),
      },
    };

    focusModalPrimaryButton(ref);

    expect(ref.current.querySelector).toHaveBeenCalledWith('button');
    expect(focus).toHaveBeenCalledTimes(1);
  });

  it('should not throw when DIV wrapper contains no <button> child', () => {
    // Edge case: the wrapper div exists but contains no focusable button yet
    // (e.g. during an intermediate render). Should silently do nothing.
    const ref = {
      current: {
        tagName: 'DIV',
        querySelector: jest.fn().mockReturnValue(null),
      },
    };

    expect(() => focusModalPrimaryButton(ref)).not.toThrow();
    expect(ref.current.querySelector).toHaveBeenCalledWith('button');
  });
});
