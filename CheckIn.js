import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import { Field, reduxForm } from 'redux-form';
import Paneset from '@folio/stripes-components/lib/Paneset';
import Pane from '@folio/stripes-components/lib/Pane';
import Button from '@folio/stripes-components/lib/Button';
import MultiColumnList from '@folio/stripes-components/lib/MultiColumnList';
import { Row, Col } from '@folio/stripes-components/lib/LayoutGrid';
import TextField from '@folio/stripes-components/lib/TextField';
import Datepicker from '@folio/stripes-components/lib/Datepicker';
import Timepicker from '@folio/stripes-components/lib/Timepicker';
import { FormattedTime } from 'react-intl'; // eslint-disable-line import/no-extraneous-dependencies
import Layout from '@folio/stripes-components/lib/Layout';


const propTypes = {
  scannedItems: PropTypes.arrayOf(PropTypes.object),
  handleSubmit: PropTypes.func.isRequired,
  submitting: PropTypes.bool,
  pristine: PropTypes.bool,
  submithandler: PropTypes.func,
  showInfo: PropTypes.func,
  onSessionEnd: PropTypes.func,
  renderActions: PropTypes.func,
};


function CheckIn(props) {
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
  } = props;

  function formatTime(dateStr) {
    if (!dateStr) return dateStr;
    return (<FormattedTime value={dateStr} />);
  }

  const itemListFormatter = {
    'Time Returned': loan => (
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <div>{formatTime(`${_.get(loan, ['systemReturnDate'])}`)}</div>
        <div key={loan.id}>{showInfo(loan)}</div>
      </div>
    ),
    Title: (loan) => {
      const title = `${_.get(loan, ['item', 'title'])}`;
      const materialType = `${_.get(loan, ['item', 'materialType', 'name'])}`;
      return `${title} (${materialType})`;
    },
    Barcode: loan => `${_.get(loan, ['item', 'barcode'])}`,
    Location: loan => `${_.get(loan, ['item', 'location', 'name'])}`,
    Status: loan => `${_.get(loan, ['item', 'status', 'name'])}`,
    CallNumber: (loan) => {
      const callNumber = `${_.get(loan, ['item', 'callNumber'])}`;
      return callNumber !== 'undefined' ? callNumber : ' ';
    },
    ' ': loan => renderActions(loan),
  };

  return (
    <form onSubmit={handleSubmit(submithandler)}>
      <div style={containerStyle}>
        <Paneset static>
          <Pane paneTitle="Scanned Items" defaultWidth="100%">
            <div style={{ width: '100%', maxWidth: '1280px', margin: 'auto' }}>
              <Row>
                <Col xs={9} sm={4}>
                  <Layout className="marginTopLabelSpacer">
                    <Field id="input-item-barcode" name="item.barcode" validationEnabled={false} rounded placeholder="Scan or enter barcode to check-in item" aria-label="Item ID" fullWidth component={TextField} />
                  </Layout>
                </Col>
                <Col xs={3} sm={1}>
                  <Layout className="marginTopLabelSpacer">
                    <Button id="clickable-add-item" buttonStyle="primary" fullWidth type="submit" disabled={pristine}>Enter</Button>
                  </Layout>
                </Col>
                <Col xs={12} smOffset={2} sm={2}>
                  <Field
                    name="item.checkinDate"
                    aria-label="checkin Date"
                    label="Process as:"
                    rounded
                    component={Datepicker}
                    passThroughValue="today"
                  />
                </Col>
                <Col xs={12} sm={2}>
                  <Field
                    name="item.checkinTime"
                    aria-label="checkin Time"
                    label="Time returned:"
                    rounded
                    component={Timepicker}
                    passThroughValue="now"
                  />
                </Col>
                <Col xs={12} sm={1}>
                  <Layout className="marginTopLabelSpacer">
                    <Button id="clickable-end-session" buttonStyle="default" style={{ minWidth: '90px' }} fullWidth onClick={onSessionEnd}>End session</Button>
                  </Layout>
                </Col>
              </Row>
              <MultiColumnList
                id="list-items-checked-in"
                fullWidth
                visibleColumns={['Time Returned', 'Title', 'Barcode', 'CallNumber', 'Location', 'Status', ' ']}
                columnWidths={{ 'Time Returned': 120, ' ': 80, Title: 300, Barcode: 200, CallNumber: 200, Location: 200, Status: 120 }}
                columnOverflow={{ ' ': true }}
                rowMetadata={['id']}
                contentData={scannedItems}
                formatter={itemListFormatter}
                isEmptyMessage="No items have been entered yet."
              />
            </div>
          </Pane>
        </Paneset>
      </div>
    </form>
  );
}

CheckIn.propTypes = propTypes;

export default reduxForm({
  form: 'CheckIn',
})(CheckIn);
