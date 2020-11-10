import {
  beforeEach,
  describe,
  it,
} from '@bigtest/mocha';
import { expect } from 'chai';

import setupApplication from '../helpers/setup-application';
import CheckInInteractor from '../interactors/check-in';

import { statuses, cancelFeeClaimReturned } from '../../../src/consts';

describe('CheckIn with claimed returned', () => {
  setupApplication();

  const checkIn = new CheckInInteractor();

  beforeEach(function () {
    this.server.create('item', {
      barcode: 1234567,
      title: 'I Promise I Really, Really Returned This Book!',
      status: { name: statuses.CLAIMED_RETURNED }
    });

    return this.visit('/checkin', () => {
      expect(checkIn.$root).to.exist;
    });
  });

  it('has a barcode field', () => {
    expect(checkIn.barcodePresent).to.be.true;
  });

  describe('entering a barcode', () => {
    let item;
    beforeEach(async function () {
      item = this.server.create('item', {
        barcode: 1234567,
        title: 'I Promise I Really, Really Returned This Book!',
        status: { name: statuses.CLAIMED_RETURNED }
      });

      await checkIn.barcode('1234567').clickEnter();
    });

    it('shows claimed returned modal', () => {
      expect(checkIn.claimedReturnedModalPresent).to.be.true;
    });

    describe('Found by library', () => {
      beforeEach(async function () {
        const user = this.server.create('user');

        const loan = this.server.create('loan', {
          userId: user.id,
          status: { name: 'Open' },
          loanPolicyId: 'test',
          action: 'claimedReturned',
          actionComment: 'Claim returned confirmation',
          itemId: item.id,
          claimedReturnedDate: new Date().toISOString(),
        });

        this.server.create('account', {
          userId: loan.userId,
          status: {
            name: 'Open',
          },
          paymentStatus: {
            name: cancelFeeClaimReturned.PAYMENT_STATUS,
          },
          amount: 200,
          remaining: 20,
          feeFineType: cancelFeeClaimReturned.LOST_ITEM_FEE,
          loanId: loan.id,
        });

        this.server.get('/accounts');

        await checkIn.claimedReturnedModal.clickFound.click();
      });

      it('Hide claimed returned modal', () => {
        expect(checkIn.claimedReturnedModalPresent).to.be.false;
      });
    });
  });
});
