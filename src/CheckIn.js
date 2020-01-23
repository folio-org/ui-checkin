import {
  get,
  compact,
} from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import { Field, reduxForm } from 'redux-form';
import {
  FormattedMessage,
  FormattedTime,
  injectIntl,
  intlShape
} from 'react-intl';
import moment from 'moment-timezone';
import {
  Paneset,
  Pane,
  Button,
  MultiColumnList,
  TextField,
  Datepicker,
  Timepicker,
  IconButton,
  Layout,
  Row,
  Col,
  Icon,
  InfoPopover,
  KeyValue,
  DropdownMenu,
  Tooltip,
  Dropdown,
} from '@folio/stripes/components';

import PrintButton from './components/PrintButton';
import { convertToSlipData } from './util';
import styles from './checkin.css';

class CheckIn extends React.Component {
  static propTypes = {
    stripes: PropTypes.object.isRequired,
    intl: intlShape.isRequired,
    scannedItems: PropTypes.arrayOf(PropTypes.object),
    showCheckinNotes: PropTypes.func,
    handleSubmit: PropTypes.func.isRequired,
    pristine: PropTypes.bool,
    submithandler: PropTypes.func,
    barcodeRef: PropTypes.shape({
      current: PropTypes.instanceOf(Element)
    }),
    onSessionEnd: PropTypes.func,
    change: PropTypes.func,
    resources: PropTypes.object,
    mutator: PropTypes.shape({
      query: PropTypes.shape({
        update: PropTypes.func,
      }),
    }).isRequired,
    loading: PropTypes.bool.isRequired,
  };

  constructor(props) {
    super(props);
    this.onSubmit = this.onSubmit.bind(this);
    this.showInfo = this.showInfo.bind(this);
    this.renderActions = this.renderActions.bind(this);
    this.handleOptionsChange = this.handleOptionsChange.bind(this);
  }

  state = {
    showPickers: false
  };

  componentDidMount() {
    this.focusInput();
  }

  focusInput() {
    this.props.barcodeRef.current.focus();
  }

  onSubmit(data) {
    return this.props.submithandler(data, this);
  }

  handleSessionEnd = async () => {
    const { onSessionEnd } = this.props;
    this.setState({ showPickers: false });
    await onSessionEnd();
    this.focusInput();
  }

  showPickers = () => {
    const { change, intl: { timeZone } } = this.props;
    const now = moment.tz(timeZone);
    change('item.checkinDate', now.format());
    change('item.checkinTime', now.format());
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
    this.props.mutator.query.update({
      _path: `/users/view/${loan.userId}?layer=loan&loan=${loan.id}`,
    });
  }

  showCheckinNotes(loan) {
    this.props.showCheckinNotes(loan);
  }

  showPatronDetails(loan) {
    this.props.mutator.query.update({
      _path: `/users/view/${loan.userId}`,
    });
  }

  showItemDetails(loan) {
    const { item: { instanceId, holdingsRecordId, id } } = loan;
    const path = `/inventory/view/${instanceId}/${holdingsRecordId}/${id}`;
    this.props.mutator.query.update({ _path: path });
  }

  async newFeeFine(loan) {
    const { resources, mutator } = this.props;

    const query = `id=${loan.userId}`;
    const patronGroups = get(resources, ['patronGroups', 'records'], []);
    const users = await mutator.users.GET({ params: { query } });
    const patron = get(users, [0, 'patronGroup'], '');
    const pg = (patronGroups.find(p => p.id === patron) || {}).group;
    const path = `/users/view/${loan.userId}?filters=pg.${pg}&layer=charge&loan=${loan.id}`;
    this.props.mutator.query.update({ _path: path });
  }

  getTemplate(type) {
    const { resources } = this.props;
    const staffSlips = (resources.staffSlips || {}).records || [];
    const staffSlip = staffSlips.find(slip => slip.name.toLowerCase() === type);
    return get(staffSlip, ['template'], '');
  }

  showInfo(loan) {
    const content =
    (
      <div>
        <KeyValue label={<FormattedMessage id="ui-checkin.processedAs" />}>
          <FormattedTime value={loan.returnDate} day="numeric" month="numeric" year="numeric" />
        </KeyValue>
        <KeyValue label={<FormattedMessage id="ui-checkin.actual" />}>
          <FormattedTime value={new Date()} day="numeric" month="numeric" year="numeric" />
        </KeyValue>
      </div>
    );

    return (
      <InfoPopover content={content} />
    );
  }

