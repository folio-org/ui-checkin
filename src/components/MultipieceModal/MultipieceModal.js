import { get } from 'lodash';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import PropTypes from 'prop-types';
import SafeHTMLMessage from '@folio/react-intl-safe-html';
import {
  Modal,
  ModalFooter,
  Button,
  Row,
  Col,
  KeyValue,
} from '@folio/stripes/components';

const MultipieceModal = (props) => {
  const { item, onClose, onConfirm } = props;
  const { title, barcode, materialType } = item;

  const footer = (
    <ModalFooter>
      <Button
        buttonStyle="primary"
        data-test-checkin-button
        onClick={() => onConfirm()}
      >
        <FormattedMessage id="ui-checkin.multipieceModal.checkIn" />
      </Button>
      <Button
        onClick={onClose}
      >
        <FormattedMessage id="ui-checkin.multipieceModal.cancel" />
      </Button>
    </ModalFooter>
  );
  return (
    <Modal
      id="multipiece-modal"
      data-test-multi-piece-modal
      size="small"
      footer={footer}
      dismissible
      label={
        <FormattedMessage id="ui-checkin.multipieceModal.label" />
      }
      {...props}
    >
      <p>
        <SafeHTMLMessage
          id="ui-checkin.multipieceModal.message"
          values={{ title, barcode, name: (materialType.name) }}
        />
      </p>
      <Row>
        <Col xs={6}>
          <KeyValue
            label={<FormattedMessage id="ui-checkin.multipieceModal.item.numberOfPieces" />}
            value={get(item, 'numberOfPieces', '-')}
          />
        </Col>
        <Col xs={6}>
          <KeyValue
            label={<FormattedMessage id="ui-checkin.multipieceModal.item.descriptionOfPieces" />}
            value={get(item, 'descriptionOfPieces', '-')}
          />
        </Col>
        {
          (item.numberOfMissingPieces || item.missingPieces) &&
          <React.Fragment key="missingPieces">
            <Col xs={6}>
              <KeyValue
                label={<FormattedMessage id="ui-checkin.multipieceModal.item.numberOfMissingPieces" />}
                value={get(item, 'numberOfMissingPieces') || '-'}
              />
            </Col>
            <Col xs={6}>
              <KeyValue
                label={<FormattedMessage id="ui-checkin.multipieceModal.item.descriptionOfmissingPieces" />}
                value={get(item, 'missingPieces') || '-'}
              />
            </Col>
          </React.Fragment>
        }
      </Row>
    </Modal>
  );
};

MultipieceModal.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  item: PropTypes.object,
};

export default MultipieceModal;
