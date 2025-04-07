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

import {
  SLIPS_DATA_PROP_TYPES,
} from '../../consts';

class RouteForDeliveryModal extends React.Component {
  static propTypes = {
    label: PropTypes.node.isRequired,
    modalContent: PropTypes.node.isRequired,
    open: PropTypes.bool.isRequired,
    slipTemplate: PropTypes.string,
    slipData: SLIPS_DATA_PROP_TYPES,
    isPrintableByDefault: PropTypes.bool,
    onClose: PropTypes.func.isRequired,
    onCloseAndCheckout: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);

    this.state = {
      isPrintable: this.props.isPrintableByDefault
    };
  }

  closeButtonContent = <FormattedMessage id="ui-checkin.statusModal.close" />;
  closeAndCheckoutButtonContent = <FormattedMessage id="ui-checkin.statusModal.delivery.closeAndCheckout" />;

  onPrintCheckboxChange = () => {
    this.setState(prevState => ({ isPrintable: !prevState.isPrintable }));
  }

  renderFooter() {
    const { isPrintable } = this.state;

    return (
      <ModalFooter>
        {isPrintable
          ? this.renderPrintButtonsGroup()
          : this.renderButtonsGroup()}
      </ModalFooter>
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
      <>
        <PrintButton
          data-testid="closeAndCheckoutPrintButton"
          buttonStyle="primary"
          onBeforePrint={onCloseAndCheckout}
          dataSource={slipData}
          template={slipTemplate}
          data-test="closeAndCheckout"
        >
          {this.closeAndCheckoutButtonContent}
        </PrintButton>
        <PrintButton
          data-testid="closeButton"
          buttonStyle="primary"
          onBeforePrint={onClose}
          dataSource={slipData}
          template={slipTemplate}
          data-test="close"
        >
          {this.closeButtonContent}
        </PrintButton>
      </>
    );
  }

  renderButtonsGroup() {
    const {
      onClose,
      onCloseAndCheckout,
    } = this.props;

    return (
      <>
        <Button
          buttonStyle="primary"
          onClick={onCloseAndCheckout}
          data-test="closeAndCheckout"
        >
          {this.closeAndCheckoutButtonContent}
        </Button>
        <Button
          buttonStyle="primary"
          onClick={onClose}
          data-test="close"
        >
          {this.closeButtonContent}
        </Button>
      </>
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