  renderActions(loan) {
    const {
      intl,
      stripes: {
        timezone,
        locale,
      },
    } = this.props;

    const isCheckInNote = element => element.noteType === 'Check in';
    const checkinNotePresent = get(loan.item, ['circulationNotes'], []).some(isCheckInNote);

    const trigger = ({ getTriggerProps, triggerRef }) => {
      return (
        <React.Fragment>
          <Button
            {...getTriggerProps()}
            buttonStyle="hover dropdownActive"
            aria-labelledby="actions-tooltip-text"
            id="available-actions-button"
          >
            <Icon icon="ellipsis" size="large" />
          </Button>
          <Tooltip
            id="actions-tooltip"
            text={<FormattedMessage id="ui-checkin.actions.moreDetails" />}
            triggerRef={triggerRef}
          />
        </React.Fragment>
      );
    };

    const menu = ({ onToggle }) => {
      return (
        <DropdownMenu
          role="menu"
          aria-label="available actions"
          onToggle={onToggle}
        >
          {loan.nextRequest &&
            <PrintButton
              data-test-print-hold-slip
              buttonStyle="dropdownItem"
              template={this.getTemplate('hold')}
              dataSource={convertToSlipData(loan.staffSlipContext, intl, timezone, locale)}
            >
              <FormattedMessage id="ui-checkin.action.printHoldSlip" />
            </PrintButton>
          }
          {loan.transitItem &&
            <PrintButton
              data-test-print-transit-slip
              buttonStyle="dropdownItem"
              template={this.getTemplate('transit')}
              dataSource={convertToSlipData(loan.staffSlipContext, intl, timezone, locale, 'Transit')}
            >
              <FormattedMessage id="ui-checkin.action.printTransitSlip" />
            </PrintButton>
          }
          {loan.userId &&
            <div data-test-loan-details>
              <Button
                buttonStyle="dropdownItem"
                href={`/users/view/${loan.userId}?layer=loan&loan=${loan.id}`}
                onClick={(e) => this.handleOptionsChange({ loan, action: 'showLoanDetails' }, e)}
              >
                <FormattedMessage id="ui-checkin.loanDetails" />
              </Button>
            </div>
          }
          {loan.userId &&
            <div data-test-patron-details>
              <Button
                buttonStyle="dropdownItem"
                href={`/users/view/${loan.userId}`}
                onClick={(e) => this.handleOptionsChange({ loan, action: 'showPatronDetails' }, e)}
              >
                <FormattedMessage id="ui-checkin.patronDetails" />
              </Button>
            </div>
          }
          <div data-test-item-details>
            <Button
              buttonStyle="dropdownItem"
              href={`/inventory/view/${loan.item.instanceId}/${loan.item.holdingsRecordId}/${loan.item.id}`}
              onClick={(e) => this.handleOptionsChange({ loan, action: 'showItemDetails' }, e)}
            >
              <FormattedMessage id="ui-checkin.itemDetails" />
            </Button>
          </div>
          {loan.userId &&
            <Button
              buttonStyle="dropdownItem"
              href={`/users/view/${loan.userId}`}
              onClick={(e) => this.handleOptionsChange({ loan, action: 'newFeeFine' }, e)}
            >
              <FormattedMessage id="ui-checkin.newFeeFine" />
            </Button>
          }
          {checkinNotePresent &&
            <div data-test-checkin-notes>
              <Button
                buttonStyle="dropdownItem"
                onClick={(e) => this.handleOptionsChange({ loan, action: 'showCheckinNotes' }, e)}
              >
                <FormattedMessage id="ui-checkin.checkinNotes" />
              </Button>
            </div>
          }
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
      intl: { formatDate, formatMessage, formatTime },
      scannedItems,
      pristine,
      barcodeRef,
      loading,
    } = this.props;

    const { showPickers } = this.state;
    const itemListFormatter = {
      'timeReturned': loan => ((loan.returnDate) ?
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div data-test-check-in-return-time>{formatTime(`${get(loan, ['returnDate'])}`)}</div>
          <div key={loan.id}>{this.showInfo(loan)}</div>
        </div> :
        null
      ),
      'title': (loan) => {
        const title = `${get(loan, ['item', 'title'])}`;
        const materialType = `${get(loan, ['item', 'materialType', 'name'])}`;
        return `${title} (${materialType})`;
      },
      'barcode': loan => `${get(loan, ['item', 'barcode'])}`,
      'location': loan => `${get(loan, ['item', 'location', 'name'])}`,
      'inHouseUse': loan => { return get(loan, 'inHouseUse') ? <Icon icon="plus-sign" size="small" /> : ''; },
      'status': loan => {
        const status = `${get(loan, ['item', 'status', 'name'])}`;
        const inTransitSp = get(loan, ['item', 'inTransitDestinationServicePoint', 'name']);
        return (inTransitSp) ? `${status} - ${inTransitSp}` : status;
      },
      'effectiveCallNumber': loan => {
        const callNumberComponents = get(loan, ['item', 'callNumberComponents'], {});

        return compact([callNumberComponents.prefix, callNumberComponents.callNumber, callNumberComponents.suffix]).join(' ');
      },
      ' ': loan => this.renderActions(loan),
    };

    const columnMapping = {
      'timeReturned': formatMessage({ id: 'ui-checkin.timeReturned' }),
      'title': formatMessage({ id: 'ui-checkin.title' }),
      'barcode': formatMessage({ id: 'ui-checkin.barcode' }),
      'effectiveCallNumber': formatMessage({ id: 'ui-checkin.effectiveCallNumber' }),
      'location': formatMessage({ id: 'ui-checkin.location' }),
      'inHouseUse': formatMessage({ id: 'ui-checkin.inHouseUse' }),
      'status': formatMessage({ id: 'ui-checkin.status' }),
      ' ': <IconButton style={{ marginLeft: '-6px' }} icon="gear" aria-label="action settings" />,
    };
    const scanBarcodeMsg = formatMessage({ id: 'ui-checkin.scanBarcode' });
    const itemIdLabel = formatMessage({ id: 'ui-checkin.itemId' });
    const processLabel = formatMessage({ id: 'ui-checkin.processAs' });
    const checkinDateLabel = formatMessage({ id: 'ui-checkin.checkinDate' });
    const checkinTimeLabel = formatMessage({ id: 'ui-checkin.checkinTime' });
    const timeReturnedLabel = formatMessage({ id: 'ui-checkin.timeReturnedLabel' });
    const scannedItemsLabel = formatMessage({ id: 'ui-checkin.scannedItems' });
    const emptyMessage = !loading ? <FormattedMessage id="ui-checkin.noItems" /> : null;

    return (
      <form onSubmit={handleSubmit(this.onSubmit)}>
        <div style={containerStyle}>
          <Paneset static>
            <Pane paneTitle={scannedItemsLabel} defaultWidth="100%">
              <div style={{ width: '100%', maxWidth: '1280px', margin: 'auto' }}>
                <Row>
                  <Col xs={9} sm={4}>
                    <Layout className="marginTopLabelSpacer">
                      <Field
                        id="input-item-barcode"
                        name="item.barcode"
                        validationEnabled={false}
                        placeholder={scanBarcodeMsg}
                        aria-label={itemIdLabel}
                        inputRef={barcodeRef}
                        fullWidth
                        component={TextField}
                        data-test-check-in-barcode
                      />
                    </Layout>
                  </Col>
                  <Col xs={3} sm={1}>
                    <Layout className="marginTopLabelSpacer">
                      <Button id="clickable-add-item" buttonStyle="primary" fullWidth type="submit" disabled={pristine}>
                        <FormattedMessage id="ui-checkin.enter" />
                      </Button>
                    </Layout>
                  </Col>
                  <Col xs={12} smOffset={2} sm={2}>
                    {showPickers ? (
                      <div data-test-process-date>
                        <Field
                          name="item.checkinDate"
                          aria-label={checkinDateLabel}
                          label={processLabel}
                          component={Datepicker}
                          autoComplete="off"
                          format={(value) => (value ? formatDate(value, { timeZone: 'UTC' }) : '')}
                        />
                      </div>
                    ) : (
                      <div>
                        <div className={styles['field-label']}>{processLabel}</div>
                        <button
                          data-test-checkin-modify-date
                          onClick={this.showPickers}
                          className={styles['modify-datetime-button']}
                          type="button"
                        >
                          <Icon icon="edit" iconPosition="end">
                            <FormattedMessage id="ui-checkin.today" />
                          </Icon>
                        </button>
                      </div>
                    )}
                  </Col>
                  <Col xs={12} sm={2}>
                    {showPickers ? (
                      <div data-test-process-time>
                        <Field
                          name="item.checkinTime"
                          aria-label={checkinTimeLabel}
                          label={timeReturnedLabel}
                          component={Timepicker}
                          autoComplete="off"
                        />
                      </div>
                    ) : (
                      <div>
                        <div className={styles['field-label']}>{timeReturnedLabel}</div>
                        <button
                          data-test-checkin-modify-time
                          onClick={this.showPickers}
                          className={styles['modify-datetime-button']}
                          type="button"
                        >
                          <Icon icon="edit" iconPosition="end">
                            <FormattedMessage id="ui-checkin.now" />
                          </Icon>
                        </button>
                      </div>
                    )}
                  </Col>
                  <Col xs={12} sm={1}>
                    <Layout className="marginTopLabelSpacer">
                      <Button id="clickable-end-session" buttonStyle="default" style={{ minWidth: '90px' }} fullWidth onClick={this.handleSessionEnd}>
                        <FormattedMessage id="ui-checkin.endSession" />
                      </Button>
                    </Layout>
                  </Col>
                </Row>
                {loading &&
                  <Icon
                    icon="spinner-ellipsis"
                    width="10px"
                  />
                }
                <div data-test-checked-in-items>
                  <MultiColumnList
                    id="list-items-checked-in"
                    fullWidth
                    visibleColumns={['timeReturned', 'title', 'barcode', 'effectiveCallNumber', 'location', 'inHouseUse', 'status', ' ']}
                    columnMapping={columnMapping}
                    columnWidths={{ 'timeReturned': 120, ' ': 80, 'title': 300, 'barcode': 200, 'effectiveCallNumber': 200, 'location': 200, 'inHouseUse': 80, 'status': 120 }}
                    columnOverflow={{ ' ': true }}
                    rowMetadata={['id']}
                    interactive={false}
                    contentData={scannedItems}
                    formatter={itemListFormatter}
                    isEmptyMessage={emptyMessage}
                  />
                </div>
              </div>
            </Pane>
          </Paneset>
        </div>
      </form>
    );
  }
}

export default reduxForm({
  form: 'CheckIn',
})(injectIntl(CheckIn));
