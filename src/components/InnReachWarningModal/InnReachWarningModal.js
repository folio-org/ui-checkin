import { FormattedMessage, useIntl } from 'react-intl';

import PropTypes from 'prop-types';

import {
  Modal,
  ModalFooter,
  Button,
} from '@folio/stripes/components';

const InnReachWarningModal = ({
  open,
  onClose,
}) => {
  const { formatMessage } = useIntl();

  if (!open) {
    return null;
  }

  const footer = (
    <ModalFooter>
      <Button
        data-testid="inn-reach-warning-modal-close-button"
        buttonStyle="primary"
        onClick={onClose}
      >
        <FormattedMessage id="ui-checkin.close" />
      </Button>
    </ModalFooter>
  );

  return (
    <Modal
      data-testid="inn-reach-warning-modal"
      open={open}
      size="small"
      label={formatMessage({ id: 'ui-checkin.innReachWarningModal.heading' })}
      footer={footer}
      dismissible
      onClose={onClose}
    >
      <FormattedMessage id="ui-checkin.innReachWarningModal.warning" />
    </Modal>
  );
};

InnReachWarningModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default InnReachWarningModal;
