import React from 'react';
import {
  render,
  screen,
  fireEvent,
  cleanup,
} from '@testing-library/react';
import {
  orderBy,
} from 'lodash';

import '../test/jest/__mock__';

import { ConfirmationModal } from '@folio/stripes/components';

import ModalManager from './ModalManager';
import CheckinNoteModal from './components/CheckinNoteModal';
import ClaimedReturnedModal from './components/ClaimedReturnedModal';
import MultipieceModal from './components/MultipieceModal';

import { getById } from '../test/jest/helpers';
import {
  statuses,
} from './consts';

const confirmButton = 'Confirm';
const cancelButton = 'Cancel';

jest.mock('@folio/stripes/util', () => ({
  getFullName: jest.fn((value) => value),
}));
jest.mock('./components/CheckinNoteModal', () => jest.fn(({
  onConfirm,
  onCancel,
}) => (
  <div data-testid="checkinNoteModal">
    <button type="button" onClick={onConfirm}>{confirmButton}</button>
    <button type="button" onClick={onCancel}>{cancelButton}</button>
  </div>
)));
jest.mock('./components/ClaimedReturnedModal', () => jest.fn(({ onCancel, onConfirm }) => (
  <div data-testid="claimedReturnedModal">
    <button type="button" onClick={onConfirm}>{confirmButton}</button>
    <button type="button" onClick={onCancel}>{cancelButton}</button>
  </div>
)));
jest.mock('./components/MultipieceModal', () => jest.fn(({ onConfirm, onClose }) => (
  <div data-testid="multipieceModal">
    <button type="button" onClick={onConfirm}>{confirmButton}</button>
    <button type="button" onClick={onClose}>{cancelButton}</button>
  </div>
)));

