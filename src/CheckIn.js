import get from 'lodash/get';
import React from 'react';
import PropTypes from 'prop-types';
import { Field, reduxForm } from 'redux-form';
import { FormattedMessage, injectIntl, intlShape } from 'react-intl';
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
  Icon
} from '@folio/stripes/components';

import styles from './checkin.css';

class CheckIn extends React.Component {
  static propTypes = {
    intl: intlShape,
    scannedItems: PropTypes.arrayOf(PropTypes.object),
    handleSubmit: PropTypes.func.isRequired,
    pristine: PropTypes.bool,
    submithandler: PropTypes.func,
    showInfo: PropTypes.func,
    onSessionEnd: PropTypes.func,
    renderActions: PropTypes.func,
    change: PropTypes.func
  };

  constructor() {
    super();
    this.barcodeEl = React.createRef();
    this.onSubmit = this.onSubmit.bind(this);
  }

  state = {
    showPickers: false
  };

  componentDidMount() {
    this.focusInput();
  }

  focusInput() {
    if (this.barcodeEl.current) {
      this.barcodeEl.current.getRenderedComponent().focusInput();
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
      showInfo,
      renderActions,
    } = this.props;

    const { showPickers } = this.state;

    const itemListFormatter = {
      'timeReturned': loan => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div>{formatTime(`${get(loan, ['returnDate'])}`)}</div>
          <div key={loan.id}>{showInfo(loan)}</div>
        </div>
      ),
      'title': (loan) => {
        const title = `${get(loan, ['item', 'title'])}`;
        const materialType = `${get(loan, ['item', 'materialType', 'name'])}`;
        return `${title} (${materialType})`;
      },
      'barcode': loan => `${get(loan, ['item', 'barcode'])}`,
      'location': loan => `${get(loan, ['item', 'location', 'name'])}`,
      'status': loan => `${get(loan, ['item', 'status', 'name'])}`,
      'callNumber': (loan) => {
        const callNumber = `${get(loan, ['item', 'callNumber'])}`;
        return callNumber !== 'undefined' ? callNumber : ' ';
      },
      ' ': loan => renderActions(loan),
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
                        ref={this.barcodeEl}
                        withRef
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
