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

class RouteForDeliveryModal extends React.Component {
  static propTypes = {
    label: PropTypes.node.isRequired,
    modalContent: PropTypes.node.isRequired,
    open: PropTypes.bool.isRequired,
    slipTemplate: PropTypes.string,
    slipData: PropTypes.object,
    isPrintableByDefault: PropTypes.bool,
    onClose: PropTypes.func.isRequired,
    onCloseAndCheckout: PropTypes.func.isRequired,
  };

  state = {
    isPrintable: this.props.isPrintableByDefault
  };

  onPrintCheckboxChange = () => {
    this.setState(prevState => ({ isPrintable: !prevState.isPrintable }));
  }

  renderFooter() {
    return (
      <div className={mfCss.modalFooterButtons}>
        {this.renderCloseAndCheckoutButton()}
        {this.renderCloseButton()}
      </div>
    );
  }

  renderPrintButton(content, onBeforePrint, testId) {
    const {
      slipTemplate = '',
      slipData,
    } = this.props;

    return (
      <PrintButton
        buttonStyle="primary"
        buttonClass={mfCss.modalFooterButton}
        onBeforePrint={onBeforePrint}
        dataSource={slipData}
        template={slipTemplate}
        data-test={testId}
      >
        {content}
      </PrintButton>
    );
  }

  renderButton(content, onClick, testId) {
    return (
      <Button
        buttonStyle="primary"
        buttonClass={mfCss.modalFooterButton}
        onClick={onClick}
        data-test={testId}
      >
        {content}
      </Button>
    );
  }

  renderCloseAndCheckoutButton() {
    const { onCloseAndCheckout } = this.props;
    const { isPrintable } = this.state;
    const buttonContent = <FormattedMessage id="ui-checkin.statusModal.delivery.closeAndCheckout" />;
    const testId = 'closeAndCheckout';

    return isPrintable
      ? this.renderPrintButton(buttonContent, onCloseAndCheckout, testId)
      : this.renderButton(buttonContent, onCloseAndCheckout, testId);
  }

  renderCloseButton() {
    const { onClose } = this.props;
    const { isPrintable } = this.state;
    const buttonContent = <FormattedMessage id="ui-checkin.statusModal.close" />;
    const testId = 'close';

    return isPrintable
      ? this.renderPrintButton(buttonContent, onClose, testId)
      : this.renderButton(buttonContent, onClose, testId);
  }

  render() {
    const {
      onClose,
      open,
      label,
      modalContent,
    } = this.props;

    const { isPrintable } = this.state;

    return (
      <Modal
        open={open}
        label={label}
        size="small"
        footer={this.renderFooter()}
        scope="module"
        dismissible
        onClose={onClose}
        data-test-delivery-modal
      >
        <p data-test-modal-content>
          {modalContent}
        </p>
        <Row>
          <Col xs>
            <Checkbox
              name="printSlip"
              label={<FormattedMessage id="ui-checkin.statusModal.printSlip" />}
              checked={isPrintable}
              value={isPrintable}
              onChange={this.onPrintCheckboxChange}
              data-test-print-slip-checkbox
            />
          </Col>
        </Row>
      </Modal>
    );
  }
}

export default RouteForDeliveryModal;
