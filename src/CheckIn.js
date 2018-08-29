import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import { Field, reduxForm } from 'redux-form';
import { FormattedMessage } from 'react-intl';
import Paneset from '@folio/stripes-components/lib/Paneset';
import Pane from '@folio/stripes-components/lib/Pane';
import Button from '@folio/stripes-components/lib/Button';
import MultiColumnList from '@folio/stripes-components/lib/MultiColumnList';
import TextField from '@folio/stripes-components/lib/TextField';
import Datepicker from '@folio/stripes-components/lib/Datepicker';
import Timepicker from '@folio/stripes-components/lib/Timepicker';
import IconButton from '@folio/stripes-components/lib/IconButton'; // eslint-disable-line import/no-extraneous-dependencies
import Layout from '@folio/stripes-components/lib/Layout';
import { Row, Col } from '@folio/stripes-components/lib/LayoutGrid';

class CheckIn extends React.Component {
  static propTypes = {
    scannedItems: PropTypes.arrayOf(PropTypes.object),
    handleSubmit: PropTypes.func.isRequired,
    submitting: PropTypes.bool,
    pristine: PropTypes.bool,
    submithandler: PropTypes.func,
    showInfo: PropTypes.func,
    onSessionEnd: PropTypes.func,
    renderActions: PropTypes.func,
    stripes: PropTypes.object,
  };

  constructor() {
    super();
    this.barcodeEl = React.createRef();
  }

  focusInput() {
    if (this.barcodeEl.current) {
      this.barcodeEl.current.getRenderedComponent().focusInput();
    }
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
      submitting, // eslint-disable-line no-unused-vars
      submithandler,
      onSessionEnd,
      scannedItems,
      pristine,
      showInfo,
      renderActions,
      stripes,
    } = this.props;

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
                    <div data-test-process-date>
                      <Field
                        name="item.checkinDate"
                        aria-label={checkinDateLabel}
                        label={processLabel}
                        component={Datepicker}
                        passThroughValue="today"
                      />
                    </div>
                  </Col>
                  <Col xs={12} sm={2}>
                    <div data-test-process-time>
                      <Field
                        name="item.checkinTime"
                        aria-label={checkinTimeLabel}
                        label={timeReturnedLabel}
                        component={Timepicker}
                        passThroughValue="now"
                      />
                    </div>
                  </Col>
                  <Col xs={12} sm={1}>
                    <Layout className="marginTopLabelSpacer">
                      <Button id="clickable-end-session" buttonStyle="default" style={{ minWidth: '90px' }} fullWidth onClick={onSessionEnd}>
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
