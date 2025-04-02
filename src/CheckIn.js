import React from 'react';
import PropTypes from 'prop-types';
import { Field } from 'react-final-form';
import {
  FormattedMessage,
  injectIntl,
} from 'react-intl';
import createInactivityTimer from 'inactivity-timer';
import {
  get,
  isEmpty,
} from 'lodash';

import {
  IfPermission,
  TitleManager,
  withModules,
} from '@folio/stripes/core';
import {
  Paneset,
  Pane,
  Button,
  TextField,
  IconButton,
  Layout,
  Row,
  Col,
  DropdownMenu,
  Dropdown,
  dayjs,
} from '@folio/stripes/components';
import {
  convertToSlipData,
} from '@folio/stripes/util';
import stripesFinalForm from '@folio/stripes/final-form';

import PrintButton from './components/PrintButton';
import FeeFineDetailsButton from './components/FeeFineDetailsButton';
import CheckinDateTime from './components/CheckinDateTime';
import CheckedInListItems from './components/CheckedInListItems';
import CheckInFooter from './components/CheckInFooter';
import {
  getCheckinSettings,
  isDcbUser,
  isDCBItem,
} from './util';

import {
  STAFF_SLIP_TYPES,
} from './consts';

import styles from './checkin.css';

class CheckIn extends React.Component {
  static propTypes = {
    stripes: PropTypes.object.isRequired,
    intl: PropTypes.object,
    scannedItems: PropTypes.arrayOf(PropTypes.object),
    showCheckinNotes: PropTypes.func,
    handleSubmit: PropTypes.func.isRequired,
    pristine: PropTypes.bool,
    submithandler: PropTypes.func,
    barcodeRef: PropTypes.shape({
      current: PropTypes.instanceOf(Element),
    }),
    checkinFormRef: PropTypes.object,
    onSessionEnd: PropTypes.func,
    resources: PropTypes.shape({
      checkinSettings: PropTypes.shape({
        records: PropTypes.arrayOf(PropTypes.object),
      }),
      scannedItems: PropTypes.arrayOf(PropTypes.object),
      staffSlips: PropTypes.shape({
        records: PropTypes.arrayOf(PropTypes.object),
      }),
    }),
    modules: PropTypes.shape({
      app: PropTypes.arrayOf(PropTypes.object),
    }),
    mutator: PropTypes.shape({
      users: PropTypes.shape({
        GET: PropTypes.func,
      }),
    }).isRequired,
    loading: PropTypes.bool.isRequired,
    form: PropTypes.object.isRequired,
    history: PropTypes.shape({
      push: PropTypes.func.isRequired,
    }).isRequired,
  };

  constructor(props) {
    super(props);
    this.renderActions = this.renderActions.bind(this);
    this.handleOptionsChange = this.handleOptionsChange.bind(this);
    this.showPickers = this.showPickers.bind(this);
    this.readyPrefix = props.modules?.app?.find(el => el.module === '@folio/checkin')?.readyPrefix;

    this.state = {
      showPickers: false,
      hasEventListener: false,
    };
  }

  componentDidMount() {
    this.props.checkinFormRef.current = this.props.form;
    this.setupEventListeners();
  }

  componentDidUpdate() {
    const {
      resources: {
        checkinSettings,
        checkinSettings: {
          records: checkinSettingsRecords,
        },
        scannedItems,
      },
      onSessionEnd,
    } = this.props;

    if (!this.state.hasEventListener) {
      this.setupEventListeners();
    }

    if (window.checkInSessionEndTimer) {
      return;
    }

    if (!checkinSettings || isEmpty(checkinSettingsRecords)) {
      return;
    }

    const parsed = getCheckinSettings(checkinSettingsRecords);

    if (!parsed.checkoutTimeout) {
      return;
    }

    if (scannedItems.length) {
      window.checkInSessionEndTimer = createInactivityTimer(`${parsed.checkoutTimeoutDuration}m`, () => {
        this.clearTimer();
        this.removeUserActivityListeners();

        if (window.location.pathname !== '/') {
          onSessionEnd();
        }
      });

      ['keydown', 'mousedown'].forEach((event) => {
        document.addEventListener(event, this.listenUserActivities);
      });
    }
  }

  componentWillUnmount() {
    this.removeEventListeners();
  }

  setupEventListeners = () => {
    const container = document.getElementById('ModuleMainHeading');

    if (container) {
      this.setState({ hasEventListener: true });
      container.addEventListener('click', this.focusInput);
    }
  }

  clearTimer = () => {
    if (window.checkInSessionEndTimer) {
      window.checkInSessionEndTimer.clear();
      window.checkInSessionEndTimer = null;
    }
  }

  listenUserActivities = () => {
    if (window.checkInSessionEndTimer) {
      window.checkInSessionEndTimer.signal();
    }
  }

  removeUserActivityListeners = () => {
    ['keydown', 'mousedown'].forEach((event) => {
      document.removeEventListener(event, this.listenUserActivities);
    });
  }

  removeEventListeners = () => {
    document.getElementById('ModuleMainHeading').removeEventListener('click', this.focusInput);
  }

