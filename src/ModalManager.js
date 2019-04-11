import { get, upperFirst } from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import SafeHTMLMessage from '@folio/react-intl-safe-html';
import { FormattedMessage, intlShape, injectIntl } from 'react-intl';
import { ConfirmationModal } from '@folio/stripes/components';

import CheckinNoteModal from './components/CheckinNoteModal';
import MultipieceModal from './components/MultipieceModal';
import { statuses } from './consts';

class ModalManager extends React.Component {
  static propTypes = {
    intl: intlShape,
    checkedinItem: PropTypes.object.isRequired,
    checkinNotesMode: PropTypes.bool,
    onDone: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);

    const { checkedinItem, checkinNotesMode } = props;
    this.state = { checkedinItem, checkinNotesMode };
    this.steps = [
      {
        validate: this.shouldMultipieceModalBeShown,
        exec: () => this.setState({ showMultipieceModal: true }),
      },
      {
        validate: this.shouldMissingModalBeShown,
        exec: () => this.setState({ showMissingModal: true }),
      },
      {
        validate: this.shouldCheckinNoteModalBeShown,
        exec: () => this.setState({ showCheckinNoteModal: true }),
      },
    ];
  }

  componentDidMount() {
    if (this.state.checkinNotesMode) {
      this.setState({ showCheckinNoteModal: true });
    } else {
      this.execSteps(0);
    }
  }

  execSteps(start) {
    for (let i = start; i < this.steps.length; i++) {
      const step = this.steps[i];
      if (step.validate()) {
        return step.exec();
      }
    }

    return this.props.onDone();
  }

  shouldCheckinNoteModalBeShown = () => {
    const { checkedinItem } = this.state;
    return get(checkedinItem, 'circulationNotes', [])
      .some(note => note.noteType === statuses.CHECK_IN);
  }

  shouldMissingModalBeShown = () => {
    const { checkedinItem } = this.state;
    return get(checkedinItem, 'status.name') === statuses.MISSING;
  }

  shouldMultipieceModalBeShown = () => {
    const { checkedinItem } = this.state;
    const {
      numberOfPieces,
      numberOfMissingPieces,
      descriptionOfPieces,
      missingPieces,
    } = checkedinItem;

    return (
      numberOfPieces > 1 ||
      descriptionOfPieces ||
      numberOfMissingPieces ||
      missingPieces
    );
  }

  confirmMultipieceModal = () => {
    this.setState({ showMultipieceModal: false }, () => this.execSteps(1));
  }

  confirmMissingModal = () => {
    this.setState({ showMissingModal: false }, () => this.execSteps(2));
  }

  confirmCheckinNoteModal = () => {
    this.setState({ showCheckinNoteModal: false }, () => this.props.onDone());
  }

  onCancel = () => {
    this.setState({
      showCheckinNoteModal: false,
      checkinNotesMode: false,
      showMissingModal: false,
      showMultipieceModal: false,
    });

    this.props.onCancel();
  }

  renderMultipieceModal() {
    const { checkedinItem, showMultipieceModal } = this.state;

    return (
      <MultipieceModal
        open={showMultipieceModal}
        item={checkedinItem}
        onConfirm={this.confirmMultipieceModal}
        onClose={this.onCancel}
      />
    );
  }

  renderMissingModal() {
    const { checkedinItem, showMissingModal } = this.state;
    const { intl: { formatMessage } } = this.props;
    const { title, barcode, discoverySuppress } = checkedinItem;
    const discoverySuppressMessage = discoverySuppress ?
      formatMessage({ id:'ui-checkin.missingModal.discoverySuppress' }) :
      '';
    const message = (
      <SafeHTMLMessage
        id="ui-checkin.missingModal.message"
        values={{
          title,
          barcode,
          discoverySuppressMessage,
          materialType: upperFirst(get(checkedinItem, 'materialType.name', '')),
        }}
      />
    );

    return (
      <ConfirmationModal
        data-test-missing-item-modal
        open={showMissingModal}
        heading={<FormattedMessage id="ui-checkin.missingModal.heading" />}
        onConfirm={this.confirmMissingModal}
        onCancel={this.onCancel}
        cancelLabel={<FormattedMessage id="ui-checkin.multipieceModal.cancel" />}
        confirmLabel={<FormattedMessage id="ui-checkin.multipieceModal.confirm" />}
        message={message}
      />
    );
  }

  renderCheckinNoteModal() {
    const {
      checkedinItem,
      showCheckinNoteModal,
      checkinNotesMode,
    } = this.state;
    const { title, barcode } = checkedinItem;
    const checkinNotesArray = get(checkedinItem, 'circulationNotes', [])
      .filter(noteObject => noteObject.noteType === 'Check in');

    const notes = checkinNotesArray.map(checkinNoteObject => {
      const { note } = checkinNoteObject;
      return { note };
    });

    const formatter = { note: checkinItem => `${checkinItem.note}` };
    const columnMapping = { note: <FormattedMessage id="ui-checkin.note" /> };
    const visibleColumns = ['note'];
    const columnWidths = { note : '100%' };
    const id = checkinNotesMode ?
      'ui-checkin.checkinNotes.message' :
      'ui-checkin.checkinNoteModal.message';
    const heading = checkinNotesMode ?
      <FormattedMessage id="ui-checkin.checkinNotes.heading" /> :
      <FormattedMessage id="ui-checkin.checkinNoteModal.heading" />;
    const cancelLabel = checkinNotesMode ?
      <FormattedMessage id="ui-checkin.close" /> :
      <FormattedMessage id="ui-checkin.multipieceModal.cancel" />;

    const message = (
      <SafeHTMLMessage
        id={id}
        values={{
          title,
          barcode,
          materialType: upperFirst(get(checkedinItem, 'materialType.name', '')),
          count: notes.length
        }}
      />
    );

    return (
      <CheckinNoteModal
        data-test-checkinNote-modal
        open={showCheckinNoteModal}
        heading={heading}
        onConfirm={this.confirmCheckinNoteModal}
        onCancel={this.onCancel}
        hideConfirm={checkinNotesMode}
        cancelLabel={cancelLabel}
        confirmLabel={<FormattedMessage id="ui-checkin.multipieceModal.confirm" />}
        notes={notes}
        formatter={formatter}
        message={message}
        columnMapping={columnMapping}
        visibleColumns={visibleColumns}
        columnWidths={columnWidths}
      />
    );
  }

  render() {
    const {
      showMissingModal,
      showCheckinNoteModal,
      showMultipieceModal,
    } = this.state;

    return (
      <React.Fragment>
        {showMissingModal && this.renderMissingModal()}
        {showCheckinNoteModal && this.renderCheckinNoteModal()}
        {showMultipieceModal && this.renderMultipieceModal()}
      </React.Fragment>
    );
  }
}

export default injectIntl(ModalManager);
