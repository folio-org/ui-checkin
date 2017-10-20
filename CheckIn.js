import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import { Field, reduxForm } from 'redux-form';
import Link from 'react-router-dom/Link';
import Paneset from '@folio/stripes-components/lib/Paneset';
import Pane from '@folio/stripes-components/lib/Pane';
import Button from '@folio/stripes-components/lib/Button';
import MultiColumnList from '@folio/stripes-components/lib/MultiColumnList';
import { Row, Col } from '@folio/stripes-components/lib/LayoutGrid';
import TextField from '@folio/stripes-components/lib/TextField';

const propTypes = {
  scannedItems: PropTypes.arrayOf(PropTypes.object),
  handleSubmit: PropTypes.func.isRequired,
  submitting: PropTypes.bool,
  submithandler: PropTypes.func,
};

const contextTypes = {
  history: PropTypes.object,
};

function CheckIn(props, context) {
  const containerStyle = {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    height: '100%',
    width: '100%',
    position: 'absolute',
  };

  const itemListFormatter = {
    barcode: loan => `${_.get(loan, ['item', 'barcode'])}`,
    title: loan => `${_.get(loan, ['item', 'title'])}`,
    location: loan => `${_.get(loan, ['item', 'location', 'name'])}`,
    patron: (loan) => {
      const url = `/users/view/${_.get(loan, ['patron', 'id'])}`;
      return <Link to={url}>{ _.get(loan, ['patron', 'personal', 'lastName']) }, { _.get(loan, ['patron', 'personal', 'firstName']) }</Link>;
    },
    'Date Loaned': loan => loan.loanDate.substr(0, 10),
    'Date Returned': loan => loan.returnDate.substr(0, 10),
    status: loan => `${_.get(loan, ['item', 'status', 'name'])}`,
  };

  const {
    handleSubmit,
    submitting, // eslint-disable-line no-unused-vars
    submithandler,
    scannedItems,
  } = props;

  return (
    <form onSubmit={handleSubmit(submithandler)}>
      <div style={containerStyle}>
        <Paneset static>
          <Pane paneTitle="Scanned Items" defaultWidth="100%">
            <div style={{ width: '100%', maxWidth: '1280px', margin: 'auto' }}>
              <Row>
                <Col xs={9}>
                  <Field id="input-item-barcode" name="item.barcode" validationEnabled={false} placeholder="Enter Barcode" aria-label="Item ID" fullWidth component={TextField} />
                </Col>
                <Col xs={3}>
                  <Button id="clickable-add-item" buttonStyle="primary noRadius" fullWidth type="submit" disabled={submitting}>+ Add item</Button>
                </Col>
              </Row>
              <MultiColumnList
                id="list-items-checked-in"
                visibleColumns={['barcode', 'title', 'location', 'patron', 'Date Loaned', 'Date Returned', 'status']}
                rowMetadata={['id']}
                contentData={scannedItems}
                formatter={itemListFormatter}
                isEmptyMessage="No items have been entered yet."
                fullWidth
              />
            </div>
          </Pane>
        </Paneset>
      </div>
    </form>
  );
}

CheckIn.propTypes = propTypes;

CheckIn.contextTypes = contextTypes;

export default reduxForm({
  form: 'CheckIn',
})(CheckIn);