  focusInput = () => {
    this.props.barcodeRef.current.focus();
  }

  handleSessionEnd = async () => {
    const {
      onSessionEnd,
    } = this.props;

    this.clearTimer();
    this.removeUserActivityListeners();
    this.setState({ showPickers: false });
    await onSessionEnd();

    this.focusInput();
  }

  showPickers = () => {
    const {
      form: {
        change,
      },
      intl: {
        formatTime,
        timeZone,
      },
    } = this.props;
    const now = dayjs().tz(timeZone);
    const formattedDate = now.format('YYYY-MM-DD');
    const formattedTime = formatTime(now);

    change('item.checkinDate', formattedDate);
    change('item.checkinTime', formattedTime);

    this.setState({ showPickers: true });
  }

  handleOptionsChange(itemMeta, e) {
    e.preventDefault();
    e.stopPropagation();

    const { loan, action } = itemMeta;
    if (action && this[action]) {
      this[action](loan);
    }
  }

  showLoanDetails(loan) {
    this.props.history.push(`/users/view/${loan.userId}?layer=loan&loan=${loan.id}`);
  }

  showCheckinNotes(loan) {
    this.props.showCheckinNotes(loan);
  }

  showPatronDetails(loan) {
    this.props.history.push(`/users/view/${loan.userId}`);
  }

  showRequestDetails(loan) {
    const {
      staffSlipContext: {
        request: {
          requestID,
        },
      },
    } = loan;

    this.props.history.push(`/requests/view/${requestID}`);
  }

  showItemDetails(loan) {
    const {
      item: {
        instanceId,
        holdingsRecordId,
        id,
      },
    } = loan;
    const path = `/inventory/view/${instanceId}/${holdingsRecordId}/${id}`;

    this.props.history.push(path);
  }

  async newFeeFine(loan) {
    const {
      resources,
      mutator,
    } = this.props;
    const query = `id=${loan.userId}`;
    const patronGroups = get(resources, ['patronGroups', 'records'], []);
    const users = await mutator.users.GET({ params: { query } });
    const patron = get(users, [0, 'patronGroup'], '');
    const pg = (patronGroups.find(p => p.id === patron) || {}).group;
    const path = `/users/view/${loan.userId}?filters=pg.${pg}&layer=charge&loan=${loan.id}`;

    this.props.history.push(path);
  }

  getTemplate(type) {
    const {
      resources,
    } = this.props;
    const staffSlips = (resources.staffSlips || {}).records || [];
    const staffSlip = staffSlips.find(slip => slip.name.toLowerCase() === type);

    return get(staffSlip, ['template'], '');
  }

  renderActions(loan) {
    const {
      intl,
      stripes: {
        timezone,
        locale,
      },
      scannedItems,
    } = this.props;

    const isCheckInNote = element => element.noteType === 'Check in';
    const checkinNotePresent = get(loan.item, ['circulationNotes'], []).some(isCheckInNote);
    const loanOpenRequest = loan?.staffSlipContext?.request ?? {};
    const isVirtualUser = isDcbUser(loan?.borrower);
    const isVirtualItem = isDCBItem(get(scannedItems, [0, 'item']));

    const trigger = ({ getTriggerProps, triggerRef }) => (
      <IconButton
        {...getTriggerProps()}
        data-testid="actionMenuTrigger"
        icon="ellipsis"
        size="medium"
        aria-label={intl.formatMessage({ id: 'ui-checkin.actionsMenu' })}
        id={`available-actions-button-${loan.rowIndex}`}
        ref={triggerRef}
      />
    );

    const menu = ({ onToggle }) => {
      return (
        <DropdownMenu
          role="menu"
          aria-label="available actions"
          onToggle={onToggle}
        >
          {loan.nextRequest &&
            <PrintButton
              role="menuitem"
              data-test-print-hold-slip
              buttonStyle="dropdownItem"
              template={this.getTemplate('hold')}
              dataSource={convertToSlipData([loan.staffSlipContext], intl, timezone, locale)}
            >
              <FormattedMessage id="ui-checkin.action.printHoldSlip" />
            </PrintButton>}
          {loan.transitItem &&
            <PrintButton
              role="menuitem"
              data-test-print-transit-slip
              buttonStyle="dropdownItem"
              template={this.getTemplate('transit')}
              dataSource={convertToSlipData([loan.staffSlipContext], intl, timezone, locale, {
                slipName: STAFF_SLIP_TYPES.TRANSIT,
              })}
            >
              <FormattedMessage id="ui-checkin.action.printTransitSlip" />
            </PrintButton>}
          {loan.userId &&
            <div data-test-loan-details>
              <Button
                role="menuitem"
                buttonStyle="dropdownItem"
                href={`/users/view/${loan.userId}?layer=loan&loan=${loan.id}`}
                onClick={(e) => this.handleOptionsChange({ loan, action: 'showLoanDetails' }, e)}
              >
                <FormattedMessage id="ui-checkin.loanDetails" />
              </Button>
            </div>}
          {loan.userId &&
            <div data-test-patron-details>
              <Button
                role="menuitem"
                buttonStyle="dropdownItem"
                href={`/users/view/${loan.userId}`}
                onClick={(e) => this.handleOptionsChange({ loan, action: 'showPatronDetails' }, e)}
              >
                <FormattedMessage id="ui-checkin.patronDetails" />
              </Button>
            </div>}
          <div data-test-item-details>
            {
            !isVirtualItem && (
              <Button
                role="menuitem"
                buttonStyle="dropdownItem"
                href={`/inventory/view/${loan.item.instanceId}/${loan.item.holdingsRecordId}/${loan.item.id}`}
                onClick={(e) => this.handleOptionsChange({ loan, action: 'showItemDetails' }, e)}
              >
                <FormattedMessage id="ui-checkin.itemDetails" />
              </Button>
            )
          }
          </div>
          {!isEmpty(loanOpenRequest) &&
            <div data-test-request-details>
              <Button
                role="menuitem"
                buttonStyle="dropdownItem"
                href={`/requests/view/${loanOpenRequest.requestID}`}
                onClick={(e) => this.handleOptionsChange({ loan, action: 'showRequestDetails' }, e)}
              >
                <FormattedMessage id="ui-checkin.requestDetails" />
              </Button>
            </div>
          }
          <IfPermission perm="accounts.collection.get">
            <FeeFineDetailsButton
              isVirtualUser={isVirtualUser}
              userId={loan.userId}
              itemId={loan.itemId}
              mutator={this.props.mutator}
              history={this.props.history}
            />
          </IfPermission>
          {loan.userId && !isVirtualUser &&
            <Button
              role="menuitem"
              buttonStyle="dropdownItem"
              href={`/users/view/${loan.userId}`}
              onClick={(e) => this.handleOptionsChange({ loan, action: 'newFeeFine' }, e)}
            >
              <FormattedMessage id="ui-checkin.newFeeFine" />
            </Button>}
          {checkinNotePresent &&
            <div data-test-checkin-notes>
              <Button
                role="menuitem"
                buttonStyle="dropdownItem"
                onClick={(e) => this.handleOptionsChange({ loan, action: 'showCheckinNotes' }, e)}
              >
                <FormattedMessage id="ui-checkin.checkinNotes" />
              </Button>
            </div>}
        </DropdownMenu>
      );
    };

    return (
      <div data-test-elipse-select>
        <Dropdown
          renderTrigger={trigger}
          renderMenu={menu}
        />
      </div>
    );
  }

