import {
  beforeEach,
  describe,
  it,
} from '@bigtest/mocha';
import { expect } from 'chai';

import setupApplication from '../helpers/setup-application';
import CheckInInteractor from '../interactors/check-in';
import { statuses } from '../../../src/consts';

import { DEFAULT_TIMEOUT } from '../constants';

describe('Claimed returned modal', () => {
  setupApplication();

  const checkIn = new CheckInInteractor({ timeout: DEFAULT_TIMEOUT });

  beforeEach(function () {
    this.server.createList('item', 5, 'withLoan');
    this.server.create('item', 'withLoan', {
      barcode: 1234567,
      title: 'I Promise I Really, Really Returned This Book!',
      status: { name: statuses.CLAIMED_RETURNED }
    });

    return this.visit('/checkin', () => {
      expect(checkIn.$root).to.exist;
    });
  });

  describe('showing claimed returned modal', () => {
    beforeEach(async function () {
      await checkIn.barcode('1234567').clickEnter();
    });

    it('shows claimed returned modal', () => {
      expect(checkIn.claimedReturnedModalPresent).to.be.true;
    });
  });

  describe('closes claimed returned modal', () => {
    beforeEach(async function () {
      await checkIn.barcode('1234567').clickEnter();
      await checkIn.claimedReturnedModal.clickCancel();
    });

    it('hides claimed returned modal', () => {
      expect(checkIn.claimedReturnedModalPresent).to.be.false;
    });
  });
});
