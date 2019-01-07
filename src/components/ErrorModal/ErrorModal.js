import React from 'react';
import PropTypes from 'prop-types';

import {
  Button,
  Col,
  Modal,
  Row,
} from '@folio/stripes/components';

import { FormattedMessage } from 'react-intl';

class ErrorModal extends React.Component {
  static propTypes = {
    open: PropTypes.bool,
    onClose: PropTypes.func,
    message: PropTypes.string,
  };

  render() {
    const {
      open,
      message,
      onClose,
    } = this.props;

    return (
      <Modal
        onClose={onClose}
        open={open}
        size="small"
        label={<FormattedMessage id="ui-checkin.itemNotFound" />}
        dismissible
      >
        <p>
          {message}
        </p>
        <Col xs={12}>
          <Row end="xs">
            <Button
              buttonStyle="primary"
              onClick={onClose}
            >
              <FormattedMessage id="ui-checkin.close" />
            </Button>
          </Row>
        </Col>
      </Modal>
    );
  }
}

export default ErrorModal;
