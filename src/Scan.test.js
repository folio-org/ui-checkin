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
  REQUEST_STATUSES,
  ACCOUNT_STATUS_NAMES,
  PAGE_AMOUNT,
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
    user: {
      user: {
        curServicePoint: {
          id: 'spId',
        },
      },
    },
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
  errorModal: 'errorModal',
  checkinModalManager: 'checkinModalManager',
  cancelModalManagerButton: 'cancelModalManagerButton',
  selectItemModal: 'selectItemModal',
  closeSelectModalButton: 'closeSelectModalButton',
  selectItemButton: 'selectItemButton',
};
const labelIds = {
  transitionModalLabel: 'ui-checkin.statusModal.transit.heading',
  transitionModalMessage: 'ui-checkin.statusModal.transit.message',
  deliveryModalLabel: 'ui-checkin.statusModal.delivery.heading',
  deliveryModalMessage: 'ui-checkin.statusModal.delivery.message',
  holdModalLabel: 'ui-checkin.statusModal.hold.heading',
  holdModalMessage: 'ui-checkin.statusModal.hold.comment',
  noItemFoundMessage: 'ui-checkin.errorModal.noItemFound',
  itemNotFoundLabel: 'ui-checkin.itemNotFound',
  itemNotCheckedInLabel: 'ui-checkin.itemNotCheckedIn',
  unhandledErrorMessage: 'ui-checkin.errorModal.unhandledError',
  closeErrorModalButton: 'ui-checkin.close',
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
jest.mock('./ModalManager', () => jest.fn(({
  'data-testid': testId,
  onCancel,
}) => (
  <div data-testid={testId}>
    <button
      type="button"
      onClick={onCancel}
      data-testid={testIds.cancelModalManagerButton}
    >
      Cancel
    </button>
  </div>
)));
jest.mock('./components/SelectItemModal', () => jest.fn(({
  'data-testid': testId,
  onClose,
  onSelectItem,
}) => {
  const selectItem = () => {
    onSelectItem({}, {
      barcode: 'itemBarcode',
    });
  };

  return (
    <div data-testid={testId}>
      <button
        type="button"
        onClick={onClose}
        data-testid={testIds.closeSelectModalButton}
      >
        Close
      </button>
      <button
        type="button"
        onClick={selectItem}
        data-testid={testIds.selectItemButton}
      >
        Select item
      </button>
    </div>
  );
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
  const handleCheckinNotes = () => {
    showCheckinNotes({
      item: {},
    });
  };

  return (
    <div>
      <button
        type="button"
        data-testid={testIds.showNotesButton}
        onClick={handleCheckinNotes}
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

      buildDateTime.mockReturnValue(checkInDate);

      describe('When there is no item information retrieved', () => {
        const items = {
          items: [],
          totalRecords: 0,
        };
        const baseRequest = [
          {
            item: null,
            requester: {
              barcode: 'requesterBarcode',
            },
          }
        ];
        const requestWithComment = [
          {
            ...baseRequest[0],
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
                limit: PAGE_AMOUNT,
                offset: 0,
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
          basicProps.mutator.items.GET.mockReturnValue(items);
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
            basicProps.mutator.requests.GET.mockResolvedValue(requestWithComment);

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
                name: ACCOUNT_STATUS_NAMES.CLOSED,
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
            basicProps.mutator.requests.GET.mockResolvedValue(requestWithComment);

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
          const slipName = 'hold';
          const slipId = 'slipId';
          const requestData = {
            item: {
              status: {
                name: statuses.AWAITING_PICKUP,
              },
            },
          };
          const props = {
            ...basicProps,
            resources: {
              ...basicProps.resources,
              staffSlips: {
                records: [
                  {
                    name: slipName,
                    id: slipId,
                  }
                ],
              },
              servicePoints: {
                records: [
                  {
                    id: basicProps.stripes.user.user.curServicePoint.id,
                    staffSlips: [
                      {
                        id: slipId,
                      }
                    ],
                  }
                ],
              },
            },
          };

          beforeEach(() => {
            getCheckinSettings.mockReturnValue({
              wildcardLookupEnabled: false,
            });
            basicProps.mutator.checkIn.POST.mockResolvedValue(requestData);
          });

          describe('When patron comment exists', () => {
            beforeEach(() => {
              render(
                <Scan
                  {...props}
                />
              );
              basicProps.mutator.requests.GET.mockResolvedValue(requestWithComment);

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

          describe('When patron comment does not exist', () => {
            beforeEach(() => {
              render(
                <Scan
                  {...props}
                />
              );
              basicProps.mutator.requests.GET.mockResolvedValue(baseRequest);

              const submitButton = screen.getByTestId(testIds.submitButton);

              fireEvent.click(submitButton);
            });

            it('should not render hold modal message', async () => {
              await waitFor(() => {
                const holdModalMessage = screen.queryByText(labelIds.holdModalMessage);

                expect(holdModalMessage).not.toBeInTheDocument();
              });
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
                  patronBarcode: baseRequest[0].requester.barcode,
                },
              };

              basicProps.history.push.mockClear();
              fireEvent.click(redirectToCheckoutButton);

              expect(basicProps.history.push).toHaveBeenCalledWith(expectedArgument);
            });
          });
        });
      });

      describe('When information about one item is received', () => {
        const items = {
          items: [
            {
              barcode: 'itemBarcode',
            }
          ],
          totalRecords: 1,
        };

        beforeEach(() => {
          basicProps.mutator.items.GET.mockReturnValue(items);

          render(
            <Scan
              {...basicProps}
            />
          );

          const submitButton = screen.getByTestId(testIds.submitButton);

          fireEvent.click(submitButton);
        });

        it('should render checkin modal manager', async () => {
          await waitFor(() => {
            const checkinModalManager = screen.getByTestId(testIds.checkinModalManager);

            expect(checkinModalManager).toBeInTheDocument();
          });
        });
      });

      describe('When information on multiple items is received', () => {
        const totalRecords = PAGE_AMOUNT + 1;
        const items = {
          items: new Array(totalRecords).fill({}),
          totalRecords,
        };

        beforeEach(() => {
          basicProps.mutator.items.GET
            .mockReturnValueOnce(items)
            .mockReturnValue({
              items: [{}],
            });

          render(
            <Scan
              {...basicProps}
            />
          );

          const submitButton = screen.getByTestId(testIds.submitButton);

          fireEvent.click(submitButton);
        });

        it('should render select item modal', async () => {
          await waitFor(() => {
            const selectItemModal = screen.getByTestId(testIds.selectItemModal);

            expect(selectItemModal).toBeInTheDocument();
          });
        });

        it('should close select item modal', async () => {
          await waitFor(() => {
            const closeSelectModalButton = screen.getByTestId(testIds.closeSelectModalButton);

            fireEvent.click(closeSelectModalButton);

            const selectItemModal = screen.queryByTestId(testIds.selectItemModal);

            expect(selectItemModal).not.toBeInTheDocument();
          });
        });

        it('should render checkin modal manager', async () => {
          await waitFor(() => {
            const selectItemButton = screen.getByTestId(testIds.selectItemButton);

            fireEvent.click(selectItemButton);

            const checkinModalManager = screen.getByTestId(testIds.checkinModalManager);

            expect(checkinModalManager).toBeInTheDocument();
          });
        });
      });
    });

    describe('When there is an error during checkin process', () => {
      const items = {
        items: {},
        totalRecords: 1,
      };
      const itemBarcode = 'itemBarcode';

      beforeEach(() => {
        getCheckinSettings.mockReturnValue({
          wildcardLookupEnabled: true,
        });
        basicProps.mutator.items.GET.mockReturnValue(items);
      });

      describe('When response type is "application/json"', () => {
        describe('When there is no item with provided barcode', () => {
          const error = {
            errors: [
              {
                parameters: [
                  {
                    value: itemBarcode,
                    key: 'key',
                  }
                ],
                message: `No item with barcode ${itemBarcode} exists`,
              }
            ],
          };
          const response = {
            headers: {
              get: () => 'application/json',
            },
            json: jest.fn().mockResolvedValue(error),
          };

          beforeEach(() => {
            render(
              <Scan
                {...basicProps}
              />
            );
            basicProps.mutator.checkIn.POST.mockRejectedValue(response);

            const submitButton = screen.getByTestId(testIds.submitButton);

            fireEvent.click(submitButton);
          });

          it('should render error modal', async () => {
            await waitFor(() => {
              const errorModal = screen.getByTestId(testIds.errorModal);

              expect(errorModal).toBeInTheDocument();
            });
          });

          it('should render no item found label', async () => {
            await waitFor(() => {
              const itemNotFoundLabel = screen.getByText(labelIds.itemNotFoundLabel);

              expect(itemNotFoundLabel).toBeInTheDocument();
            });
          });

          it('should render no item found error message', async () => {
            await waitFor(() => {
              const noItemFoundMessage = screen.getByText(labelIds.noItemFoundMessage);

              expect(noItemFoundMessage).toBeInTheDocument();
            });
          });

          it('should close error modal', async () => {
            await waitFor(() => {
              const closeErrorModalButton = screen.getByText(labelIds.closeErrorModalButton);

              fireEvent.click(closeErrorModalButton);

              const errorModal = screen.queryByTestId(testIds.errorModal);

              expect(errorModal).not.toBeInTheDocument();
            });
          });
        });

        describe('When there is unknown error', () => {
          const error = {};
          const response = {
            json: jest.fn().mockResolvedValue(error),
            headers: {
              get: () => 'application/json',
            }
          };

          beforeEach(() => {
            render(
              <Scan
                {...basicProps}
              />
            );
            basicProps.mutator.checkIn.POST.mockRejectedValue(response);

            const submitButton = screen.getByTestId(testIds.submitButton);

            fireEvent.click(submitButton);
          });

          it('should render not checked in label', async () => {
            await waitFor(() => {
              const itemNotCheckedInLabel = screen.getByText(labelIds.itemNotCheckedInLabel);

              expect(itemNotCheckedInLabel).toBeInTheDocument();
            });
          });

          it('should render unhandled error message', async () => {
            await waitFor(() => {
              const unhandledErrorMessage = screen.getByText(labelIds.unhandledErrorMessage, {
                exact: false,
              });

              expect(unhandledErrorMessage).toBeInTheDocument();
            });
          });
        });
      });

      describe('When response type is not set', () => {
        const error = 'Error message';
        const response = {
          headers: {
            get: () => '',
          },
          text: jest.fn().mockResolvedValue(error),
        };

        beforeEach(() => {
          basicProps.mutator.checkIn.POST.mockRejectedValue(response);
          render(
            <Scan
              {...basicProps}
            />
          );

          const submitButton = screen.getByTestId(testIds.submitButton);

          fireEvent.click(submitButton);
        });

        it('should render error modal', async () => {
          await waitFor(() => {
            const errorModal = screen.getByTestId(testIds.errorModal);

            expect(errorModal).toBeInTheDocument();
          });
        });

        it('should render unhandled error message', async () => {
          await waitFor(() => {
            const unhandledErrorMessage = screen.getByText(labelIds.unhandledErrorMessage, {
              exact: false,
            });

            expect(unhandledErrorMessage).toBeInTheDocument();
          });
        });

        it('should render not checked in label', async () => {
          await waitFor(() => {
            const itemNotCheckedInLabel = screen.getByText(labelIds.itemNotCheckedInLabel);

            expect(itemNotCheckedInLabel).toBeInTheDocument();
          });
        });
      });
    });
  });

  describe('Pre checkin modal', () => {
    beforeEach(() => {
      render(
        <Scan
          {...basicProps}
        />
      );

      const showNotesButton = screen.getByTestId(testIds.showNotesButton);

      fireEvent.click(showNotesButton);
    });

    it('should render checkin modal manager', () => {
      const checkinModalManager = screen.getByTestId(testIds.checkinModalManager);

      expect(checkinModalManager).toBeInTheDocument();
    });

    it('should hide checkin modal manager', async () => {
      const cancelModalManagerButton = screen.getByTestId(testIds.cancelModalManagerButton);

      fireEvent.click(cancelModalManagerButton);

      await waitFor(() => {
        const checkinModalManager = screen.queryByTestId(testIds.checkinModalManager);

        expect(checkinModalManager).not.toBeInTheDocument();
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
