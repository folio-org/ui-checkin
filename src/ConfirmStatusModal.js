import React from 'react';
import { intlShape } from 'react-intl';
import PropTypes from 'prop-types';
import uniqueId from 'lodash/uniqueId';
import injectIntl from '@folio/stripes-components/lib/InjectIntl';
import Modal from '@folio/stripes-components/lib//Modal';
import ModalFooter from '@folio/stripes-components/lib/ModalFooter';

const propTypes = {
  heading: PropTypes.string.isRequired,
  intl: intlShape.isRequired,
  onCancel: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
  request: PropTypes.object,
};

const defaultProps = {
  buttonStyle: 'primary',
  cancelButtonStyle: 'default',
};

const ConfirmStatusModal = (props) => {
  const testId = uniqueId('confirm-status-');
  const cancelLabel = props.intl.formatMessage({ id: 'ui-checkin.statusModal.back' });
  const confirmLabel = props.intl.formatMessage({ id: 'ui-checkin.statusModal.confirm' });
  const heading = props.intl.formatMessage({ id: 'ui-checkin.statusModal.heading' });
  const message = props.intl.formatMessage({ id: 'ui-checkin.statusModal.message' });

  console.log('request', props.request);

  const footer = (
    <ModalFooter
      secondaryButton={{
        'label': cancelLabel,
        'onClick': props.onCancel,
        'id': `clickable-${testId}-cancel`,
        'buttonStyle': 'default',
        'data-test-confirmation-modal-cancel-button': true,
      }}
      primaryButton={{
        'label': confirmLabel,
        'onClick': props.onConfirm,
        'id': `clickable-${testId}-confirm`,
        'buttonStyle': 'primary',
        'data-test-confirmation-modal-confirm-button': true,
      }}
    />
  );

  return (
    <Modal
      open={props.open}
      id={testId}
      label={heading}
      scope="module"
      size="small"
      footer={footer}
    >
      <p>{message}</p>
    </Modal>
  );
};

ConfirmStatusModal.propTypes = propTypes;
ConfirmStatusModal.defaultProps = defaultProps;

export default injectIntl(ConfirmStatusModal);
