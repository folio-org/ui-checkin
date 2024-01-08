import React from 'react';
import {
  fireEvent,
  render,
  screen,
  waitFor,
} from '@folio/jest-config-stripes/testing-library/react';

import Scan from './Scan';
import {
  statuses,
  cancelFeeClaimReturned,
  MAX_RECORDS,
  REQUEST_STATUSES,
} from './consts';
import {
  buildDateTime,
  getCheckinSettings,
} from './util';

const basicProps = {
  history: {
    push: jest.fn(),
  },
  okapi: {
    currentUser: {
      id: 'currentUserId',
      firstName: 'firstName',
      lastName: 'lastName',
      curServicePoint: {
        id: 'curServicePointId',
      },
    },
  },
  stripes: {
    store: {},
  },
  resources: {
    scannedItems: [
      {
        userId: 'userId',
        itemId: 'itemId',
      },
      {
        userId: 'userId',
        itemId: 'itemId_2',
      }
    ],
    items: {},
    checkinSettings: {
      records: [],
    },
    checkInSession: {
      sessionId: 'sessionId',
    },
  },
  mutator: {
    accounts: {
      GET: jest.fn(),
      PUT: jest.fn(),
    },
    activeAccount: {
      update: jest.fn(),
    },
    lostItemPolicy: {
      GET: jest.fn(),
    },
    endSession: {
      POST: jest.fn(),
    },
    scannedItems: {
      replace: jest.fn(),
    },
    checkInSession: {
      update: jest.fn(),
    },
    items: {
      reset: jest.fn(),
      GET: jest.fn(),
    },
    checkIn: {
      POST: jest.fn(),
    },
    feefineactions: {
      POST: jest.fn(),
    },
    requests: {
      reset: jest.fn(),
      GET: jest.fn(),
    },
  },
};
const testIds = {
  showNotesButton: 'showNotesButton',
  submitButton: 'submitButton',
  endSessionButton: 'endSessionButton',
  confirmStatusButton: 'confirmStatusButton',
  cancelStatusButton: 'cancelStatusButton',
  transitionModal: 'transitionModal',
  deliveryModal: 'deliveryModal',
  holdModal: 'holdModal',
  redirectToCheckoutButton: 'redirectToCheckoutButton',
  closeDeliveryModalButton: 'closeDeliveryModalButton',
};
const labelIds = {
  transitionModalLabel: 'ui-checkin.statusModal.transit.heading',
  transitionModalMessage: 'ui-checkin.statusModal.transit.message',
  deliveryModalLabel: 'ui-checkin.statusModal.delivery.heading',
  deliveryModalMessage: 'ui-checkin.statusModal.delivery.message',
  holdModalLabel: 'ui-checkin.statusModal.hold.heading',
  holdModalMessage: 'ui-checkin.statusModal.hold.comment',
};
const createRefMock = {
  current: {
    focus: jest.fn(),
    reset: jest.fn(),
    change: jest.fn(),
  },
};
const checkinItem = {
  barcode: 'itemBarcode',
};
const mockedUuid = '550e8400-e29b-41d4-a716-446655440000';

jest.mock('@folio/stripes/util', () => ({
  escapeCqlValue: jest.fn(value => value),
}));
jest.mock('uuid', () => ({
  v4: jest.fn(() => mockedUuid),
}));
jest.mock('./CheckIn', () => jest.fn(({
  onSessionEnd,
  onSubmit,
  showCheckinNotes,
}) => {
  const handleSubmit = () => {
    onSubmit({
      item: checkinItem,
    });
  };

  return (
    <div>
      <button
        type="button"
        data-testid={testIds.showNotesButton}
        onClick={showCheckinNotes}
      >
        Show notes
      </button>
      <button
        type="button"
        data-testid={testIds.submitButton}
        onClick={handleSubmit}
      >
        Submit
      </button>
      <button
        type="button"
        data-testid={testIds.endSessionButton}
        onClick={onSessionEnd}
      >
        End session
      </button>
    </div>
  );
}));
jest.mock('./components/ConfirmStatusModal', () => jest.fn(({
  'data-testid': testId,
  label,
  message,
  onConfirm,
  onCancel,
}) => (
  <div data-testid={testId}>
    <span>{label}</span>
    {message.map(msg => (
      <span>{msg}</span>
    ))}
    <button
      onClick={onConfirm}
      type="button"
      data-testid={testIds.confirmStatusButton}
    >
      Confirm
    </button>
    <button
      onClick={onCancel}
      type="button"
      data-testid={testIds.cancelStatusButton}
    >
      Cancel
    </button>
  </div>
)));
jest.mock('./components/RouteForDeliveryModal', () => jest.fn(({
  'data-testid': testId,
  label,
  modalContent,
  onCloseAndCheckout,
  onClose,
}) => (
  <div data-testid={testId}>
    <span>{label}</span>
    <span>{modalContent}</span>
    <button
      onClick={onCloseAndCheckout}
      type="button"
      data-testid={testIds.redirectToCheckoutButton}
    >
      Go to checkout
    </button>
    <button
      onClick={onClose}
      type="button"
      data-testid={testIds.closeDeliveryModalButton}
    >
      Close
    </button>
  </div>
)));
jest.mock('./util', () => ({
  buildDateTime: jest.fn(),
  convertToSlipData: jest.fn(),
  getCheckinSettings: jest.fn(),
}));
jest.spyOn(React, 'createRef').mockReturnValue(createRefMock);

