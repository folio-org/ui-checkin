import React from 'react';
import PropTypes from 'prop-types';
import {
  FormattedMessage,
} from 'react-intl';
import {
  Modal,
  ModalFooter,
  Button,
} from '@folio/stripes/components';

const InHouseUseConfirmModal = ({
  open,
  onConfirm,
  onCheckInOnly,
  onCancel,
  confirmButtonRef,
}) => {
  const footer = (
    <ModalFooter>
      <Button
        ref={confirmButtonRef}
        data-testid="inHouseUseConfirmButton"
        buttonStyle="primary"
        onClick={onConfirm}
      >
        <FormattedMessage id="ui-checkin.inHouseUseConfirmModal.checkInForInHouseUse" />
      </Button>
      <Button
        data-testid="inHouseUseCheckInOnlyButton"
        onClick={onCheckInOnly}
      >
        <FormattedMessage id="ui-checkin.inHouseUseConfirmModal.checkInOnly" />
      </Button>
      <Button
        data-testid="inHouseUseCancelButton"
        onClick={onCancel}
      >
        <FormattedMessage id="ui-checkin.inHouseUseConfirmModal.cancel" />
      </Button>
    </ModalFooter>
  );

  return (
    <Modal
      dismissible
      data-testid="inHouseUseConfirmModal"
      open={open}
      size="small"
      label={<FormattedMessage id="ui-checkin.inHouseUseConfirmModal.title" />}
      footer={footer}
      restoreFocus={false}
      onClose={onCancel}
      onOpen={() => confirmButtonRef?.current?.focus()}
    >
      <FormattedMessage id="ui-checkin.inHouseUseConfirmModal.message" />
    </Modal>
  );
};

InHouseUseConfirmModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onConfirm: PropTypes.func.isRequired,
  onCheckInOnly: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  confirmButtonRef: PropTypes.object.isRequired,
};

export default InHouseUseConfirmModal;
