import {
  beforeEach,
  describe,
  it,
} from '@bigtest/mocha';
import { expect } from 'chai';
import createInactivityTimer from 'inactivity-timer';

import { getCheckinSettings } from '../../../src/util';

import setupApplication from '../helpers/setup-application';
import CheckInInteractor from '../interactors/check-in';

import { DEFAULT_TIMEOUT } from '../constants';

describe('CheckIn', () => {
  setupApplication();

  const checkIn = new CheckInInteractor({ timeout: DEFAULT_TIMEOUT });

  beforeEach(function () {
    this.server.createList('item', 5, 'withLoan');
    return this.visit('/checkin', () => {
      expect(checkIn.$root).to.exist;
    });
  });

  describe('Automated end session', () => {
    // waiting for checkoutTimeoutDuration = 0.01 min
    const wait = (ms = 650) => new Promise(resolve => { setTimeout(resolve, ms); });
    const checkinSettingsRecords = [{
      configName: 'other_settings',
      enabled: true,
      id: 'd890a259-e17a-4eff-9ac9-1558aa897401',
      module: 'CHECKOUT',
      value: `{
        "audioAlertsEnabled":false,
        "prefPatronIdentifier":"BARCODE,USER",
        "checkoutTimeout":true,
        "checkoutTimeoutDuration": 0.01
      }`
    }];
    const item = {
      barcode: '9676761472500',
      title: 'Best Book Ever',
      userId: 'test',
      materialType: {
        name: 'book'
      }
    };
    const scannedItems = [item];
    let timer = null;

    beforeEach(async function () {
      this.server.create('item', 'withLoan', item);
      const parsed = getCheckinSettings(checkinSettingsRecords);
      if (scannedItems.length) {
        timer = createInactivityTimer(`${parsed.checkoutTimeoutDuration}m`, async () => {
          await checkIn.endSession();
        });
      }
      await checkIn.barcode('9676761472500').clickEnter();
      await checkIn.whenItemsAreLoaded(1);
      await timer.signal();
    });

    it('should automatically clears the list', () => {
      expect(checkIn.hasCheckedInItems).to.be.false;
    });
  });
});
