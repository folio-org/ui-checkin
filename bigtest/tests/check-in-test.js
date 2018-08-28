import { beforeEach, describe, it } from '@bigtest/mocha';
import { expect } from 'chai';

import { describeApplication } from '../helpers/describe-application';
import CheckInInteractor from '../interactors/check-in';

describeApplication('CheckIn', () => {
  const checkIn = new CheckInInteractor();

  beforeEach(function () {
    this.server.createList('item', 5, 'withLoan');
    return this.visit('/checkin', () => {
      expect(checkIn.$root).to.exist;
    });
  });

  it('has a barcode field', () => {
    expect(checkIn.barcodePresent).to.be.true;
  });

  describe('entering an invalid barcode', () => {
    beforeEach(() => {
      return checkIn.barcode('0000000').clickEnter();
    });

    it('shows an error', () => {
      expect(checkIn.barcodeError).to.equal('Item with this barcode does not exist');
    });
  });

  describe('entering a barcode', () => {
    beforeEach(function () {
      this.server.create('item', 'withLoan', {
        barcode: 9676761472500,
        title: 'Best Book Ever',
        materialType: {
          name: 'book'
        }
      });

      return checkIn.barcode('9676761472500').clickEnter();
    });

    it('displays the checked-in item', () => {
      expect(checkIn.checkedInBookTitle).to.equal('Best Book Ever (book)');
    });

    describe('ending the session', () => {
      beforeEach(() => {
        return checkIn.endSession();
      });

      it('clears the list', () => {
        expect(checkIn.hasCheckedInItems).to.be.false;
      });
    });
  });
});