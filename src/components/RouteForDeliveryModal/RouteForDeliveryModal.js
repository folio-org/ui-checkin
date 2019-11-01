import React, { Fragment } from 'react';
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

  closeButtonContent = <FormattedMessage id="ui-checkin.statusModal.close" />;
  closeAndCheckoutButtonContent = <FormattedMessage id="ui-checkin.statusModal.delivery.closeAndCheckout" />;

  onPrintCheckboxChange = () => {
    this.setState(prevState => ({ isPrintable: !prevState.isPrintable }));
  }

  renderFooter() {
    const { isPrintable } = this.state;

    return (
      <div className={mfCss.modalFooterButtons}>
        {isPrintable
          ? this.renderPrintButtonsGroup()
          : this.renderButtonsGroup()
        }
      </div>
    );
  }

  renderPrintButtonsGroup() {
    const {
      slipTemplate = '',
      slipData,
      onClose,
      onCloseAndCheckout,
    } = this.props;

    return (
      <Fragment>
        <PrintButton
          buttonStyle="primary"
          buttonClass={mfCss.modalFooterButton}
          onBeforePrint={onCloseAndCheckout}
          dataSource={slipData}
          template={slipTemplate}
          data-test="closeAndCheckout"
        >
          {this.closeAndCheckoutButtonContent}
        </PrintButton>
        <PrintButton
          buttonStyle="primary"
          buttonClass={mfCss.modalFooterButton}
          onBeforePrint={onClose}
          dataSource={slipData}
          template={slipTemplate}
          data-test="close"
        >
          {this.closeButtonContent}
        </PrintButton>
      </Fragment>
    );
  }

  renderButtonsGroup() {
    const {
      onClose,
      onCloseAndCheckout,
    } = this.props;

    return (
      <Fragment>
        <Button
          buttonStyle="primary"
          buttonClass={mfCss.modalFooterButton}
          onClick={onCloseAndCheckout}
          data-test="closeAndCheckout"
        >
          {this.closeAndCheckoutButtonContent}
        </Button>
        <Button
          buttonStyle="primary"
          buttonClass={mfCss.modalFooterButton}
          onClick={onClose}
          data-test="close"
        >
          {this.closeButtonContent}
        </Button>
      </Fragment>
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
