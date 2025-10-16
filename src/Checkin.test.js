import createInactivityTimer from 'inactivity-timer';
import {
  fireEvent,
  render,
  screen,
  waitFor,
} from '@folio/jest-config-stripes/testing-library/react';

import CheckedInListItems from './components/CheckedInListItems';
import {
  getCheckinSettings,
  isDCBItem,
} from './util';
import {
  DCB_HOLDINGS_RECORD_ID,
  DCB_INSTANCE_ID,
} from './consts';
import CheckIn from './CheckIn';

const patronGroupId = 'patronGroupId';
const groupName = 'group';
const readyPrefix = 'readyPrefix';
const basicProps = {
  stripes: {},
  scannedItems: [],
  form: {
    getState: () => ({}),
    change: jest.fn(),
  },
  checkinFormRef: {
    current: null,
  },
  barcodeRef: {
    current: {
      focus: jest.fn(),
    },
  },
  resources: {
    checkinSettings: {
      records: [{}],
    },
    scannedItems: [],
    patronGroups: {
      records: [
        {
          id: patronGroupId,
          group: groupName,
        }
      ],
    },
  },
  mutator: {
    query: {
      update: jest.fn(),
    },
    users: {
      GET: jest.fn().mockResolvedValue([
        {
          patronGroup: patronGroupId,
        }
      ])
    },
  },
  onSessionEnd: jest.fn(),
  handleSubmit: jest.fn(),
  showCheckinNotes: jest.fn(),
  loading: false,
  pristine: true,
};
const labelIds = {
  scannedItemsTitle: 'ui-checkin.scannedItems',
  scanBarcodePlaceholder: 'ui-checkin.scanBarcode',
  enterButton: 'ui-checkin.enter',
  printHoldSlipButton: 'ui-checkin.action.printHoldSlip',
  printTransitSlipButton: 'ui-checkin.action.printTransitSlip',
  loanDetailsButton: 'ui-checkin.loanDetails',
  patronDetailsButton: 'ui-checkin.patronDetails',
  itemDetailsButton: 'ui-checkin.itemDetails',
  requestDetailsButton: 'ui-checkin.requestDetails',
  newFeeFineButton: 'ui-checkin.newFeeFine',
  checkinNotesButton: 'ui-checkin.checkinNotes',
};
const testIds = {
  showPickersButton: 'showPickersButton',
  endSessionButton: 'endSessionButton',
  actionMenuTrigger: 'actionMenuTrigger',
  itemBarcodeInput: 'itemBarcodeInput',
};
const userActivityEvents = ['keydown', 'mousedown'];

jest.mock('moment-timezone', () => jest.fn(() => ({
  tz: () => ({
    format: jest.fn(),
  }),
})));
jest.mock('inactivity-timer', () => jest.fn());
jest.mock('./components/PrintButton', () => jest.fn(({ children }) => (
  <button type="button">
    {children}
  </button>
)));
jest.mock('./components/FeeFineDetailsButton', () => jest.fn(() => <div />));
jest.mock('./components/CheckinDateTime', () => jest.fn(({ onClick }) => (
  <>
    <button
      type="button"
      data-testid={testIds.showPickersButton}
      onClick={onClick}
    >
      Show Pickers
    </button>
  </>
)));
jest.mock('./components/CheckedInListItems', () => jest.fn(() => <div />));
jest.mock('./components/CheckInFooter', () => jest.fn(({ handleSessionEnd }) => (
  <>
    <button
      type="button"
      data-testid={testIds.endSessionButton}
      onClick={handleSessionEnd}
    >
      End session
    </button>
  </>
)));
jest.mock('./util', () => ({
  convertToSlipData: jest.fn(),
  getCheckinSettings: jest.fn(),
  isDCBItem: jest.fn(() => false)
}));
jest.useFakeTimers();

