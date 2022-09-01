import { get } from 'lodash';
import React from 'react';
import {
  injectIntl,
  FormattedMessage,
} from 'react-intl';
import PropTypes from 'prop-types';
import {
  Modal,
  ModalFooter,
  Button,
  Row,
  Col,
  KeyValue,
} from '@folio/stripes/components';

const MultipieceModal = (props) => {
  const {
    intl: { formatMessage },
    item,
    onClose,
    onConfirm,
  } = props;
  const { title, barcode, materialType } = item;

  const footer = (
    <ModalFooter data-testid="multipieceModalFooter">
      <Button
        data-testid="multipieceModalConfirmButton"
        buttonStyle="primary"
        data-test-checkin-button
        onClick={() => onConfirm()}
      >
        <FormattedMessage id="ui-checkin.multipieceModal.checkIn" />
      </Button>
      <Button
        data-testid="multipieceModalCancelButton"
        onClick={onClose}
      >
        <FormattedMessage id="ui-checkin.multipieceModal.cancel" />
      </Button>
    </ModalFooter>
  );
  return (
    <Modal
      data-testid="multipieceModal"
      id="multipiece-modal"
      data-test-multi-piece-modal
      size="small"
      footer={footer}
      dismissible
      label={formatMessage({ id: 'ui-checkin.multipieceModal.label' })}
      {...props}
    >
      <p>
        <FormattedMessage
          id="ui-checkin.multipieceModal.message"
          values={{ title, barcode, name: (materialType.name) }}
        />
      </p>
      <Row>
        <Col xs={6}>
          <KeyValue
            data-testid="numberOfPieces"
            label={formatMessage({ id: 'ui-checkin.multipieceModal.item.numberOfPieces' })}
            value={get(item, 'numberOfPieces', '')}
          />
        </Col>
        <Col xs={6}>
          <KeyValue
            data-testid="descriptionOfPieces"
            label={formatMessage({ id: 'ui-checkin.multipieceModal.item.descriptionOfPieces' })}
            value={get(item, 'descriptionOfPieces', '')}
          />
        </Col>
        {
          (item.numberOfMissingPieces || item.missingPieces) &&
          <>
            <Col xs={6}>
              <KeyValue
                data-testid="numberOfMissingPieces"
                label={formatMessage({ id: 'ui-checkin.multipieceModal.item.numberOfMissingPieces' })}
                value={get(item, 'numberOfMissingPieces', '')}
              />
            </Col>
            <Col xs={6}>
              <KeyValue
                data-testid="descriptionOfmissingPieces"
                label={formatMessage({ id: 'ui-checkin.multipieceModal.item.descriptionOfmissingPieces' })}
                value={get(item, 'missingPieces', '')}
              />
            </Col>
          </>
        }
      </Row>
    </Modal>
  );
};

MultipieceModal.propTypes = {
  intl: PropTypes.object.isRequired,
  open: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  item: PropTypes.object,
};

export default injectIntl(MultipieceModal);
