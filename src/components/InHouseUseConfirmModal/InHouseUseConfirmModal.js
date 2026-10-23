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
        <FormattedMessage id="ui-checkin.inHouseUseConfirmModal.checkIn" />
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
      data-testid="inHouseUseConfirmModal"
      open={open}
      size="small"
      label={<FormattedMessage id="ui-checkin.inHouseUseConfirmModal.title" />}
      footer={footer}
      restoreFocus={false}
      onOpen={() => confirmButtonRef?.current?.focus()}
    >
      <FormattedMessage id="ui-checkin.inHouseUseConfirmModal.message" />
    </Modal>
  );
};

InHouseUseConfirmModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onConfirm: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  confirmButtonRef: PropTypes.object.isRequired,
};

export default InHouseUseConfirmModal;
