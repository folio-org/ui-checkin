import uniqueId from 'lodash/uniqueId';
import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import {
  Modal,
  Button,
  Checkbox,
  Row,
  Col
} from '@folio/stripes/components';

// eslint-disable-next-line import/no-extraneous-dependencies
import mfCss from '@folio/stripes-components/lib/ModalFooter/ModalFooter.css';

import PrintButton from '../PrintButton';

class ConfirmStatusModal extends React.Component {
  static propTypes = {
    label: PropTypes.node.isRequired,
    message: PropTypes.node.isRequired,
    onConfirm: PropTypes.func.isRequired,
    open: PropTypes.bool.isRequired,
    slipTemplate: PropTypes.string,
    slipData: PropTypes.object,
  };

  constructor(props) {
    super(props);
    this.printContentRef = React.createRef();
    this.state = { printSlip: true };
  }

  render() {
    const {
      onConfirm,
      open,
      slipTemplate = '',
      slipData,
      label,
      message,
    } = this.props;
    const { printSlip } = this.state;
    const testId = uniqueId('confirm-status-');
    const footer = (
      <div className={mfCss.modalFooterButtons}>
        {printSlip ?
          <PrintButton
            data-test-confirm-button
            buttonStyle="primary"
            id={`clickable-${testId}-confirm`}
            buttonClass={mfCss.modalFooterButton}
            onBeforePrint={onConfirm}
            data={slipData}
            template={slipTemplate}
          >
            <FormattedMessage id="ui-checkin.statusModal.confirm" />
          </PrintButton> :
          <Button
            label={label}
            id={`clickable-${testId}-confirm`}
            onClick={onConfirm}
            data-test-confirm-button
            buttonStyle="primary"
            buttonClass={mfCss.modalFooterButton}
          >
            <FormattedMessage id="ui-checkin.statusModal.confirm" />
          </Button>
        }
      </div>
    );

    return (
      <Modal
        data-test-confirm-status-modal
        open={open}
        id={testId}
        label={label}
        scope="module"
        size="small"
        footer={footer}
      >
        <p>{message}</p>
        <Row>
          <Col xs>
            <Checkbox
              name="printSlip"
              data-test-print-slip-checkbox
              label={<FormattedMessage id="ui-checkin.statusModal.printSlip" />}
              onChange={() => this.setState(prevState => ({ printSlip: !prevState.printSlip }))}
              checked={this.state.printSlip}
              value={this.state.printSlip + ''}
            />
          </Col>
        </Row>
      </Modal>
    );
  }
}

export default ConfirmStatusModal;
