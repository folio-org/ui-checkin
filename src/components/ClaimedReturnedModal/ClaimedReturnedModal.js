import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

import {
  Modal,
  Button,
} from '@folio/stripes/components';

class ClaimedReturnedModal extends React.Component {

  render() {
    const { open } = this.props;

    return (
      <Modal
        open={open}
        dismissible
        label="test"
      >
        <p>Testing</p>
      </Modal>
    );
  }
}

export default ClaimedReturnedModal;