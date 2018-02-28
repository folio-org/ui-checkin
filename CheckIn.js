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
import Layout from '@folio/stripes-components/lib/Layout';


const propTypes = {
  scannedItems: PropTypes.arrayOf(PropTypes.object),
  handleSubmit: PropTypes.func.isRequired,
  submitting: PropTypes.bool,
  pristine: PropTypes.bool,
  submithandler: PropTypes.func,
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


  const itemListFormatter = {
    Title: loan => `${_.get(loan, ['item', 'title'])}`,
    Barcode: loan => `${_.get(loan, ['item', 'barcode'])}`,
    Status: loan => `${_.get(loan, ['item', 'status', 'name'])}`,
    Location: loan => `${_.get(loan, ['item', 'location', 'name'])}`,
    ' ': loan => props.renderActions(loan),
  };

  const {
    handleSubmit,
    submitting, // eslint-disable-line no-unused-vars
    submithandler,
    scannedItems,
    pristine,
  } = props;

  return (
    <form onSubmit={handleSubmit(submithandler)}>
      <div style={containerStyle}>
        <Paneset static>
          <Pane paneTitle="Scanned Items" defaultWidth="100%">
            <div style={{ width: '100%', maxWidth: '1280px', margin: 'auto' }}>
              <Row>
                <Col xs={9} sm={4}>
                  <Layout className="marginTopLabelSpacer">
                    <Field id="input-item-barcode" name="item.barcode" validationEnabled={false} rounded={true} placeholder="Scan or enter barcode to check-in item" aria-label="Item ID" fullWidth component={TextField} />
                  </Layout>
                </Col>
                <Col xs={3} sm={1}>
                  <Layout className="marginTopLabelSpacer">
                    <Button id="clickable-add-item" buttonStyle="primary" fullWidth type="submit" disabled={pristine}>Enter</Button>
                  </Layout>
                </Col>
                <Col xs={12} smOffset={2} sm={2}>
                  <Field
                    name="item.checkinTime"
                    aria-label="checkin time"
                    label="Process as:"
                    rounded={true}
                    component={Datepicker}
                  />
                </Col>
                <Col xs={12} sm={2}>
                  <Field id="input-item-timepicker" name="item.timepicker" validationEnabled={false} placeholder="HH:MM" label="Time returned:" aria-label="time" fullWidth component={TextField} />
                </Col>
                <Col xs={12} sm={1}>
                  <Layout className="marginTopLabelSpacer">
                    <Button id="clickable-end-session" buttonStyle="default" style={{ minWidth: '90px' }} fullWidth type="submit" disabled={submitting}>End session</Button>
                  </Layout>
                </Col>
              </Row>
              <MultiColumnList
                id="list-items-checked-in"
                fullWidth
                visibleColumns={['Title', 'Barcode', 'Status', 'Location', ' ']}
                columnWidths={{ ' ': 28, barcode: 150, title: 350 }}
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