describe('Scan', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Check in item', () => {
    describe('When checkedin process is successful', () => {
      const checkInDate = '2024-01-09T12:08:14.769Z';
      const items = {
        items: {},
        totalRecords: 1,
      };
      const requests = [
        {
          item: null,
          requester: {
            barcode: 'requesterBarcode',
          },
          patronComments: 'patronComments',
        }
      ];
      const checkDataRetrieving = (barcode) => {
        it('should get checkin settings', () => {
          expect(getCheckinSettings).toHaveBeenCalledWith(basicProps.resources.checkinSettings.records);
        });

        it('should reset items data', () => {
          expect(basicProps.mutator.items.reset).toHaveBeenCalled();
        });

        it('should get items', () => {
          const expectedArgument = {
            params: {
              query: `barcode==${barcode}`,
              limit: MAX_RECORDS,
            },
          };

          expect(basicProps.mutator.items.GET).toHaveBeenCalledWith(expectedArgument);
        });

        it('should build check in date', () => {
          expect(buildDateTime).toHaveBeenCalled();
        });
      };
      const checkNoDataRetrieving = () => {
        it('should not get accounts information', () => {
          expect(basicProps.mutator.accounts.GET).not.toHaveBeenCalled();
        });

        it('should not get lost item policy information', () => {
          expect(basicProps.mutator.lostItemPolicy.GET).not.toHaveBeenCalled();
        });

        it('should not send action information to the server', () => {
          expect(basicProps.mutator.feefineactions.POST).not.toHaveBeenCalled();
        });

        it('should not update account record information', () => {
          expect(basicProps.mutator.activeAccount.update).not.toHaveBeenCalled();
        });

        it('should not update account record information', () => {
          expect(basicProps.mutator.accounts.PUT).not.toHaveBeenCalled();
        });
      };

      beforeEach(() => {
        buildDateTime.mockReturnValue(checkInDate);
        basicProps.mutator.items.GET.mockReturnValue(items);
        basicProps.mutator.requests.GET.mockResolvedValue(requests);
      });

      describe('With retrieved loan', () => {
        const barcode = `"${checkinItem.barcode}*"`;
        const requestData = {
          loan: {
            id: 'loanId',
            lostItemPolicyId: 'lostItemPolicyId',
            item: {},
          },
          item: {
            id: 'itemId',
          },
          nextRequest: {},
          transitItem: {},
          holdItem: {},
          staffSlipContext: {},
          inHouseUse: {},
        };
        const lostItemFeePolicies = {
          lostItemFeePolicies: [
            {
              returnedLostItemProcessingFee: {},
            }
          ],
        };
        const accounts = {
          accounts: [
            {
              amount: 10,
              id: 'accountId',
              remaining: null,
              status: {},
              paymentStatus: {
                name: `${cancelFeeClaimReturned.PAYMENT_STATUS}-test`,
              },
              feeFineType: cancelFeeClaimReturned.LOST_ITEM_PROCESSING_FEE,
            }
          ],
        };

        beforeEach(() => {
          render(
            <Scan
              {...basicProps}
            />
          );
          getCheckinSettings.mockReturnValue({
            wildcardLookupEnabled: true,
          });

          basicProps.mutator.checkIn.POST.mockResolvedValue(requestData);
          basicProps.mutator.lostItemPolicy.GET.mockResolvedValue(lostItemFeePolicies);
          basicProps.mutator.accounts.GET.mockResolvedValue(accounts);

          const submitButton = screen.getByTestId(testIds.submitButton);

          fireEvent.click(submitButton);
        });

        checkDataRetrieving(barcode);

        it('should get accounts information', () => {
          const expectedArgument = {
            path: `accounts?query=loanId=="${requestData.loan.id}"`,
          };

          expect(basicProps.mutator.accounts.GET).toHaveBeenCalledWith(expectedArgument);
        });

        it('should get lost item policy information', () => {
          const expectedArgument = {
            params: {
              query: `id==${requestData.loan.lostItemPolicyId}`,
            },
          };

          expect(basicProps.mutator.lostItemPolicy.GET).toHaveBeenCalledWith(expectedArgument);
        });

        it('should send action information to the server', () => {
          const expectedArgument = {
            typeAction: cancelFeeClaimReturned.TYPE_ACTION,
            comments: '',
            notify: false,
            amountAction: accounts.accounts[0].amount,
            balance: 0,
            transactionInformation: '',
            source: `${basicProps.okapi.currentUser.lastName}, ${basicProps.okapi.currentUser.firstName}`,
            paymentMethod: '',
            accountId: accounts.accounts[0].id,
            userId: basicProps.okapi.currentUser.id,
            createdAt: basicProps.okapi.currentUser.curServicePoint.id,
          };

          expect(basicProps.mutator.feefineactions.POST).toHaveBeenCalledWith(expect.objectContaining(expectedArgument));
        });

        it('should update account record information', () => {
          const expectedArgument = {
            id: accounts.accounts[0].id,
          };

          expect(basicProps.mutator.activeAccount.update).toHaveBeenCalledWith(expectedArgument);
        });

        it('should update account record information', () => {
          const expectedArgument = {
            ...accounts.accounts[0],
            paymentStatus: {
              name: cancelFeeClaimReturned.CANCEL_PAYMENT_STATUS,
            },
            remaining: 0,
            status: {
              name: 'Closed',
            },
          };

          expect(basicProps.mutator.accounts.PUT).toHaveBeenCalledWith(expectedArgument);
        });

        it('should reset requests', () => {
          expect(basicProps.mutator.requests.reset).toHaveBeenCalled();
        });

        it('should retrieve requests', () => {
          const expectedArgument = {
            params: {
              query: `(itemId==${requestData.item.id} and (status=="${REQUEST_STATUSES.AWAITING_PICKUP}" or status=="${REQUEST_STATUSES.AWAITING_DELIVERY}"))`,
            },
          };

          expect(basicProps.mutator.requests.GET).toHaveBeenCalledWith(expectedArgument);
        });

        it('should replace scannedItems', () => {
          const expectedArgument = [
            {
              ...requestData.loan,
              loanId: requestData.loan.id,
              nextRequest: requestData.nextRequest,
              transitItem: requestData.transitItem,
              holdItem: requestData.holdItem,
              staffSlipContext: requestData.staffSlipContext,
              inHouseUse: requestData.inHouseUse,
            },
            ...basicProps.resources.scannedItems
          ];

          expect(basicProps.mutator.scannedItems.replace).toHaveBeenCalledWith(expectedArgument);
        });

        it('should change barcode field value to empty string', () => {
          const expectedArgument = ['item.barcode', ''];

          expect(createRefMock.current.change).toHaveBeenCalledWith(...expectedArgument);
        });

        it('should focus on barcode field', async () => {
          await waitFor(() => {
            expect(createRefMock.current.focus).toHaveBeenCalled();
          });
        });
      });

      describe('With retrieved item with "In transit" status', () => {
        const barcode = `"${checkinItem.barcode}*"`;
        const requestData = {
          item: {
            status: {
              name: statuses.IN_TRANSIT,
            },
          },
          nextRequest: {},
          transitItem: {},
          holdItem: {},
          staffSlipContext: {},
          inHouseUse: {},
        };

        beforeEach(() => {
          render(
            <Scan
              {...basicProps}
            />
          );
          getCheckinSettings.mockReturnValue({
            wildcardLookupEnabled: true,
          });
          basicProps.mutator.checkIn.POST.mockResolvedValue(requestData);

          const submitButton = screen.getByTestId(testIds.submitButton);

          fireEvent.click(submitButton);
        });

        checkDataRetrieving(barcode);

        checkNoDataRetrieving();

        it('should replace scannedItems', () => {
          const expectedArgument = [
            {
              item: {
                circulationNotes: [],
                status: {
                  name: statuses.IN_TRANSIT,
                },
              },
              loanId: '',
              nextRequest: requestData.nextRequest,
              transitItem: requestData.transitItem,
              holdItem: requestData.holdItem,
              staffSlipContext: requestData.staffSlipContext,
              inHouseUse: requestData.inHouseUse,
              returnDate: checkInDate,
            },
            ...basicProps.resources.scannedItems
          ];

          expect(basicProps.mutator.scannedItems.replace).toHaveBeenCalledWith(expectedArgument);
        });

        it('should render transition modal', async () => {
          await waitFor(() => {
            const transitionModal = screen.getByTestId(testIds.transitionModal);

            expect(transitionModal).toBeInTheDocument();
          });
        });

        it('should render transition modal label', async () => {
          await waitFor(() => {
            const transitionModalLabel = screen.getByText(labelIds.transitionModalLabel);

            expect(transitionModalLabel).toBeInTheDocument();
          });
        });

        it('should render transition modal message', async () => {
          await waitFor(() => {
            const transitionModalMessage = screen.getByText(labelIds.transitionModalMessage);

            expect(transitionModalMessage).toBeInTheDocument();
          });
        });

        it('should close transition modal', async () => {
          await waitFor(() => {
            const confirmStatusButton = screen.getByTestId(testIds.confirmStatusButton);

            fireEvent.click(confirmStatusButton);

            const transitionModal = screen.queryByTestId(testIds.transitionModal);

            expect(transitionModal).not.toBeInTheDocument();
          });
        });

        it('should move focus on barcode field', async () => {
          await waitFor(() => {
            const cancelStatusButton = screen.getByTestId(testIds.cancelStatusButton);

            fireEvent.click(cancelStatusButton);

            expect(createRefMock.current.focus).toHaveBeenCalled();
          });
        });
      });

      describe('With retrieved item with "Awaiting pickup" status', () => {
        const barcode = `"${checkinItem.barcode}"`;
        const requestData = {
          item: {
            status: {
              name: statuses.AWAITING_PICKUP,
            },
          },
        };

        beforeEach(() => {
          render(
            <Scan
              {...basicProps}
            />
          );
          getCheckinSettings.mockReturnValue({
            wildcardLookupEnabled: false,
          });
          basicProps.mutator.checkIn.POST.mockResolvedValue(requestData);

          const submitButton = screen.getByTestId(testIds.submitButton);

          fireEvent.click(submitButton);
        });

        checkDataRetrieving(barcode);

        checkNoDataRetrieving();

        it('should replace scannedItems', () => {
          const expectedArgument = [
            {
              item: {
                circulationNotes: [],
                status: {
                  name: statuses.AWAITING_PICKUP,
                },
              },
              loanId: '',
              nextRequest: requestData.nextRequest,
              transitItem: requestData.transitItem,
              holdItem: requestData.holdItem,
              staffSlipContext: requestData.staffSlipContext,
              inHouseUse: requestData.inHouseUse,
              returnDate: checkInDate,
            },
            ...basicProps.resources.scannedItems
          ];

          expect(basicProps.mutator.scannedItems.replace).toHaveBeenCalledWith(expectedArgument);
        });

        it('should render hold modal', async () => {
          await waitFor(() => {
            const holdModal = screen.getByTestId(testIds.holdModal);

            expect(holdModal).toBeInTheDocument();
          });
        });

        it('should render hold modal label', async () => {
          await waitFor(() => {
            const holdModalLabel = screen.getByText(labelIds.holdModalLabel);

            expect(holdModalLabel).toBeInTheDocument();
          });
        });

        it('should render hold modal message', async () => {
          await waitFor(() => {
            const holdModalMessage = screen.getByText(labelIds.holdModalMessage);

            expect(holdModalMessage).toBeInTheDocument();
          });
        });

        it('should close hold modal', async () => {
          await waitFor(() => {
            const confirmStatusButton = screen.getByTestId(testIds.confirmStatusButton);

            fireEvent.click(confirmStatusButton);

            const holdModal = screen.queryByTestId(testIds.holdModal);

            expect(holdModal).not.toBeInTheDocument();
          });
        });

        it('should move focus on barcode field', async () => {
          await waitFor(() => {
            const cancelStatusButton = screen.getByTestId(testIds.cancelStatusButton);

            fireEvent.click(cancelStatusButton);

            expect(createRefMock.current.focus).toHaveBeenCalled();
          });
        });
      });

      describe('With retrieved item with "Awaiting delivery" status', () => {
        const barcode = `"${checkinItem.barcode}"`;
        const requestData = {
          item: {
            status: {
              name: statuses.AWAITING_DELIVERY,
            },
            materialType: {
              name: 'materialTypeName',
            },
            title: 'itemTitle',
            barcode: 'itemBarcode',
          },
        };

        beforeEach(() => {
          render(
            <Scan
              {...basicProps}
            />
          );
          basicProps.mutator.checkIn.POST.mockResolvedValue(requestData);
          getCheckinSettings.mockReturnValue({
            wildcardLookupEnabled: false,
          });

          const submitButton = screen.getByTestId(testIds.submitButton);

          fireEvent.click(submitButton);
        });

        checkDataRetrieving(barcode);

        checkNoDataRetrieving();

        it('should replace scannedItems', () => {
          const expectedArgument = [
            {
              item: {
                ...requestData.item,
                circulationNotes: [],
              },
              loanId: '',
              nextRequest: requestData.nextRequest,
              transitItem: requestData.transitItem,
              holdItem: requestData.holdItem,
              staffSlipContext: requestData.staffSlipContext,
              inHouseUse: requestData.inHouseUse,
              returnDate: checkInDate,
            },
            ...basicProps.resources.scannedItems
          ];

          expect(basicProps.mutator.scannedItems.replace).toHaveBeenCalledWith(expectedArgument);
        });

        it('should render delivery modal', async () => {
          await waitFor(() => {
            const deliveryModal = screen.getByTestId(testIds.deliveryModal);

            expect(deliveryModal).toBeInTheDocument();
          });
        });

        it('should render delivery modal label', async () => {
          await waitFor(() => {
            const deliveryModalLabel = screen.getByText(labelIds.deliveryModalLabel);

            expect(deliveryModalLabel).toBeInTheDocument();
          });
        });

        it('should render delivery modal message', async () => {
          await waitFor(() => {
            const deliveryModalMessage = screen.getByText(labelIds.deliveryModalMessage);

            expect(deliveryModalMessage).toBeInTheDocument();
          });
        });

        it('should close delivery modal', async () => {
          await waitFor(() => {
            const closeDeliveryModalButton = screen.getByTestId(testIds.closeDeliveryModalButton);

            fireEvent.click(closeDeliveryModalButton);

            const deliveryModal = screen.queryByTestId(testIds.deliveryModal);

            expect(deliveryModal).not.toBeInTheDocument();
          });
        });

        it('should redirect user to checkout page', async () => {
          await waitFor(() => {
            const redirectToCheckoutButton = screen.getByTestId(testIds.redirectToCheckoutButton);
            const expectedArgument = {
              pathname: '/checkout',
              state: {
                itemBarcode: requestData.item.barcode,
                patronBarcode: requests[0].requester.barcode,
              },
            };

            basicProps.history.push.mockClear();
            fireEvent.click(redirectToCheckoutButton);

            expect(basicProps.history.push).toHaveBeenCalledWith(expectedArgument);
          });
        });
      });
    });
  });

  describe('Session ending', () => {
    beforeEach(() => {
      render(
        <Scan
          {...basicProps}
        />
      );

      const endSessionButton = screen.getByTestId(testIds.endSessionButton);

      fireEvent.click(endSessionButton);
    });

    it('should clear resources', () => {
      const expectedArgument = [];

      expect(basicProps.mutator.scannedItems.replace).toHaveBeenCalledWith(expectedArgument);
    });

    it('should clear form', () => {
      expect(createRefMock.current.reset).toHaveBeenCalled();
    });

    it('should generate session id', () => {
      const expectedArgument = {
        sessionId: mockedUuid,
      };

      expect(basicProps.mutator.checkInSession.update).toHaveBeenCalledWith(expectedArgument);
    });

    it('should end session', () => {
      const expectedArg = {
        endSessions: [
          {
            actionType: 'Check-in',
            patronId: basicProps.resources.scannedItems[0].userId,
          }
        ],
      };

      expect(basicProps.mutator.endSession.POST).toHaveBeenCalledWith(expectedArg);
    });
  });
});
