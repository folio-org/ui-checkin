import uniqueId from 'lodash/uniqueId';
import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import {
  Modal,
  ModalFooter,
  Button,
  Checkbox,
  Row,
  Col,
} from '@folio/stripes/components';

import PrintButton from '../PrintButton';

class ConfirmStatusModal extends React.Component {
  static propTypes = {
    label: PropTypes.node.isRequired,
    message: PropTypes.node.isRequired,
    onConfirm: PropTypes.func.isRequired,
    open: PropTypes.bool.isRequired,
    onCancel: PropTypes.func.isRequired,
    slipTemplate: PropTypes.string,
    slipData: PropTypes.object,
    isPrintable: PropTypes.bool,
  };

  constructor(props) {
    super(props);
    this.printContentRef = React.createRef();
    const { isPrintable } = props;

    this.state = { isPrintable };
  }

  render() {
    const {
      onConfirm,
      open,
      slipTemplate = '',
      slipData,
      label,
      message,
      onCancel,
    } = this.props;

    const { isPrintable } = this.state;
    const testId = uniqueId('confirm-status-');
    const footer = (
      <ModalFooter>
        {isPrintable ?
          <PrintButton
            data-test-confirm-button
            buttonStyle="primary"
            id={`clickable-${testId}-confirm`}
            dataSource={slipData}
            template={slipTemplate}
            onBeforePrint={onConfirm}
            onAfterPrint={onCancel}
          >
            <FormattedMessage id="ui-checkin.statusModal.close" />
          </PrintButton> :
          <Button
            data-test-confirm-button
            label={label}
            id={`clickable-${testId}-confirm`}
            onClick={onConfirm}
            buttonStyle="primary"
          >
            <FormattedMessage id="ui-checkin.statusModal.close" />
          </Button>}
      </ModalFooter>
    );
    const messageParts = message.map(m => <p>{m}</p>);

    return (
      <Modal
        data-test-confirm-status-modal
        dismissible
        onClose={onConfirm}
        open={open}
        id={testId}
        label={label}
        scope="module"
        size="small"
        footer={footer}
      >
        {messageParts}
        <Row>
          <Col xs>
            <Checkbox
              name="printSlip"
              data-test-print-slip-checkbox
              label={<FormattedMessage id="ui-checkin.statusModal.printSlip" />}
              onChange={() => this.setState(prevState => ({ isPrintable: !prevState.isPrintable }))}
              checked={isPrintable}
              value={isPrintable + ''}
            />
          </Col>
        </Row>
      </Modal>
    );
  }
}

export default ConfirmStatusModal;
