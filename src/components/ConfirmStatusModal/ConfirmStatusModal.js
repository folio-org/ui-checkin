import React from 'react';
import { intlShape } from 'react-intl';
import PropTypes from 'prop-types';
import uniqueId from 'lodash/uniqueId';
import ReactToPrint from 'react-to-print';
import injectIntl from '@folio/stripes-components/lib/InjectIntl';
import Modal from '@folio/stripes-components/lib//Modal';
import Checkbox from '@folio/stripes-components/lib//Checkbox';
import Button from '@folio/stripes-components/lib//Button';
import { Row, Col } from '@folio/stripes-components/lib/LayoutGrid';
import SafeHTMLMessage from '@folio/react-intl-safe-html';

import css from './ConfirmStatusModal.css';

class ConfirmStatusModal extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    onCancel: PropTypes.func.isRequired,
    onConfirm: PropTypes.func.isRequired,
    open: PropTypes.bool.isRequired,
    request: PropTypes.object,
  };

  constructor(props) {
    super(props);
    this.printContentRef = React.createRef();
    this.state = {};
  }

  render() {
    const { intl, request, onConfirm, onCancel, open } = this.props;
    const { printSlip } = this.state;
    const testId = uniqueId('confirm-status-');
    const cancelLabel = intl.formatMessage({ id: 'ui-checkin.statusModal.back' });
    const confirmLabel = intl.formatMessage({ id: 'ui-checkin.statusModal.confirm' });
    const heading = intl.formatMessage({ id: 'ui-checkin.statusModal.heading' });
    const printHoldSlipLabel = intl.formatMessage({ id: 'ui-checkin.statusModal.printHoldSlip' });

    const footer = (
      <Row>
        <Col xs>
          {printSlip ?
            <ReactToPrint
              onBeforePrint={onConfirm}
              trigger={() => <Button buttonStyle="primary">{confirmLabel}</Button>}
              content={() => this.printContentRef.current}
            /> :
            <Button
              label={confirmLabel}
              onClick={onConfirm}
              id={`clickable-${testId}-confirm`}
              buttonStyle="primary"
            >
              {confirmLabel}
            </Button>
          }
          <Button
            label={cancelLabel}
            onClick={onCancel}
            id={`clickable-${testId}-cancel`}
            buttonStyle="default"
          >
            {cancelLabel}
          </Button>
        </Col>
      </Row>
    );

    return (
      <Modal
        open={open}
        id={testId}
        label={heading}
        scope="module"
        size="small"
        footer={footer}
      >
        <p>
          <SafeHTMLMessage
            id="ui-checkin.statusModal.message"
            values={{ title: request.item.title, barcode: request.item.barcode }}
          />
        </p>
        <Row>
          <Col xs>
            <Checkbox
              name="printSlip"
              label={printHoldSlipLabel}
              onChange={() => this.setState(prevState => ({ printSlip: !prevState.printSlip }))}
              value={this.state.printSlip}
            />
          </Col>
        </Row>

        <div className={css.hiddenContent}>
          <div className="ql-editor" ref={this.printContentRef}>
            TODO: setup printing content
          </div>
        </div>
      </Modal>
    );
  }
}

export default injectIntl(ConfirmStatusModal);
