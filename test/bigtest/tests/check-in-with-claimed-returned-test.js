import {
  beforeEach,
  describe,
  it,
} from '@bigtest/mocha';
import { expect } from 'chai';

import setupApplication from '../helpers/setup-application';
import CheckInInteractor from '../interactors/check-in';

import { statuses, cancelFeeClaimReturned } from '../../../src/consts';

describe.only('CheckIn with claimed returned', () => {
  setupApplication();

  const checkIn = new CheckInInteractor();
  let item;

  beforeEach(function () {
    item = this.server.create('item', 'withLoanClaimReturned', {
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
    beforeEach(async function () {
      await checkIn.barcode('1234567').clickEnter();
    });

    it('shows claimed returned modal', () => {
      expect(checkIn.claimedReturnedModalPresent).to.be.true;
    });

    describe('Found by library', () => {
      let body;
      beforeEach(async function () {

        this.server.create('account', {
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


        this.server.create('lost-item-fee-policy', {
          name: cancelFeeClaimReturned.LOST_ITEM_FEE_POLICY,
          returnedLostItemProcessingFee: true,
        })

        this.server.get('/lost-item-fee-policy');

        this.server.get('/accounts');

        /*
        this.server.post('/accounts',  (_, request) => {
          parsedRequestBody = JSON.parse(request.requestBody);
          return new Response(204, {});
        });
        */
        /*
                this.server.put('/accounts/:id', ({ accounts }, { params, requestBody }) => {
                  acc = JSON.parse(requestBody);
                  return accounts.find(params.id).update(acc);
                });
        */
        /*
                this.server.put('/accounts/:id', (_, request) => {
                  body = JSON.parse(request.requestBody);
                  body.paymentStatus.name = 'Cancelled item returned';
                  return body;
                });
                */
        await checkIn.claimedReturnedModal.clickFound.click();
      });

      it('Hide claimed returned modal', () => {
        expect(checkIn.claimedReturnedModalPresent).to.be.false;
      });


      it('shows claim confirm modal', () => {
        expect(checkIn.confirmStatusModalPresent).to.be.true;
      });

      describe('click confirm button', () => {
        beforeEach(async function () {
          // await checkIn.confirmStatusModal.clickConfirmButton.click();
          await checkIn.confirmStatusModal.clickConfirmButton();
        });

        it('hide claimed confirm modal', () => {
          expect(checkIn.confirmStatusModalPresent).to.be.false;
        });
      });


      /*
            describe('Fee/fines with Cancelled item returned', () => {
              beforeEach(async function () {
                let acc;
                this.server.post('/accounts', function (schema, { requestBody }) {
                  acc = JSON.parse(requestBody);
                  return server.create('account', acc);
                });
      
                console.log('acc: ' + JSON.stringify(acc));
              });
      
              it('Visit fee/fines', () => {
                expect(false).to.be.false;
              });
            });
      */

    });
  });
});
