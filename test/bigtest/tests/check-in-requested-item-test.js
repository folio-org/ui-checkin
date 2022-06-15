import { expect } from 'chai';
import {
  beforeEach,
  describe,
  it,
} from '@bigtest/mocha';

import setupApplication from '../helpers/setup-application';
import CheckInInteractor from '../interactors/check-in';

import { DEFAULT_TIMEOUT } from '../constants';

describe('CheckIn requested item', () => {
  setupApplication({
    scenarios: ['default', 'check-in-by-barcode-with-request']
  });

  const checkIn = new CheckInInteractor({ timeout: DEFAULT_TIMEOUT });

  beforeEach(async function () {
    return this.visit('/checkin', () => {
      expect(checkIn.$root).to.exist;
    });
  });

  describe('navigate to request details page', () => {
    beforeEach(async function () {
      await checkIn.barcode('barcode').clickEnter();
      await checkIn.blurBarcodeField();
      await checkIn.selectEllipse();
      await checkIn.selectRequestDetails();
    });

    it('should directs to request details page', function () {
      const { search, pathname } = this.location;
      expect(pathname + search).to.include('/requests/view/requestID');
    });
  });
});