describe('CheckIn', () => {
  const removeEventListener = jest.fn((event, cb) => cb());
  const clear = jest.fn();
  createInactivityTimer.mockImplementation((time, cb) => {
    setTimeout(cb, time);

    return {
      clear,
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  beforeEach(() => {
    jest.spyOn(document, 'getElementById').mockReturnValue({
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    });
    jest.spyOn(document, 'removeEventListener').mockImplementation(removeEventListener);
  });

  describe('Initial render', () => {
    describe('When there are no errors', () => {
      beforeEach(() => {
        render(
          <CheckIn
            {...basicProps}
          />
        );
      });

      it('should render scanned items title', () => {
        const scannedItems = screen.getByText(labelIds.scannedItemsTitle);

        expect(scannedItems).toBeInTheDocument();
      });

      it('should render scan barcode placeholder', () => {
        const scanBarcodePlaceholder = screen.getByPlaceholderText(labelIds.scanBarcodePlaceholder);

        expect(scanBarcodePlaceholder).toBeInTheDocument();
      });

      it('should render enter button label', () => {
        const enterButton = screen.getByText(labelIds.enterButton);

        expect(enterButton).toBeInTheDocument();
      });

      it('should render disabled submit button', () => {
        const enterButton = screen.getByText(labelIds.enterButton);

        expect(enterButton).toBeDisabled();
      });

      it('should trigger form change twice after clicking on show pickers button', () => {
        const showPickersButton = screen.getByTestId(testIds.showPickersButton);

        fireEvent.click(showPickersButton);

        expect(basicProps.form.change).toHaveBeenCalledTimes(2);
      });
    });

    describe('When there is submit error', () => {
      const error = 'checkin error';
      const props = {
        ...basicProps,
        form: {
          getState: () => ({
            hasSubmitErrors: true,
            submitErrors: {
              checkin: error,
            },
          }),
        },
      };

      beforeEach(() => {
        render(
          <CheckIn
            {...props}
          />
        );
      });

      it('should render checkin error', () => {
        const checkinError = screen.getByText(error);

        expect(checkinError).toBeInTheDocument();
      });
    });

    describe('Submit handling', () => {
      const props = {
        ...basicProps,
        pristine: false,
      };

      beforeEach(() => {
        render(
          <CheckIn
            {...props}
          />
        );
      });

      it('should trigger handleSubmit', () => {
        const submitButton = screen.getByText(labelIds.enterButton);

        fireEvent.click(submitButton);

        expect(props.handleSubmit).toHaveBeenCalled();
      });
    });

    describe('Session end handling', () => {
      beforeEach(() => {
        render(
          <CheckIn
            {...basicProps}
          />
        );

        const endSessionButton = screen.getByTestId(testIds.endSessionButton);

        fireEvent.click(endSessionButton);
      });

      it('should remove listeners for keydown and mousedown events', () => {
        userActivityEvents.forEach((event) => {
          expect(removeEventListener).toHaveBeenCalledWith(event, expect.any(Function));
        });
      });

      it('should trigger onSessionEnd', async () => {
        await waitFor(() => {
          expect(basicProps.onSessionEnd).toHaveBeenCalled();
        });
      });

      it('should focus on barcode field', () => {
        expect(basicProps.barcodeRef.current.focus).toHaveBeenCalled();
      });
    });
  });

  describe('Updating', () => {
    const checkoutTimeoutDuration = 2;
    const newProps = {
      ...basicProps,
      resources: {
        ...basicProps.resources,
        scannedItems: [{}],
      },
    };

    getCheckinSettings.mockReturnValue({
      checkoutTimeout: true,
      checkoutTimeoutDuration,
    });

    describe('When location pathname equals "/"', () => {
      let wrapper;

      beforeEach(() => {
        Object.defineProperty(window, 'location', {
          value: {
            pathname: '/',
          }
        });

        wrapper = render(
          <CheckIn
            {...basicProps}
          />
        );

        wrapper.rerender(
          <CheckIn
            {...newProps}
          />
        );
        jest.runAllTimers();
      });

      it('should clear inactivity timer', () => {
        expect(clear).toHaveBeenCalled();
      });

      it('should trigger createInactivityTimer with correct arguments', () => {
        const expectedArgs = [`${checkoutTimeoutDuration}m`, expect.any(Function)];

        expect(createInactivityTimer).toHaveBeenCalledWith(...expectedArgs);
      });

      it('should remove listeners for keydown and mousedown events', () => {
        userActivityEvents.forEach((event) => {
          expect(removeEventListener).toHaveBeenCalledWith(event, expect.any(Function));
        });
      });

      it('should not trigger onSessionEnd', () => {
        expect(newProps.onSessionEnd).not.toHaveBeenCalled();
      });

      it('should not trigger createInactivityTimer if checking settings records are empty', () => {
        const props = {
          ...basicProps,
          resources: {
            ...basicProps.resources,
            checkinSettings: {
              records: [],
            },
            scannedItems: [{}],
          },
        };

        createInactivityTimer.mockClear();
        wrapper.rerender(
          <CheckIn
            {...props}
          />
        );

        expect(createInactivityTimer).not.toHaveBeenCalled();
      });

      it('should not trigger createInactivityTimer if checkout timeout is false', () => {
        const props = {
          ...basicProps,
          resources: {
            ...basicProps.resources,
            scannedItems: [{}],
          },
        };

        getCheckinSettings.mockReturnValueOnce({
          checkoutTimeout: false,
        });
        createInactivityTimer.mockClear();
        wrapper.rerender(
          <CheckIn
            {...props}
          />
        );

        expect(createInactivityTimer).not.toHaveBeenCalled();
      });
    });

    describe('When location pathname is not equal "/"', () => {
      beforeEach(() => {
        Object.defineProperty(window, 'location', {
          value: {
            pathname: '/test',
          }
        });

        const { rerender } = render(
          <CheckIn
            {...basicProps}
          />
        );

        rerender(
          <CheckIn
            {...newProps}
          />
        );
        jest.runAllTimers();
      });

      it('should trigger onSessionEnd', () => {
        expect(newProps.onSessionEnd).toHaveBeenCalled();
      });
    });
  });

  describe('Action menu', () => {
    describe('When there is a loan on regular item', () => {
      const loan = {
        item: {
          circulationNotes: [
            {
              noteType: 'Check in',
            }
          ],
          instanceId: 'instanceId',
          holdingsRecordId: 'holdingsRecordId',
          id: 'itemId',
        },
        nextRequest: {},
        transitItem: {},
        userId: 'userId',
        id: 'loanId',
        staffSlipContext: {
          request: {
            requestID: 'requestId',
          },
        },
      };

      beforeEach(() => {
        CheckedInListItems.mockImplementation(({ renderActions }) => (
          <>
            {renderActions(loan)}
          </>
        ));

        render(
          <CheckIn
            {...basicProps}
          />
        );
      });

      it('should render print hold slip button label', () => {
        const printHoldSlipButton = screen.getByText(labelIds.printHoldSlipButton);

        expect(printHoldSlipButton).toBeInTheDocument();
      });

      it('should render print transit slip button label', () => {
        const printTransitSlipButton = screen.getByText(labelIds.printTransitSlipButton);

        expect(printTransitSlipButton).toBeInTheDocument();
      });

      it('should render loan details button label', () => {
        const loanDetailsButton = screen.getByText(labelIds.loanDetailsButton);

        expect(loanDetailsButton).toBeInTheDocument();
      });

      it('should render patron details button label', () => {
        const patronDetailsButton = screen.getByText(labelIds.patronDetailsButton);

        expect(patronDetailsButton).toBeInTheDocument();
      });

      it('should render item details button label', () => {
        const itemDetailsButton = screen.getByText(labelIds.itemDetailsButton);

        expect(itemDetailsButton).toBeInTheDocument();
      });

      it('should render request details button label', () => {
        const requestDetailsButton = screen.getByText(labelIds.requestDetailsButton);

        expect(requestDetailsButton).toBeInTheDocument();
      });

      it('should render new fee fine button label', () => {
        const newFeeFineButton = screen.getByText(labelIds.newFeeFineButton);

        expect(newFeeFineButton).toBeInTheDocument();
      });

      it('should render checkin notes button label', () => {
        const checkinNotesButton = screen.getByText(labelIds.checkinNotesButton);

        expect(checkinNotesButton).toBeInTheDocument();
      });

      it('should set correct href to loan details button', () => {
        const loanDetailsButton = screen.getByText(labelIds.loanDetailsButton);

        expect(loanDetailsButton).toHaveAttribute('href', `/users/view/${loan.userId}?layer=loan&loan=${loan.id}`);
      });

      it('should set correct href to patron details button', () => {
        const patronDetailsButton = screen.getByText(labelIds.patronDetailsButton);

        expect(patronDetailsButton).toHaveAttribute('href', `/users/view/${loan.userId}`);
      });

      it('should set correct href to item details button', () => {
        const itemDetailsButton = screen.getByText(labelIds.itemDetailsButton);

        expect(itemDetailsButton).toHaveAttribute('href', `/inventory/view/${loan.item.instanceId}/${loan.item.holdingsRecordId}/${loan.item.id}`);
      });

      it('should set correct href to request details button', () => {
        const requestDetailsButton = screen.getByText(labelIds.requestDetailsButton);

        expect(requestDetailsButton).toHaveAttribute('href', `/requests/view/${loan.staffSlipContext.request.requestID}`);
      });

      it('should set correct href to new fee fine button', () => {
        const newFeeFineButton = screen.getByText(labelIds.newFeeFineButton);

        expect(newFeeFineButton).toHaveAttribute('href', `/users/view/${loan.userId}`);
      });

      it('should update query pass after clicking on loan details button', () => {
        const loanDetailsButton = screen.getByText(labelIds.loanDetailsButton);

        fireEvent.click(loanDetailsButton);

        expect(basicProps.mutator.query.update).toHaveBeenCalledWith({
          _path: `/users/view/${loan.userId}?layer=loan&loan=${loan.id}`,
        });
      });

      it('should update query pass after clicking on patron details button', () => {
        const patronDetailsButton = screen.getByText(labelIds.patronDetailsButton);

        fireEvent.click(patronDetailsButton);

        expect(basicProps.mutator.query.update).toHaveBeenCalledWith({
          _path: `/users/view/${loan.userId}`,
        });
      });

      it('should update query pass after clicking on item details button', () => {
        const itemDetailsButton = screen.getByText(labelIds.itemDetailsButton);

        fireEvent.click(itemDetailsButton);

        expect(basicProps.mutator.query.update).toHaveBeenCalledWith({
          _path: `/inventory/view/${loan.item.instanceId}/${loan.item.holdingsRecordId}/${loan.item.id}`,
        });
      });

      it('should update query pass after clicking on request details button', () => {
        const requestDetailsButton = screen.getByText(labelIds.requestDetailsButton);

        fireEvent.click(requestDetailsButton);

        expect(basicProps.mutator.query.update).toHaveBeenCalledWith({
          _path: `/requests/view/${loan.staffSlipContext.request.requestID}`,
        });
      });

      it('should trigger get request to receive user information', () => {
        const newFeeFineButton = screen.getByText(labelIds.newFeeFineButton);

        fireEvent.click(newFeeFineButton);

        expect(basicProps.mutator.users.GET).toHaveBeenCalledWith({
          params: {
            query: `id=${loan.userId}`,
          },
        });
      });

      it('should update query pass after clicking on new fee fine button', async () => {
        const newFeeFineButton = screen.getByText(labelIds.newFeeFineButton);

        fireEvent.click(newFeeFineButton);

        await waitFor(() => {
          expect(basicProps.mutator.query.update).toHaveBeenCalledWith({
            _path: `/users/view/${loan.userId}?filters=pg.${groupName}&layer=charge&loan=${loan.id}`,
          });
        });
      });

      it('should show checkin notes after clicking on checkin notes button', () => {
        const checkinNotesButton = screen.getByText(labelIds.checkinNotesButton);

        fireEvent.click(checkinNotesButton);

        expect(basicProps.showCheckinNotes).toHaveBeenCalledWith(loan);
      });

      it('should render action menu trigger', () => {
        const actionMenuTrigger = screen.getByTestId(testIds.actionMenuTrigger);

        expect(actionMenuTrigger).toBeInTheDocument();
      });
    });

    describe('When there is a loan on DCB item', () => {
      const loan = {
        item: {
          circulationNotes: [],
          instanceId: DCB_INSTANCE_ID,
          holdingsRecordId: DCB_HOLDINGS_RECORD_ID,
          id: 'itemId',
        },
        id: 'loanId',
        staffSlipContext: {
          request: {},
        },
      };
      const props = {
        ...basicProps,
        scannedItems: [
          {
            item: {},
          }
        ]
      };

      beforeEach(() => {
        isDCBItem.mockReturnValue(true);
        CheckedInListItems.mockImplementation(({ renderActions }) => (
          <>
            {renderActions(loan)}
          </>
        ));

        render(
          <CheckIn
            {...props}
          />
        );
      });

      it('should not render print hold slip button', () => {
        const printHoldSlipButton = screen.queryByText(labelIds.printHoldSlipButton);

        expect(printHoldSlipButton).not.toBeInTheDocument();
      });

      it('should not render print transit slip button', () => {
        const printTransitSlipButton = screen.queryByText(labelIds.printTransitSlipButton);

        expect(printTransitSlipButton).not.toBeInTheDocument();
      });

      it('should not render loan details button', () => {
        const loanDetailsButton = screen.queryByText(labelIds.loanDetailsButton);

        expect(loanDetailsButton).not.toBeInTheDocument();
      });

      it('should not render patron details button', () => {
        const patronDetailsButton = screen.queryByText(labelIds.patronDetailsButton);

        expect(patronDetailsButton).not.toBeInTheDocument();
      });

      it('should not render item details button', () => {
        const itemDetailsButton = screen.queryByText(labelIds.itemDetailsButton);

        expect(itemDetailsButton).not.toBeInTheDocument();
      });

      it('should not render request details button', () => {
        const requestDetailsButton = screen.queryByText(labelIds.requestDetailsButton);

        expect(requestDetailsButton).not.toBeInTheDocument();
      });

      it('should not render new fee fine button', () => {
        const newFeeFineButton = screen.queryByText(labelIds.newFeeFineButton);

        expect(newFeeFineButton).not.toBeInTheDocument();
      });

      it('should not render checkin notes button', () => {
        const checkinNotesButton = screen.queryByText(labelIds.checkinNotesButton);

        expect(checkinNotesButton).not.toBeInTheDocument();
      });
    });
  });

  describe('TitleManager', () => {
    const props = {
      ...basicProps,
      modules: {
        app: [
          {
            module: '@folio/checkin',
            readyPrefix,
          }
        ],
      },
    };

    beforeEach(() => {
      render(
        <CheckIn
          {...props}
        />
      );
    });

    it('should render title manager prefix', () => {
      const itemBarcodeInput = screen.getByTestId(testIds.itemBarcodeInput);

      fireEvent.focus(itemBarcodeInput);

      const titlePrefix = screen.getByText(readyPrefix);

      expect(titlePrefix).toBeInTheDocument();
    });
  });
});
