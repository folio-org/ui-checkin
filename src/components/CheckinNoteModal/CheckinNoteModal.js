import { uniqueId } from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import {
  Modal,
  Button,
  MultiColumnList,
  ModalFooter,
} from '@folio/stripes/components';

import css from './CheckinNoteModal.css';

const propTypes = {
  cancelLabel: PropTypes.node,
  confirmLabel: PropTypes.node,
  columnMapping: PropTypes.shape({
    date: PropTypes.string,
    note: PropTypes.string,
    source: PropTypes.string,
  }),
  columnWidths: PropTypes.shape({
    date: PropTypes.string,
    note: PropTypes.string,
    source: PropTypes.string,
  }),
  formatter: PropTypes.shape({
    date: PropTypes.func,
    note: PropTypes.func,
    source: PropTypes.func,
  }),
  heading: PropTypes.node.isRequired,
  hideCancel: PropTypes.bool,
  hideConfirm: PropTypes.bool,
  id: PropTypes.string,
  message: PropTypes.oneOfType([
    PropTypes.node,
    PropTypes.arrayOf(PropTypes.node),
  ]),
  notes: PropTypes.arrayOf(PropTypes.shape({
    date: PropTypes.string,
    note: PropTypes.string,
    source: PropTypes.string,
  })),
  onCancel: PropTypes.func.isRequired,
  onConfirm: PropTypes.func,
  open: PropTypes.bool.isRequired,
  visibleColumns: PropTypes.arrayOf(PropTypes.string),
};

const defaultProps = {
  hideConfirm: false,
  hideCancel: false,
};

const CheckinNoteModal = (props) => {
  const cancelLabel = props.cancelLabel || <FormattedMessage id="ui-checkin.statusModal.cancel" />;
  const confirmLabel = props.confirmLabel || <FormattedMessage id="ui-checkin.statusModal.confirm" />;
  const testId = props.id || uniqueId('confirmation-');
  const {
    notes,
    formatter,
    columnMapping,
    visibleColumns,
    columnWidths,
    hideConfirm,
    hideCancel,
  } = props;
  const footer = (
    <ModalFooter>
      {
        !hideConfirm &&
        <Button
          data-test-checkin-note-modal-confirm-button
          buttonStyle="primary"
          id={`clickable-${testId}-confirm`}
          onClick={props.onConfirm}
        >
          {confirmLabel}
        </Button>
      }
      {
        !hideCancel &&
        <Button
          data-test-checkin-note-modal-cancel-button
          buttonStyle="default"
          id={`clickable-${testId}-cancel`}
          onClick={props.onCancel}
        >
          {cancelLabel}
        </Button>
      }

    </ModalFooter>
  );

  return (
    <Modal
      data-test-check-in-note-modal
      open={props.open}
      id={testId}
      dismissible
      label={props.heading}
      size="small"
      footer={footer}
      onClose={props.onCancel}
    >
      <p>{props.message}</p>
      <div className={css.root}>
        <MultiColumnList
          visibleColumns={visibleColumns}
          contentData={notes}
          fullWidth
          formatter={formatter}
          columnMapping={columnMapping}
          columnWidths={columnWidths}
          interactive={false}
        />
      </div>
    </Modal>
  );
};

CheckinNoteModal.propTypes = propTypes;
CheckinNoteModal.defaultProps = defaultProps;

export default CheckinNoteModal;
