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

  renderCloseAndCheckoutButton() {
    const {
      slipTemplate = '',
      slipData,
    } = this.props;

    const { isPrintable } = this.state;

    return isPrintable
      ? (
        <PrintButton
          buttonStyle="primary"
          buttonClass={mfCss.modalFooterButton}
          onBeforePrint={this.props.onCloseAndCheckout}
          dataSource={slipData}
          template={slipTemplate}
          data-test-close-and-print
        >
          <FormattedMessage id="ui-checkin.statusModal.delivery.closeAndCheckout" />
        </PrintButton>
      )
      : (
        <Button
          buttonStyle="primary"
          buttonClass={mfCss.modalFooterButton}
          onClick={this.props.onCloseAndCheckout}
          data-test-close-and-checkout
        >
          <FormattedMessage id="ui-checkin.statusModal.delivery.closeAndCheckout" />
        </Button>
      );
  }

  renderCloseButton() {
    const {
      onClose,
      slipTemplate = '',
      slipData,
    } = this.props;

    const { isPrintable } = this.state;

    return isPrintable
      ? (
        <PrintButton
          buttonStyle="primary"
          buttonClass={mfCss.modalFooterButton}
          onBeforePrint={onClose}
          dataSource={slipData}
          template={slipTemplate}
          data-test-close-and-print
        >
          <FormattedMessage id="ui-checkin.statusModal.close" />
        </PrintButton>
      )
      : (
        <Button
          buttonStyle="primary"
          data-test-confirm-button
          buttonClass={mfCss.modalFooterButton}
          onClick={onClose}
          data-test-close
        >
          <FormattedMessage id="ui-checkin.statusModal.close" />
        </Button>
      );
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
