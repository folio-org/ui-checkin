import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

import {
  Modal,
  Button,
} from '@folio/stripes/components';

import { claimedReturnedResolutions } from '../../consts';

const ClaimedReturnedModal = ({ item, open, onCancel, onConfirm }) => {
  const footer = (
    <div>
      <Button
        data-test-cancel-button
        data-testid="cancelButton"
        buttonStyle="primary"
        onClick={onCancel}
      >
        <FormattedMessage id="ui-checkin.multipieceModal.cancel" />
      </Button>
      <Button
        data-test-found-button
        data-testid="foundButton"
        onClick={() => onConfirm(claimedReturnedResolutions.FOUND)}
      >
        <FormattedMessage id="ui-checkin.claimedReturnedModal.resolution.found" />
      </Button>
      <Button
        data-test-returned-button
        data-testid="returnedButton"
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
      <FormattedMessage
        id="ui-checkin.claimedReturnedModal.message"
        values={{
          title: item.title,
          barcode: item.barcode,
          materialType: item?.materialType?.name ?? '',
        }}
      />
    </Modal>
  );
};

ClaimedReturnedModal.propTypes = {
  item: PropTypes.shape({
    title: PropTypes.string,
    barcode: PropTypes.string,
    materialType:  PropTypes.shape({
      name: PropTypes.string,
    }),
  }).isRequired,
  onCancel: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
};

export default ClaimedReturnedModal;
