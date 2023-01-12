import uniqueId from 'lodash/uniqueId';
import React, { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import {
  Modal,
  ModalFooter,
  Button,
  Checkbox,
  Row,
  Col,
} from '@folio/stripes/components';

import PrintButton from '../PrintButton';

const ConfirmStatusModal = (props) => {
  const {
    onConfirm,
    open,
    slipTemplate = '',
    slipData,
    label,
    message,
    onCancel,
  } = props;

  const [isPrintable, setIsPrintable] = useState(props.isPrintable);



  const testId = uniqueId('confirm-status-');

  const footer = useMemo(() => (
    <ModalFooter>
      {isPrintable ?
        <PrintButton
          data-test-confirm-button
          buttonStyle="primary"
          id={`clickable-${testId}-confirm`}
          dataSource={slipData}
          template={slipTemplate}
          onBeforePrint={onConfirm}
          onAfterPrint={onCancel}
        >
          <FormattedMessage id="ui-checkin.statusModal.close" />
        </PrintButton> :
        <Button
          data-test-confirm-button
          label={label}
          id={`clickable-${testId}-confirm`}
          onClick={onConfirm}
          buttonStyle="primary"
        >
          <FormattedMessage id="ui-checkin.statusModal.close" />
        </Button>}
    </ModalFooter>
  ), [isPrintable, label, onCancel, onConfirm, slipData, slipTemplate, testId]);

  const messageParts = message.map(m => <p key={m}>{m}</p>);

  return (
    <Modal
      data-test-confirm-status-modal
      dismissible
      onClose={onConfirm}
      open={open}
      id={testId}
      label={label}
      scope="module"
      size="small"
      footer={footer}
    >
      {messageParts}
      <Row>
        <Col xs>
          <Checkbox
            name="printSlip"
            data-test-print-slip-checkbox
            label={<FormattedMessage id="ui-checkin.statusModal.printSlip" />}
            onChange={() => setIsPrintable(!isPrintable)}
            checked={isPrintable}
            value={isPrintable + ''}
          />
        </Col>
      </Row>
    </Modal>
  );
};

ConfirmStatusModal.propTypes = {
  label: PropTypes.node.isRequired,
  message: PropTypes.node.isRequired,
  onConfirm: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
  onCancel: PropTypes.func.isRequired,
  slipTemplate: PropTypes.string,
  slipData: PropTypes.object,
  isPrintable: PropTypes.bool,
};

export default ConfirmStatusModal;
