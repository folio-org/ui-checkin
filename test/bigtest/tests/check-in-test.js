import {
  beforeEach,
  describe,
  it,
} from '@bigtest/mocha';
import { expect } from 'chai';
import { Response } from 'miragejs';
import faker from 'faker';

import setupApplication from '../helpers/setup-application';
import CheckInInteractor from '../interactors/check-in';

const statuses = [
  'Missing',
  'Declared lost',
  'Withdrawn',
  'Lost and paid',
];

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
    beforeEach(async function () {
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

      await checkIn.barcode('000000000').clickEnter();
    });

    it('shows an error', () => {
      expect(checkIn.errorModal).to.be.true;
      expect(checkIn.barcodeError).to.equal('The barcode 000000000 could not be found.');
    });

    describe('click cancel button on error modal', () => {
      beforeEach(async function () {
        await checkIn.clickCancelErrorModalBtn();
      });

      it('should focus and clear barcode input', () => {
        expect(checkIn.barcodeInputValue).to.equal('');
        // expect(checkIn.barcodeInputIsFocused).to.be.true;
      });
    });
  });

  describe('entering a barcode', () => {
    beforeEach(async function () {
      this.server.create('item', 'withLoan', {
        barcode: 9676761472500,
        title: 'Best Book Ever',
        userId: 'test',
        materialType: {
          name: 'book'
        }
      });

      await checkIn.barcode('9676761472500').clickEnter();
      await checkIn.whenItemsAreLoaded(1);
    });

    it('displays the checked-in item', () => {
      expect(checkIn.checkedInBookTitle).to.equal('Best Book Ever (book)');
    });

    it('should hide item list empty message during checkin', () => {
      expect(checkIn.checkedInItemsList.displaysEmptyMessage).to.be.false;
    });

    describe('ending the session', () => {
      beforeEach(async () => {
        await checkIn.endSession();
      });

      it('clears the list', () => {
        expect(checkIn.hasCheckedInItems).to.be.false;
      });
    });
  });

  describe('showing call number', () => {
    beforeEach(async function () {
      const barcode = '9676761472501';

      this.server.create('item', 'withLoan', {
        barcode,
        callNumberComponents: {
          prefix: 'prefix',
          callNumber: 'callNumber',
          suffix: 'suffix',
        },
        enumeration: 'enumeration',
        chronology: 'chronology',
        volume: 'volume',
      });

      await checkIn.barcode(barcode).clickEnter();
    });

    it('should be properly formatted', () => {
      const callNumber = 'prefix callNumber suffix volume enumeration chronology';

      expect(checkIn.checkedInItemsList.rows(0).cells(3).text).to.equal(callNumber);
    });
  });

  describe('checking in a single item unsuccessfully', () => {
    beforeEach(function () {
      this.server.post('/circulation/check-in-by-barcode', {}, 500);

      return checkIn.barcode('9676761472500').clickEnter();
    });

    it('should hide item list empty message during check in', () => {
      expect(checkIn.checkedInItemsList.displaysEmptyMessage).to.be.false;
    });
  });

  describe('changing check-in date and time without loan', () => {
    beforeEach(async function () {
      this.server.post('/circulation/check-in-by-barcode', (_, request) => {
        const body = JSON.parse(request.requestBody);

        body.item = {};

        return body;
      });

      await checkIn.clickChangeTime();
      await checkIn.processDate.fillAndBlur('04/25/2018');
      await checkIn.processTime.fillInput('11:12 PM');
      await checkIn.barcode('9676761472500').clickEnter();
    });

    it('should display returned time', () => {
      expect(checkIn.checkedInTimeReturned).to.equal('11:12 PM');
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
      await checkIn.selectEllipse();
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
      await checkIn.selectEllipse();
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
        instanceId: 'lychee',
        holdingsRecordId: 'apple'
      });

      await checkIn.barcode('9676761472500').clickEnter();
      await checkIn.selectEllipse();
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
        instanceId: 'lychee',
        holdingsRecordId: 'apple'
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
      expect(checkIn.confirmStatusModal.isPrintTransitChecked).to.be.true;
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
      expect(checkIn.confirmStatusModal.isPrintTransitChecked).to.be.false;
    });
  });

  describe('showing print hold slip option', () => {
    beforeEach(async function () {
      const item = this.server.create('item', 'withLoan', {
        barcode: 9676761472500,
        title: 'Best Book Ever',
        materialType: {
          name: 'book'
        },
        status: {
          name: 'Awaiting pickup',
        },
        location: {
          name: 'Main Library'
        },
        instanceId: 'lychee',
        holdingsRecordId: 'apple'
      });

      this.server.create('request', { status: 'Open - Awaiting pickup', id: item.id });

      await checkIn.barcode('9676761472500').clickEnter();
      await checkIn.confirmStatusModal.clickConfirmButton();
      await checkIn.selectEllipse();
    });

    it('shows hold slip option on the action menu', () => {
      expect(checkIn.printHoldSlipItemPresent).to.be.true;
    });

    it('should close confirm status modal', () => {
      expect(checkIn.isPresentConfirmModal).to.be.false;
    });

    it('should focus and clear barcode input', () => {
      expect(checkIn.barcodeInputValue).to.equal('');
      // expect(checkIn.barcodeInputIsFocused).to.be.true;
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
        instanceId: 'lychee',
        holdingsRecordId: 'apple'
      });

      await checkIn.barcode('9676761472500').clickEnter();
      await checkIn.confirmStatusModal.clickConfirmButton();
      await checkIn.selectEllipse();
    });

    it('shows transit slip option on the action menu', () => {
      expect(checkIn.printTransitSlipItemPresent).to.be.true;
    });
  });

  describe('showing checkin Notes option', () => {
    let item;

    beforeEach(async function () {
      item = this.server.create('item', 'withLoan', {
        title: 'Best Book Ever',
        materialType: {
          name: 'book'
        },
        circulationNotes: [
          {
            note: 'test note 2',
            noteType: 'Check in',
            staffOnly: false,
            source: {
              personal: {
                lastName: faker.name.lastName(),
                firstName: faker.name.firstName(),
              },
            },
            date: faker.date.past()
          },
          {
            note: 'test note 1',
            noteType: 'Check in',
            staffOnly: false,
            source: {
              personal: {
                lastName: faker.name.lastName(),
                firstName: faker.name.firstName(),
              },
            },
            date: faker.date.future()
          }
        ],
        status: {
          name: 'In transit',
        },
        instanceId: 'lychee',
        holdingsRecordId: 'apple'
      });

      await checkIn.barcode(item.barcode).clickEnter();
      await checkIn.checkinNoteModal.clickConfirm();
      await checkIn.confirmStatusModal.clickConfirmButton();
      await checkIn.selectEllipse();
    });

    it('shows checkin Notes option on the action menu', () => {
      expect(checkIn.checkinNotesPresent).to.be.true;
    });

    describe('showing checkinNote modal', () => {
      beforeEach(async function () {
        await checkIn.checkinNotesButton.click();
      });

      it('shows checkinNote modal', () => {
        expect(checkIn.checkinNoteModal.isPresent).to.be.true;
      });

      it('should have proper item order', () => {
        expect(checkIn.checkinNoteModal.checkinNotes(0).name).to.equal(item.circulationNotes[1].note);
        expect(checkIn.checkinNoteModal.checkinNotes(1).name).to.equal(item.circulationNotes[0].note);
      });
    });
  });

  describe('showing multipiece item modal', () => {
    beforeEach(async function () {
      this.server.create('item', 'withLoan', {
        barcode: 9676761472501,
        title: 'Best Book Ever',
        materialType: {
          name: 'book'
        },
        numberOfPieces: 2,
        instanceId: 'lychee',
        holdingsRecordId: 'apple'
      });

      await checkIn.barcode('9676761472501').clickEnter();
    });

    it('shows multipiece item modal', () => {
      expect(checkIn.multiPieceModal.present).to.be.true;
    });
  });

  describe('closes multipiece item modal', () => {
    beforeEach(async function () {
      const firstItem = this.server.create('item', 'withLoan', {
        barcode: 'test',
        title: 'Best Book Ever',
      });
      this.server.create('item', 'withLoan', {
        barcode: 9676761472501,
        title: 'Best Book Ever',
        materialType: {
          name: 'book'
        },
        numberOfPieces: 2,
        instanceId: 'lychee',
        holdingsRecordId: 'apple'
      });

      await checkIn.barcode(firstItem.barcode).clickEnter();
      await checkIn.whenItemsAreLoaded(1);
      await checkIn.barcode('9676761472501').clickEnter();
      await checkIn.multiPieceModal.clickCheckinBtn();
    });

    it('hides multipiece item modal', () => {
      expect(checkIn.multiPieceModal.present).to.be.false;
    });

    it('left one item in the list', () => {
      expect(checkIn.checkedInItemsList.rowCount).to.equal(1);
    });
  });

  describe('showing checkinNote modal', () => {
    beforeEach(async function () {
      this.server.create('item', 'withLoan', {
        barcode: 9676761472501,
        title: 'Best Book Ever',
        circulationNotes: [
          {
            note: 'test note',
            noteType: 'Check in',
            staffOnly: false,
          }
        ],
        materialType: {
          name: 'book'
        },
        numberOfPieces: 1,
        instanceId: 'lychee',
        holdingsRecordId: 'apple'
      });

      await checkIn.barcode('9676761472501').clickEnter();
    });

    it('shows checkinNote modal', () => {
      expect(checkIn.checkinNoteModal.present).to.be.true;
    });
  });

  describe('closes checkinNote modal', () => {
    beforeEach(async function () {
      this.server.create('item', 'withLoan', {
        barcode: 9676761472501,
        title: 'Best Book Ever',
        circulationNotes: [
          {
            note: 'test note',
            noteType: 'Check in',
            staffOnly: false,
          }
        ],
        materialType: {
          name: 'book'
        },
        numberOfPieces: 1,
        instanceId: 'lychee',
        holdingsRecordId: 'apple'
      });

      await checkIn.barcode('9676761472501').clickEnter();
      await checkIn.checkinNoteModal.clickConfirm();
    });

    it('hides checkinNote modal', () => {
      expect(checkIn.checkinNoteModal.present).to.be.false;
    });
  });

  describe('shows and hides all pre checkin modals one after another', () => {
    beforeEach(async function () {
      this.server.create('item', 'withLoan', {
        barcode: 9676761472501,
        title: 'Best Book Ever',
        circulationNotes: [
          {
            note: 'test note',
            noteType: 'Check in',
            staffOnly: false,
          }
        ],
        materialType: {
          name: 'book'
        },
        status: {
          name: 'Missing'
        },
        numberOfPieces: 2,
        instanceId: 'lychee',
        holdingsRecordId: 'apple'
      });

      await checkIn.barcode('9676761472501').clickEnter();
      await checkIn.confirmModal.clickConfirm();
      await checkIn.multiPieceModal.clickCheckinBtn();
      await checkIn.checkinNoteModal.clickConfirm();
    });

    it('hides all pre checkin modals', () => {
      expect(checkIn.confirmModal.present).to.be.false;
      expect(checkIn.multiPieceModal.present).to.be.false;
      expect(checkIn.checkinNoteModal.present).to.be.false;
    });
  });

  describe('when a delivery item is being checked in', () => {
    beforeEach(async function () {
      const item = this.server.create('item', 'withLoan', {
        barcode: '9676761472500',
        status: {
          name: 'Awaiting delivery',
        },
        materialType: {
          name: 'Book',
        },
        title: 'Great book',
      });

      this.server.create('request', { status: 'Open - Awaiting delivery', id: item.id });

      await checkIn.barcode('9676761472500').clickEnter();
    });

    it('should display delivery modal', () => {
      expect(checkIn.deliveryModalIsDisplayed).to.be.true;
    });

    it('should display correct message', () => {
      const expectedMessage = 'There is a delivery request for Great book (Book) (Barcode: 9676761472500). Please check the item out and route for delivery.';

      expect(checkIn.deliveryModal.message).to.equal(expectedMessage);
    });

    it('should display print checkbox unchecked by default', () => {
      expect(checkIn.deliveryModal.printCheckboxIsChecked).to.be.false;
    });

    it('displays the checked-in item', () => {
      expect(checkIn.checkedInBookTitle).to.equal('Great book (Book)');
    });

    describe('and close button was clicked', () => {
      beforeEach(async () => {
        await checkIn.deliveryModal.clickClose();
      });

      it('should close the modal', () => {
        expect(checkIn.deliveryModalIsDisplayed).to.be.false;
      });
    });

    describe('and close and checkout button was clicked', () => {
      beforeEach(async () => {
        await checkIn.deliveryModal.clickCloseAndCheckout();
      });

      it('should close the modal', () => {
        expect(checkIn.deliveryModalIsDisplayed).to.be.false;
      });

      it('should redirect to checkout app', function () {
        const { search, pathname } = this.location;

        expect(search + pathname).to.equal('/checkout');
      });
    });
  });

  statuses.forEach(name => {
    describe(`showing ${name} modal`, () => {
      beforeEach(async function () {
        this.server.create('item', 'withLoan', {
          barcode: 9676761472501,
          title: 'Best Book Ever',
          status: { name },
          materialType: {
            name: 'book',
          },
          numberOfPieces: 1,
          instanceId: 'lychee',
          holdingsRecordId: 'apple',
        });

        await checkIn.barcode('9676761472501').clickEnter();
      });

      it(`shows ${name} modal`, () => {
        expect(checkIn.confirmModal.present).to.be.true;
      });
    });

    describe(`closes ${name} modal`, () => {
      beforeEach(async function () {
        this.server.create('item', 'withLoan', {
          barcode: 9676761472501,
          title: 'Best Book Ever',
          status: { name },
          materialType: {
            name: 'book',
          },
          numberOfPieces: 1,
          instanceId: 'lychee',
          holdingsRecordId: 'apple',
        });

        await checkIn.barcode('9676761472501').clickEnter();
        await checkIn.confirmModal.clickConfirm();
      });

      it(`hides ${name} modal`, () => {
        expect(checkIn.confirmModal.present).to.be.false;
      });
    });
  });
});