  render() {
    const containerStyle = {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      height: '100%',
      width: '100%',
      position: 'absolute',
    };

    const {
      handleSubmit,
      intl: {
        formatMessage,
      },
      form,
      scannedItems,
      pristine,
      barcodeRef,
      loading,
    } = this.props;

    const {
      hasSubmitErrors = false,
      submitErrors = {},
    } = form.getState();
    const {
      showPickers,
    } = this.state;

    const scanBarcodeMsg = formatMessage({ id: 'ui-checkin.scanBarcode' });
    const itemIdLabel = formatMessage({ id: 'ui-checkin.itemId' });
    const scannedItemsLabel = formatMessage({ id: 'ui-checkin.scannedItems' });

    return (
      <form onSubmit={handleSubmit}>
        <div style={containerStyle}>
          <Paneset static>
            <Pane
              id="check-in"
              paneTitle={scannedItemsLabel}
              defaultWidth="100%"
            >
              <Row>
                <Col xs={9} sm={4}>
                  <Layout className="marginTopLabelSpacer">
                    <TitleManager prefix={(this.readyPrefix && this.state.readyToScan) ? this.readyPrefix : undefined}>
                      <Field
                        autoFocus
                        data-testid="itemBarcodeInput"
                        id="input-item-barcode"
                        name="item.barcode"
                        validationEnabled={false}
                        placeholder={scanBarcodeMsg}
                        ariaLabel={itemIdLabel}
                        inputRef={barcodeRef}
                        onFocus={this.readyPrefix ? () => this.setState({ readyToScan: true }) : undefined}
                        onBlur={this.readyPrefix ? () => this.setState({ readyToScan: false }) : undefined}
                        fullWidth
                        component={TextField}
                        data-test-check-in-barcode
                      />
                    </TitleManager>
                    {hasSubmitErrors && <span className={styles.error}>{submitErrors.checkin}</span>}
                  </Layout>
                </Col>
                <Col xs={3} sm={1}>
                  <Layout className="marginTopLabelSpacer">
                    <Button
                      id="clickable-add-item"
                      fullWidth
                      type="submit"
                      disabled={pristine}
                    >
                      <FormattedMessage id="ui-checkin.enter" />
                    </Button>
                  </Layout>
                </Col>
                <CheckinDateTime
                  showPickers={showPickers}
                  onClick={this.showPickers}
                />
              </Row>
              <CheckedInListItems
                loading={loading}
                scannedItems={scannedItems}
                mutator={this.props.mutator}
                renderActions={this.renderActions}
              />
            </Pane>
          </Paneset>
          <CheckInFooter handleSessionEnd={this.handleSessionEnd} />
        </div>
      </form>
    );
  }
}

export default stripesFinalForm({
  navigationCheck: true,
})(injectIntl(withModules(CheckIn)));
