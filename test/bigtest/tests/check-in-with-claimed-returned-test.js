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
    this.server.create('lost-item-fee-policy', {
      id: 1,
      name: cancelFeeClaimReturned.LOST_ITEM_FEE_POLICY,
      returnedLostItemProcessingFee: true,
    });

    this.server.create('item', 'withLoanClaimReturned', {
      barcode: '1234567',
      title: 'I Promise I Really, Really Returned This Book!',
      status: { name: statuses.CLAIMED_RETURNED }
    });

    this.server.create('account', {
      id: 1,
      status: {
        name: 'Open',
      },
      paymentStatus: {
        name: cancelFeeClaimReturned.PAYMENT_STATUS,
      },
      amount: 200,
      remaining: 20,
      feeFineType: cancelFeeClaimReturned.LOST_ITEM_FEE,
      loanId: 1,
    });

    this.server.get('/accounts');

    return this.visit('/checkin', () => {
      expect(checkIn.$root).to.exist;
    });
  });

  it('has a barcode field', () => {
    expect(checkIn.barcodePresent).to.be.true;
  });

  describe('entering a barcode', () => {
    beforeEach(async function () {
      await checkIn.barcode('1234567').clickEnter();
    });

    it('shows claimed returned modal', () => {
      expect(checkIn.claimedReturnedModalPresent).to.be.true;
    });

    describe('Found by library', () => {
      let acc;
      beforeEach(async function () {
        const wait = (ms = 10000) => new Promise(resolve => { setTimeout(resolve, ms); });

        this.server.put('/accounts/:id', (_, request) => {
          acc = JSON.parse(request.requestBody);
          return acc;
        });

        await checkIn.claimedReturnedModal.clickFound.click();
        await wait();
      });

      it('Hide claimed returned modal', () => {
        expect(checkIn.claimedReturnedModalPresent).to.be.false;
      });

      it('should hide item list empty message during check in', () => {
        expect(checkIn.checkedInItemsList.displaysEmptyMessage).to.be.false;
      });

      it('Payment status Cancelled item returned', () => {
        expect(acc.paymentStatus.name).to.equal(cancelFeeClaimReturned.CANCEL_PAYMENT_STATUS);
      });

      it('should set remaining to 0', () => {
        expect(acc.remaining).to.equal(0);
      });

      it('should set closed fee/fine account', () => {
        expect(acc.status.name).to.equal('Closed');
      });
    });
  });
});
