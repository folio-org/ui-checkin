import { beforeEach, describe, it } from '@bigtest/mocha';
import { expect } from 'chai';
import { Response } from '@bigtest/mirage';

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
    beforeEach(function () {
      this.server.post('/circulation/check-in-by-barcode', (_, request) => {
        const params = JSON.parse(request.requestBody);
        return new Response(422, { 'Content-Type': 'application/json' }, {
          errors: [{
            message: `No item with barcode ${params.itemBarcode} exists`,
            parameters: [{
              key: 'itemBarcode',
              value: params.itemBarcode
            }]
          }]
        });
      });

      return checkIn.barcode('000000000').clickEnter();
    });

    it('shows an error', () => {
      expect(checkIn.barcodeError).to.equal('The barcode 000000000 could not be found.');
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

  describe('changing check-in date and time', () => {
    let body;
    beforeEach(async function () {
      this.server.post('/circulation/check-in-by-barcode', (_, request) => {
        body = JSON.parse(request.requestBody);
        body.item = {};
        return body;
      });

      this.server.create('item', 'withLoan', {
        barcode: '9676761472500',
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
      expect(body.checkInDate).to.include('2018-04-25');
      expect(body.checkInDate).to.include('16:25:00');
    });
  });

  describe('showing confirm status modal', () => {
    beforeEach(async function () {
      this.server.create('item', 'withLoan', {
        barcode: 9676761472500,
        title: 'Best Book Ever',
        materialType: {
          name: 'book'
        },
        status: {
          name: 'In transit',
        },
        instanceId : 'lychee',
        holdingsRecordId : 'apple'
      });

      await checkIn.barcode('9676761472500').clickEnter();
    });

    it('shows confirm status modal', () => {
      expect(checkIn.confirmStatusModalPresent).to.be.true;
    });
  });

  describe('showing confirm status modal with print checkbox checked by default', () => {
    beforeEach(async function () {
      this.server.create('item', 'withLoan', {
        barcode: 9676761472500,
        status: {
          name: 'In transit',
        }
      });
      this.server.create('servicePoint', { id: 1 });

      await checkIn.barcode('9676761472500').clickEnter();
    });

    it('shows print checkbox checked by default', () => {
      expect(checkIn.confirmStatusModalPresent).to.be.true;
      expect(checkIn.confirmModal.isPrintTransitChecked).to.be.true;
    });
  });

  describe('showing confirm status modal with print checkbox unchecked by default', () => {
    beforeEach(async function () {
      this.server.create('item', 'withLoan', {
        barcode: 9676761472500,
        status: {
          name: 'In transit',
        }
      });
      this.server.create('servicePoint', { id: 2 });

      await checkIn.barcode('9676761472500').clickEnter();
    });

    it('shows print checkbox checked by default', () => {
      expect(checkIn.confirmStatusModalPresent).to.be.true;
      expect(checkIn.confirmModal.isPrintTransitChecked).to.be.false;
    });
  });

  describe('showing print transit slip option', () => {
    beforeEach(async function () {
      this.server.create('item', 'withLoan', {
        barcode: 9676761472500,
        title: 'Best Book Ever',
        materialType: {
          name: 'book'
        },
        status: {
          name: 'In transit',
        },
        instanceId : 'lychee',
        holdingsRecordId : 'apple'
      });

      await checkIn.barcode('9676761472500').clickEnter();
      await checkIn.confirmModal.clickConfirmButton();
      await checkIn.selectElipse();
    });

    it('shows transit slip option on the action menu', () => {
      expect(checkIn.printTransitSlipItemPresent).to.be.true;
    });
  });

  // describe('showing print hold slip option', () => {
  //   beforeEach(async function () {
  //     this.server.create('item', 'withLoan', {
  //       barcode: 9676761472500,
  //       title: 'Best Book Ever',
  //       materialType: {
  //         name: 'book'
  //       },
  //       instanceId : 'lychee',
  //       holdingsRecordId : 'apple'
  //     });
  //     this.server.create('request', 'withItem');
  //
  //     await checkIn.barcode('9676761472500').clickEnter();
  //     await checkIn.confirmModal.clickConfirmButton();
  //     await checkIn.selectElipse();
  //   });
  //
  //   it('shows hold slip option on the action menu', () => {
  //     expect(checkIn.printHoldSlipItemPresent).to.be.true;
  //   });
  // });

  describe('showing multipiece item modal', () => {
    beforeEach(async function () {
      this.server.create('item', 'withLoan', {
        barcode: 9676761472501,
        title: 'Best Book Ever',
        materialType: {
          name: 'book'
        },
        numberOfPieces: 2,
        instanceId : 'lychee',
        holdingsRecordId : 'apple'
      });

      await checkIn.barcode('9676761472501').clickEnter();
    });

    it('shows multipiece item modal', () => {
      expect(checkIn.multiPieceModal.present).to.be.true;
    });
  });

  describe('closes multipiece item modal', () => {
    beforeEach(async function () {
      this.server.create('item', 'withLoan', {
        barcode: 9676761472501,
        title: 'Best Book Ever',
        materialType: {
          name: 'book'
        },
        numberOfPieces: 2,
        instanceId : 'lychee',
        holdingsRecordId : 'apple'
      });

      await checkIn.barcode('9676761472501').clickEnter();
      await checkIn.multiPieceModal.clickCheckinBtn();
    });

    it('hides multipiece item modal', () => {
      expect(checkIn.multiPieceModal.present).to.be.false;
    });
  });
});
