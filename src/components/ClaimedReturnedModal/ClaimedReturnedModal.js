import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

import {
  Modal,
  Button,
} from '@folio/stripes/components';
import SafeHTMLMessage from '@folio/react-intl-safe-html';

import { claimedReturnedResolutions } from '../../consts';

const ClaimedReturnedModal = ({ item, open, onCancel, onConfirm }) => {
  const footer = (
    <div >
        <Button
          buttonStyle="primary"
          onClick={onCancel}
        >
          <FormattedMessage id="ui-checkin.multipieceModal.cancel" />
        </Button>
        <Button
          onClick={() => onConfirm(claimedReturnedResolutions.FOUND)}
        >
          <FormattedMessage id="ui-checkin.claimedReturnedModal.resolution.found" />
        </Button>
        <Button
          onClick={() => onConfirm(claimedReturnedResolutions.RETURNED)}
        >
          <FormattedMessage id="ui-checkin.claimedReturnedModal.resolution.returned" />
        </Button>
    </div>
  );

  return (
    <Modal
      data-test-claimed-returned-modal
      dismissible
      open={open}
      onCancel={onCancel}
      label={<FormattedMessage id="ui-checkin.claimedReturnedModal.label" />}
      footer={footer}
    >
      <SafeHTMLMessage
        id="ui-checkin.claimedReturnedModal.message"
        values={{
          title: item.title,
          barcode: item.barcode,
          materialType: item?.materialType?.name ?? '',
        }}
      />
    </Modal>
  );
}

ClaimedReturnedModal.propTypes = {
  item: PropTypes.object,
  onCancel: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
};

export default ClaimedReturnedModal;