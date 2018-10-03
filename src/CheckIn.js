import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import { Field, reduxForm } from 'redux-form';
import { FormattedMessage } from 'react-intl';
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
    scannedItems: PropTypes.arrayOf(PropTypes.object),
    handleSubmit: PropTypes.func.isRequired,
    pristine: PropTypes.bool,
    submithandler: PropTypes.func,
    showInfo: PropTypes.func,
    onSessionEnd: PropTypes.func,
    renderActions: PropTypes.func,
    stripes: PropTypes.object,
    change: PropTypes.func
  };

  constructor() {
    super();
    this.barcodeEl = React.createRef();
  }

  state = {
    showPickers: false
  };

  componentDidMount() {
    setTimeout(() => this.focusInput());
  }

  focusInput() {
    if (this.barcodeEl.current) {
      this.barcodeEl.current.getRenderedComponent().focusInput();
    }
  }

  handleSessionEnd = () => {
    const { onSessionEnd } = this.props;
    this.setState({ showPickers: false });
    onSessionEnd();
  }

  showPickers = () => {
    const { change, stripes: { timezone } } = this.props;
    const now = moment.tz(timezone);
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
      submithandler,
      scannedItems,
      pristine,
      showInfo,
      renderActions,
      stripes,
    } = this.props;

    const { showPickers } = this.state;

    const itemListFormatter = {
      'timeReturned': loan => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div>{stripes.formatTime(`${_.get(loan, ['systemReturnDate'])}`)}</div>
          <div key={loan.id}>{showInfo(loan)}</div>
        </div>
      ),
      'title': (loan) => {
        const title = `${_.get(loan, ['item', 'title'])}`;
        const materialType = `${_.get(loan, ['item', 'materialType', 'name'])}`;
        return `${title} (${materialType})`;
      },
      'barcode': loan => `${_.get(loan, ['item', 'barcode'])}`,
      'location': loan => `${_.get(loan, ['item', 'location', 'name'])}`,
      'status': loan => `${_.get(loan, ['item', 'status', 'name'])}`,
      'callNumber': (loan) => {
        const callNumber = `${_.get(loan, ['item', 'callNumber'])}`;
        return callNumber !== 'undefined' ? callNumber : ' ';
      },
      ' ': loan => renderActions(loan),
    };

    const columnMapping = {
      'timeReturned': stripes.intl.formatMessage({ id: 'ui-checkin.timeReturned' }),
      'title': stripes.intl.formatMessage({ id: 'ui-checkin.title' }),
      'barcode': stripes.intl.formatMessage({ id: 'ui-checkin.barcode' }),
      'callNumber': stripes.intl.formatMessage({ id: 'ui-checkin.callNumber' }),
      'location': stripes.intl.formatMessage({ id: 'ui-checkin.location' }),
      'status': stripes.intl.formatMessage({ id: 'ui-checkin.status' }),
      ' ': <IconButton style={{ marginLeft: '-6px' }} icon="gear" aria-label="action settings" />,
    };
    const scanBarcodeMsg = stripes.intl.formatMessage({ id: 'ui-checkin.scanBarcode' });
    const itemIdLabel = stripes.intl.formatMessage({ id: 'ui-checkin.itemId' });
    const processLabel = stripes.intl.formatMessage({ id: 'ui-checkin.processAs' });
    const checkinDateLabel = stripes.intl.formatMessage({ id: 'ui-checkin.checkinDate' });
    const checkinTimeLabel = stripes.intl.formatMessage({ id: 'ui-checkin.checkinTime' });
    const timeReturnedLabel = stripes.intl.formatMessage({ id: 'ui-checkin.timeReturnedLabel' });
    const noItemsLabel = stripes.intl.formatMessage({ id: 'ui-checkin.noItems' });
    return (
      <form onSubmit={handleSubmit(submithandler)}>
        <div style={containerStyle}>
          <Paneset static>
            <Pane paneTitle="Scanned Items" defaultWidth="100%">
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
                          format={(value) => (value ? stripes.intl.formatDate(value, { timeZone: 'UTC' }) : '')}
                        />
                      </div>
                    ) : (
                      <div>
                        <div>{processLabel}</div>
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
                        <div>{timeReturnedLabel}</div>
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
})(CheckIn);
