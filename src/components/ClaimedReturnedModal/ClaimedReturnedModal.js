import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

import {
  Modal,
  Button,
} from '@folio/stripes/components';

const ClaimedReturnedModal = ({ item, open, onCancel, onConfirm }) => {
  const footer = (
    <div >
      {/* {isPrintable ?
        <PrintButton
          data-test-confirm-button
          buttonStyle="primary"
          id={`clickable-${testId}-confirm`}
          buttonClass={mfCss.modalFooterButton}
          dataSource={slipData}
          template={slipTemplate}
          onBeforePrint={onConfirm}
          onAfterPrint={onCancel}
        >
          <FormattedMessage id="ui-checkin.statusModal.close" />
        </PrintButton> : */}
        <Button
          data-test-confirm-button
          label="test button"
          // id={`clickable-${testId}-confirm`}
          onClick={onCancel}
          buttonStyle="primary"
          // buttonClass={mfCss.modalFooterButton}
        >
          Cancel
          {/* <FormattedMessage id="ui-checkin.statusModal.close" /> */}
        </Button>
        <Button
          onClick={() => onConfirm('Found by library')}
        >
          Found by library
        </Button>
        <Button
          onClick={() => onConfirm('Returned by patron')}
        >
          Returned by patron
        </Button>
    </div>
  );

  return (
    <Modal
      dismissible
      open={open}
      onCancel={onCancel}
      label="Resolve claim returned item"
      footer={footer}
    >
      <p><strong>{item.title}</strong> (<strong>{item?.materialType?.name}</strong>) (Barcode: {item.barcode}) has been <strong>claimed returned</strong>.</p>
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