describe('ModalManager', () => {
  const labelIds = {
    checkinNotesHeading: 'ui-checkin.checkinNotes.heading',
    checkinNoteModalHeading: 'ui-checkin.checkinNoteModal.heading',
    close: 'ui-checkin.close',
    multipieceModalCancel: 'ui-checkin.multipieceModal.cancel',
    multipieceModalConfirm: 'ui-checkin.multipieceModal.confirm',
    checkinNotesMessage: 'ui-checkin.checkinNotes.message',
    checkinNoteModalMessage: 'ui-checkin.checkinNoteModal.message',
    date: 'ui-checkin.date',
    note: 'ui-checkin.note',
    source: 'ui-checkin.source',
    confirmModalHeading: 'ui-checkin.confirmModal.heading',
    confirmModalMessage: 'ui-checkin.confirmModal.message',
    confirmModalCancel: 'ui-checkin.confirmModal.cancel',
    confirmModalConfirm: 'ui-checkin.confirmModal.confirm',
    confirmButton,
    cancelButton,
  };
  const testIds = {
    checkinNoteModal: 'checkinNoteModal',
    claimedReturnedModal: 'claimedReturnedModal',
    multipieceModal: 'multipieceModal',
    confirmationModal: 'confirmationModal',
  };
  const notesWithCheckinType = [
    {
      noteType: statuses.CHECK_IN,
      date: 'dateA',
      desc: 'descA',
    }, {
      noteType: statuses.CHECK_IN,
      date: 'dateB',
      desc: 'descA',
    }, {
      noteType: statuses.CHECK_IN,
      date: 'dateA',
      desc: 'descB',
    },
  ];
  const noteWithoutCheckinType = {
    noteType: statuses.UNKNOWN,
    date: 'dateB',
    desc: 'descB',
  };
  const checkedinItem = {
    title: 'title',
    barcode: 'barcode',
    discoverySuppress: true,
    status: {
      name: statuses.CLAIMED_RETURNED,
    },
    materialType: {
      name: 'book',
    },
    circulationNotes: [...notesWithCheckinType, noteWithoutCheckinType],
  };
  const claimedReturnedHandler = jest.fn();
  const onDone = jest.fn();
  const onCancel = jest.fn();
  const defaultProps = {
    checkedinItem,
    claimedReturnedHandler,
    onDone,
    onCancel,
  };

  describe('when "checkinNotesMode" is true', () => {
    beforeEach(() => {
      render(
        <ModalManager
          {...defaultProps}
          checkinNotesMode
        />
      );
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should render "CheckinNoteModal" ', () => {
      expect(CheckinNoteModal).toHaveBeenCalledWith(expect.objectContaining({
        open: true,
        heading: labelIds.checkinNotesHeading,
        onConfirm: expect.any(Function),
        onCancel: expect.any(Function),
        hideConfirm: true,
        cancelLabel: labelIds.close,
        confirmLabel: labelIds.multipieceModalConfirm,
        notes: orderBy(notesWithCheckinType, 'date', 'desc'),
        message: labelIds.checkinNotesMessage,
        columnMapping: {
          date: labelIds.date,
          note: labelIds.note,
          source: labelIds.source,
        },
        visibleColumns: ['date', 'note', 'source'],
      }), {});
    });

    it('should correctly handle cancel of "CheckinNoteModal"', () => {
      expect(onCancel).not.toBeCalled();

      fireEvent.click(getById(testIds.checkinNoteModal).getByText(labelIds.cancelButton));

      expect(onCancel).toBeCalled();
    });

    it('should close "CheckinNoteModal" when onCancel callback is triggered', () => {
      const modal = screen.getByTestId(testIds.checkinNoteModal);

      fireEvent.click(getById(testIds.checkinNoteModal).getByText(labelIds.cancelButton));

      expect(modal).not.toBeInTheDocument();
    });

    it('should correctly handle confirm of "CheckinNoteModal"', () => {
      expect(onDone).not.toBeCalled();

      fireEvent.click(getById(testIds.checkinNoteModal).getByText(labelIds.confirmButton));

      expect(onDone).toBeCalled();
    });

    it('should close "CheckinNoteModal" when onConfirm callback is triggered', () => {
      const modal = screen.getByTestId(testIds.checkinNoteModal);

      fireEvent.click(getById(testIds.checkinNoteModal).getByText(labelIds.confirmButton));

      expect(modal).not.toBeInTheDocument();
    });
  });

  describe('when "checkinNotesMode" is false', () => {
    describe(`item status is ${statuses.CLAIMED_RETURNED}`, () => {
      describe('and checkedinItem have numberOfPieces greater than one', () => {
        const newCheckedinItem = {
          ...checkedinItem,
          numberOfPieces: 2,
        };

        beforeEach(() => {
          render(
            <ModalManager
              {...defaultProps}
              checkedinItem={newCheckedinItem}
              checkinNotesMode={false}
            />
          );
        });

        it('should render "ClaimedReturnedModal" with correct props', () => {
          expect(ClaimedReturnedModal).toHaveBeenCalledWith({
            item: newCheckedinItem,
            open: true,
            onCancel: expect.any(Function),
            onConfirm: expect.any(Function),
          }, {});
        });

        it('should correctly handle cancel of "ClaimedReturnedModal"', () => {
          expect(onCancel).not.toBeCalled();

          fireEvent.click(getById(testIds.claimedReturnedModal).getByText(labelIds.cancelButton));

          expect(onCancel).toBeCalled();
        });

        it('should close "ClaimedReturnedModal" when onCancel callback is triggered', () => {
          const modal = screen.getByTestId(testIds.claimedReturnedModal);

          fireEvent.click(getById(testIds.claimedReturnedModal).getByText(labelIds.cancelButton));

          expect(modal).not.toBeInTheDocument();
        });

        it('should correctly handle confirm of "ClaimedReturnedModal"', () => {
          expect(claimedReturnedHandler).not.toBeCalled();

          fireEvent.click(getById(testIds.claimedReturnedModal).getByText(labelIds.confirmButton));

          expect(claimedReturnedHandler).toBeCalled();
        });

        it('should close "ClaimedReturnedModal" when onConfirm callback is triggered', () => {
          const modal = screen.getByTestId(testIds.claimedReturnedModal);

          fireEvent.click(getById(testIds.claimedReturnedModal).getByText(labelIds.confirmButton));

          expect(modal).not.toBeInTheDocument();
        });

        describe('after "ClaimedReturnedModal" confrimation', () => {
          beforeEach(() => {
            fireEvent.click(getById(testIds.claimedReturnedModal).getByText(labelIds.confirmButton));
          });

          afterEach(() => {
            jest.clearAllMocks();
          });

          it('should render "MultipieceModal" with correct props', () => {
            expect(MultipieceModal).toHaveBeenCalledWith({
              open: true,
              item: newCheckedinItem,
              onConfirm: expect.any(Function),
              onClose: expect.any(Function),
            }, {});
          });

          it('should correctly handle close of "MultipieceModal"', () => {
            expect(onCancel).not.toBeCalled();

            fireEvent.click(getById(testIds.multipieceModal).getByText(labelIds.cancelButton));

            expect(onCancel).toBeCalled();
          });

          it('should close "MultipieceModal" when onCancel callback is triggered', () => {
            const modal = screen.getByTestId(testIds.multipieceModal);

            fireEvent.click(getById(testIds.multipieceModal).getByText(labelIds.cancelButton));

            expect(modal).not.toBeInTheDocument();
          });

          it('should close "MultipieceModal" when onConfirm callback is triggered', () => {
            const modal = screen.getByTestId(testIds.multipieceModal);

            fireEvent.click(getById(testIds.multipieceModal).getByText(labelIds.confirmButton));

            expect(modal).not.toBeInTheDocument();
          });

          describe('after "MultipieceModal" confirmation', () => {
            describe(`when checked-in item have at least one note with type"${statuses.CHECK_IN}"`, () => {
              beforeEach(() => {
                fireEvent.click(getById(testIds.multipieceModal).getByText(labelIds.confirmButton));
              });

              it('should render "CheckinNoteModal" with correct props', () => {
                expect(CheckinNoteModal).toHaveBeenCalledWith(expect.objectContaining({
                  open: true,
                  heading: labelIds.checkinNoteModalHeading,
                  hideConfirm: false,
                  cancelLabel: labelIds.multipieceModalCancel,
                  message: labelIds.checkinNoteModalMessage,
                }), {});
              });
            });

            describe(`when there are no notes with "${statuses.CHECK_IN}" type`, () => {
              beforeEach(() => {
                cleanup();

                render(
                  <ModalManager
                    {...defaultProps}
                    checkedinItem={{
                      ...newCheckedinItem,
                      circulationNotes: [noteWithoutCheckinType],
                    }}
                    checkinNotesMode={false}
                  />
                );

                fireEvent.click(getById(testIds.claimedReturnedModal).getByText(labelIds.confirmButton));
                fireEvent.click(getById(testIds.multipieceModal).getByText(labelIds.confirmButton));
              });

              it('should not render "CheckinNoteModal"', () => {
                expect(CheckinNoteModal).not.toBeCalled();
              });
            });
          });
        });
      });

      describe('and checkedinItem have descriptionOfPieces', () => {
        const newCheckedinItem = {
          ...checkedinItem,
          descriptionOfPieces: 'descriptionOfPieces',
        };

        beforeEach(() => {
          render(
            <ModalManager
              {...defaultProps}
              checkedinItem={newCheckedinItem}
              checkinNotesMode={false}
            />
          );

          fireEvent.click(getById(testIds.claimedReturnedModal).getByText(labelIds.confirmButton));
          fireEvent.click(getById(testIds.multipieceModal).getByText(labelIds.confirmButton));
        });

        it('should render "MultipieceModal" with correct props', () => {
          expect(MultipieceModal).toHaveBeenCalledWith(expect.objectContaining({
            item: newCheckedinItem,
          }), {});
        });
      });

      describe('and checkedinItem have numberOfMissingPieces', () => {
        const newCheckedinItem = {
          ...checkedinItem,
          numberOfMissingPieces: 1,
        };

        beforeEach(() => {
          render(
            <ModalManager
              {...defaultProps}
              checkedinItem={newCheckedinItem}
              checkinNotesMode={false}
            />
          );

          fireEvent.click(getById(testIds.claimedReturnedModal).getByText(labelIds.confirmButton));
          fireEvent.click(getById(testIds.multipieceModal).getByText(labelIds.confirmButton));
        });

        it('should render "MultipieceModal" with correct props', () => {
          expect(MultipieceModal).toHaveBeenCalledWith(expect.objectContaining({
            item: newCheckedinItem,
          }), {});
        });
      });

      describe('and checkedinItem have missingPieces', () => {
        const newCheckedinItem = {
          ...checkedinItem,
          missingPieces: 'missingPieces',
        };

        beforeEach(() => {
          render(
            <ModalManager
              {...defaultProps}
              checkedinItem={newCheckedinItem}
              checkinNotesMode={false}
            />
          );

          fireEvent.click(getById(testIds.claimedReturnedModal).getByText(labelIds.confirmButton));
          fireEvent.click(getById(testIds.multipieceModal).getByText(labelIds.confirmButton));
        });

        it('should render "MultipieceModal" with correct props', () => {
          expect(MultipieceModal).toHaveBeenCalledWith(expect.objectContaining({
            item: newCheckedinItem,
          }), {});
        });
      });

      describe('and there is no condition to render more than one modal', () => {
        beforeEach(() => {
          render(
            <ModalManager
              {...defaultProps}
              checkedinItem={{
                ...checkedinItem,
                circulationNotes: [],
              }}
              checkinNotesMode={false}
            />
          );
        });

        it('should execute "onDone" method at the end', () => {
          expect(onDone).not.toHaveBeenCalled();

          fireEvent.click(getById(testIds.claimedReturnedModal).getByText(labelIds.confirmButton));

          expect(onDone).toHaveBeenCalled();
        });
      });
    });

    describe('and item status one of thouse to be confirmed on check-in', () => {
      beforeEach(() => {
        render(
          <ModalManager
            {...defaultProps}
            checkedinItem={{
              ...checkedinItem,
              numberOfPieces: 2,
              status: {
                name: statuses.UNAVAILABLE,
              },
            }}
            checkinNotesMode={false}
          />
        );
      });

      it('should render "ConfirmationModal" with correct props', () => {
        expect(ConfirmationModal).toHaveBeenCalledWith({
          open: true,
          heading: labelIds.confirmModalHeading,
          onConfirm: expect.any(Function),
          onCancel: expect.any(Function),
          cancelLabel: labelIds.confirmModalCancel,
          confirmLabel: labelIds.confirmModalConfirm,
          message: labelIds.confirmModalMessage,
        }, {});
      });

      it('should correctly handle cancel of "ConfirmationModal"', () => {
        expect(onCancel).not.toBeCalled();

        fireEvent.click(getById(testIds.confirmationModal).getByText(labelIds.confirmModalCancel));

        expect(onCancel).toBeCalled();
      });

      it('should close "ConfirmationModal" when onCancel callback is triggered', () => {
        const modal = screen.getByTestId(testIds.confirmationModal);

        fireEvent.click(getById(testIds.confirmationModal).getByText(labelIds.confirmModalCancel));

        expect(modal).not.toBeInTheDocument();
      });

      it('should close "ConfirmationModal" when onConfirm callback is triggered', () => {
        const modal = screen.getByTestId(testIds.confirmationModal);

        fireEvent.click(getById(testIds.confirmationModal).getByText(labelIds.confirmModalConfirm));

        expect(modal).not.toBeInTheDocument();
      });

      it('should show next modal when onConfirm callback for "ConfirmationModal" is triggered', () => {
        fireEvent.click(getById(testIds.confirmationModal).getByText(labelIds.confirmModalConfirm));

        expect(screen.getByTestId(testIds.multipieceModal)).toBeInTheDocument();
      });
    });
  });
});
