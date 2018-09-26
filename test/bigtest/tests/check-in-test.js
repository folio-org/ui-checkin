import { beforeEach, describe, it } from '@bigtest/mocha';
import { expect } from 'chai';

import setupApplication from '../helpers/setup-application';
import CheckInInteractor from '../interactors/check-in';

describe('CheckIn', () => {
  setupApplication();

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

  describe('submitting the check-in without a barcode', () => {
    beforeEach(async function () {
      this.server.create('item', 'withLoan', {
        barcode: 9676761472500,
        title: 'Best Book Ever',
        materialType: {
          name: 'book'
        }
      });

      await checkIn.clickChangeDate();
      await checkIn.processDate.fillAndBlur('04/25/2018');
      await checkIn.processTime.fillInput('4:25 PM').clickEnter();
    });

    it('throws the fillOut error', () => {
      expect(checkIn.fillOutError).to.equal('Please fill this out to continue');
    });
  });

  describe('changing check-in date and time', () => {
    let body;
    beforeEach(async function () {
      this.server.put('/circulation/loans/:id', (_, request) => {
        body = JSON.parse(request.requestBody);
        return body;
      });

      this.server.create('item', 'withLoan', {
        barcode: 9676761472500,
        title: 'Best Book Ever',
        materialType: {
          name: 'book'
        }
      });

      await checkIn.clickChangeTime();
      await checkIn.processDate.fillAndBlur('04/25/2018');
      await checkIn.processTime.fillInput('4:25 PM');
      await checkIn.barcode('9676761472500').clickEnter();
    });

    it('changes the date and time in the payload', () => {
      expect(body.systemReturnDate).to.include('2018-04-25');
      expect(body.systemReturnDate).to.include('16:25:00');
    });
  });

  describe('navigating to loan details', () => {
    beforeEach(async function () {
      this.server.create('item', 'withLoan', {
        barcode: 9676761472500,
        title: 'Best Book Ever',
        materialType: {
          name: 'book'
        }
      });

      await checkIn.barcode('9676761472500').clickEnter();
      await checkIn.selectElipse();
      await checkIn.selectLoanDetails();
    });

    it('directs to loan details page', function () {
      const { search, pathname } = this.location;
      expect(pathname + search).to.include('/users/view/6?layer=loan&loan=6');
    });
  });

  describe('navigating to patron details', () => {
    beforeEach(async function () {
      this.server.create('item', 'withLoan', {
        barcode: 9676761472500,
        title: 'Best Book Ever',
        materialType: {
          name: 'book'
        }
      });

      await checkIn.barcode('9676761472500').clickEnter();
      await checkIn.selectElipse();
      await checkIn.selectPatronDetails();
    });

    it('directs to patron details page', function () {
      const { search, pathname } = this.location;
      expect(pathname + search).to.include('/users/view/6');
    });
  });

  describe('navigating to item details', () => {
    beforeEach(async function () {
      this.server.create('item', 'withLoan', {
        barcode: 9676761472500,
        title: 'Best Book Ever',
        materialType: {
          name: 'book'
        },
        instanceId : 'lychee',
        holdingsRecordId : 'apple'
      });

      await checkIn.barcode('9676761472500').clickEnter();
      await checkIn.selectElipse();
      await checkIn.selectItemDetails();
    });

    it('directs to item details page', function () {
      const { search, pathname } = this.location;
      expect(pathname + search).to.include('/inventory/view/lychee/apple/6');
    });
  });
});
