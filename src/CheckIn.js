import get from 'lodash/get';
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
  UncontrolledDropdown,
  InfoPopover,
  MenuItem,
  KeyValue,
  DropdownMenu
} from '@folio/stripes/components';

import styles from './checkin.css';

class CheckIn extends React.Component {
  static propTypes = {
    intl: intlShape,
    scannedItems: PropTypes.arrayOf(PropTypes.object),
    handleSubmit: PropTypes.func.isRequired,
    pristine: PropTypes.bool,
    submithandler: PropTypes.func,
    onSessionEnd: PropTypes.func,
    change: PropTypes.func,
    resources: PropTypes.object,
    mutator: PropTypes.shape({
      query: PropTypes.shape({
        update: PropTypes.func,
      }),
    }),
  };

  constructor() {
    super();
    this.barcodeEl = React.createRef();
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
    if (this.barcodeEl.current) {
      this.barcodeEl.current.focus();
    }
  }

  onSubmit(data) {
    return this.props.submithandler(data, this);
  }

  handleSessionEnd = () => {
    const { onSessionEnd } = this.props;
    this.setState({ showPickers: false });
    onSessionEnd();
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
    return (
      <div data-test-elipse-select>
        <UncontrolledDropdown onSelectItem={this.handleOptionsChange}>
          <Button data-role="toggle" buttonStyle="hover dropdownActive"><strong>•••</strong></Button>
          <DropdownMenu data-role="menu" overrideStyle={{ padding: '6px 0' }}>
            {loan.userId &&
              <MenuItem itemMeta={{ loan, action: 'showLoanDetails' }}>
                <div data-test-loan-details>
                  <Button buttonStyle="dropdownItem" href={`/users/view/${loan.userId}?layer=loan&loan=${loan.id}`}>
                    <FormattedMessage id="ui-checkin.loanDetails" />
                  </Button>
                </div>
              </MenuItem>
            }

            {loan.userId &&
              <MenuItem itemMeta={{ loan, action: 'showPatronDetails' }}>
                <div data-test-patron-details>
                  <Button buttonStyle="dropdownItem" href={`/users/view/${loan.userId}`}>
                    <FormattedMessage id="ui-checkin.patronDetails" />
                  </Button>
                </div>
              </MenuItem>
            }

            <MenuItem itemMeta={{ loan, action: 'showItemDetails' }}>
              <div data-test-item-details>
                <Button
                  buttonStyle="dropdownItem"
                  href={`/inventory/view/${loan.item.instanceId}/${loan.item.holdingsRecordId}/${loan.item.id}`}
                >
                  <FormattedMessage id="ui-checkin.itemDetails" />
                </Button>
              </div>
            </MenuItem>
            {loan.userId &&
            <MenuItem itemMeta={{ loan, action: 'newFeeFine' }}>
              <Button
                buttonStyle="dropdownItem"
                href={`/users/view/${loan.userId}`}
              >
                <FormattedMessage id="ui-checkin.newFeeFine" />
              </Button>
            </MenuItem>
            }
          </DropdownMenu>
        </UncontrolledDropdown>
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
    } = this.props;

    const { showPickers } = this.state;

    const itemListFormatter = {
      'timeReturned': loan => ((loan.returnDate) ?
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div>{formatTime(`${get(loan, ['returnDate'])}`)}</div>
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
      'status': loan => {
        const status = `${get(loan, ['item', 'status', 'name'])}`;
        const inTransitSp = get(loan, ['item', 'inTransitDestinationServicePoint', 'name']);
        return (inTransitSp) ? `${status} - ${inTransitSp}` : status;
      },
      'callNumber': (loan) => {
        const callNumber = `${get(loan, ['item', 'callNumber'])}`;
        return callNumber !== 'undefined' ? callNumber : ' ';
      },
      ' ': loan => this.renderActions(loan),
    };

    const columnMapping = {
      'timeReturned': formatMessage({ id: 'ui-checkin.timeReturned' }),
      'title': formatMessage({ id: 'ui-checkin.title' }),
      'barcode': formatMessage({ id: 'ui-checkin.barcode' }),
      'callNumber': formatMessage({ id: 'ui-checkin.callNumber' }),
      'location': formatMessage({ id: 'ui-checkin.location' }),
      'status': formatMessage({ id: 'ui-checkin.status' }),
      ' ': <IconButton style={{ marginLeft: '-6px' }} icon="gear" aria-label="action settings" />,
    };
    const scanBarcodeMsg = formatMessage({ id: 'ui-checkin.scanBarcode' });
    const itemIdLabel = formatMessage({ id: 'ui-checkin.itemId' });
    const processLabel = formatMessage({ id: 'ui-checkin.processAs' });
    const checkinDateLabel = formatMessage({ id: 'ui-checkin.checkinDate' });
    const checkinTimeLabel = formatMessage({ id: 'ui-checkin.checkinTime' });
    const timeReturnedLabel = formatMessage({ id: 'ui-checkin.timeReturnedLabel' });
    const noItemsLabel = formatMessage({ id: 'ui-checkin.noItems' });
    const scannedItemsLabel = formatMessage({ id: 'ui-checkin.scannedItems' });
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
                        inputRef={this.barcodeEl}
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
                <MultiColumnList
                  id="list-items-checked-in"
                  fullWidth
                  visibleColumns={['timeReturned', 'title', 'barcode', 'callNumber', 'location', 'status', ' ']}
                  columnMapping={columnMapping}
                  columnWidths={{ 'timeReturned': 120, ' ': 80, 'title': 300, 'barcode': 200, 'callNumber': 200, 'location': 200, 'status': 120 }}
                  columnOverflow={{ ' ': true }}
                  rowMetadata={['id']}
                  interactive={false}
                  contentData={scannedItems}
                  formatter={itemListFormatter}
                  isEmptyMessage={noItemsLabel}
                />
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
