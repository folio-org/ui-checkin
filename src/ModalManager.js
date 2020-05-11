import {
  get,
  orderBy,
  upperFirst,
} from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import SafeHTMLMessage from '@folio/react-intl-safe-html';
import {
  FormattedMessage,
  injectIntl,
  FormattedDate,
  FormattedTime,
} from 'react-intl';
import { ConfirmationModal } from '@folio/stripes/components';

import CheckinNoteModal from './components/CheckinNoteModal';
import ClaimedReturnedModal from './components/ClaimedReturnedModal';
import MultipieceModal from './components/MultipieceModal';
import { statuses } from './consts';
import { getFullName } from './util';

import css from './ModalManager.css';

class ModalManager extends React.Component {
  static propTypes = {
    intl: PropTypes.object,
    checkedinItem: PropTypes.object.isRequired,
    checkinNotesMode: PropTypes.bool,
    claimedReturnedHandler: PropTypes.func,
    onDone: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);

    const { checkedinItem, checkinNotesMode } = props;
    this.state = { checkedinItem, checkinNotesMode };
    this.steps = [
      {
        validate: this.shouldClaimedReturnedModalBeShown,
        exec: () => this.setState({ showClaimedReturnedModal: true }),
      },
      {
        validate: this.shouldWithdrawnModalBeShown,
        exec: () => this.setState({ showWithdrawnModal: true }),
      },
      {
        validate: this.shouldDeclaredLostModalBeShown,
        exec: () => this.setState({ showDeclaredLostModal: true }),
      },
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

  shouldClaimedReturnedModalBeShown = () => {
    const { checkedinItem } = this.state;
    return get(checkedinItem, 'status.name') === statuses.CLAIMED_RETURNED;
  }
  
  shouldWithdrawnModalBeShown = () => {
    const { checkedinItem } = this.state;
    return checkedinItem?.status?.name === statuses.WITHDRAWN;
  }

  shouldDeclaredLostModalBeShown = () => {
    const { checkedinItem } = this.state;
    return get(checkedinItem, 'status.name') === statuses.DECLARED_LOST;
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

  confirmClaimedReturnedModal = (resolution) => {
    this.props.claimedReturnedHandler(resolution);
    this.setState({ showClaimedReturnedModal: false }, () => this.execSteps(1));
  }

  confirmWithdrawnModal = () => {
    this.setState({ showWithdrawnModal: false }, () => this.execSteps(2));
  }

  confirmDeclareLostModal = () => {
    this.setState({ showDeclaredLostModal: false }, () => this.execSteps(3));
  }

  confirmMultipieceModal = () => {
    this.setState({ showMultipieceModal: false }, () => this.execSteps(4));
  }

  confirmMissingModal = () => {
    this.setState({ showMissingModal: false }, () => this.execSteps(5));
  }

  confirmCheckinNoteModal = () => {
    this.setState({ showCheckinNoteModal: false }, () => this.props.onDone());
  }

  onCancel = () => {
    this.setState({
      showCheckinNoteModal: false,
      showClaimedReturnedModal: false,
      checkinNotesMode: false,
      showMissingModal: false,
      showMultipieceModal: false,
      showDeclaredLostModal: false,
      showWithdrawnModal: false,
    });

    this.props.onCancel();
  }

  renderClaimedReturnedModal() {
    const {
      checkedinItem,
      showClaimedReturnedModal,
    } = this.state;

    return (
      <ClaimedReturnedModal
        item={checkedinItem}
        open={showClaimedReturnedModal}
        onCancel={this.onCancel}
        onConfirm={this.confirmClaimedReturnedModal}
      />
    );
  }

  getItemValues = (item) => {
    const {
      barcode,
      title,
      materialType,
    } = item;

    return {
      title,
      barcode,
      materialType: upperFirst(materialType?.name ?? ''),
    };
  }

  renderConfirmStatusModal = (isOpen, status, messageId, onConfirm) => {
    const { checkedinItem } = this.state;

    return (
      <ConfirmationModal
        id={`test-${status}-modal`}
        open={isOpen}
        item={checkedinItem}
        heading={<FormattedMessage id={`ui-checkin.${status}Modal.heading`} />}
        message={<SafeHTMLMessage
          id={messageId}
          values={this.getItemValues(checkedinItem)}
        />}
        onConfirm={onConfirm}
        onCancel={this.onCancel}
        confirmLabel={<FormattedMessage id="ui-checkin.statusModal.confirm" />}
      />
    );
  }

  renderWithdrawnModal() {
    const {
      showWithdrawnModal,
      checkedinItem,
    } = this.state;
    const messageId = checkedinItem.discoverySuppress ?
      'ui-checkin.withdrawnModal.suppressedMessage' :
      'ui-checkin.withdrawnModal.notSuppressedMessage';

    return this.renderConfirmStatusModal(
      showWithdrawnModal,
      'withdrawn',
      messageId,
      this.confirmWithdrawnModal,
    );
  }

  renderDeclaredLostModal() {
    const { showDeclaredLostModal } = this.state;
    const messageId = 'ui-checkin.declaredLostModal.message';

    return this.renderConfirmStatusModal(
      showDeclaredLostModal,
      'declaredLost',
      messageId,
      this.confirmDeclareLostModal,
    );
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
    const { intl: { formatMessage } } = this.props;
    const {
      checkedinItem,
      showMissingModal,
    } = this.state;
    const {
      title,
      barcode,
      discoverySuppress,
    } = checkedinItem;
    const discoverySuppressMessage = discoverySuppress
      ? formatMessage({ id:'ui-checkin.missingModal.discoverySuppress' })
      : '';
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
    const {
      title,
      barcode,
    } = checkedinItem;
    const checkinNotesArray = get(checkedinItem, 'circulationNotes', [])
      .filter(noteObject => noteObject.noteType === 'Check in');
    const notesSorted = orderBy(checkinNotesArray, 'date', 'desc');

    const formatter = {
      date: checkinItem => (
        <div
          data-test-check-in-note-date
          className={css.alignTop}
        >
          <FormattedDate value={checkinItem.date} />
          <br />
          <FormattedTime value={checkinItem.date} />
        </div>
      ),
      note: checkinItem => <div data-test-check-in-note-name>{checkinItem.note}</div>,
      source: checkinItem => (
        <div
          data-test-check-in-note-source
          className={css.alignTop}
        >
          {getFullName(checkinItem.source)}
        </div>),
    };
    const columnMapping = {
      date: <FormattedMessage id="ui-checkin.date" />,
      note: <FormattedMessage id="ui-checkin.note" />,
      source: <FormattedMessage id="ui-checkin.source" />,
    };
    const visibleColumns = ['date', 'note', 'source'];
    const columnWidths = {
      date : '25%',
      note : '50%',
      source : '25%',
    };
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
          count: notesSorted.length
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
        notes={notesSorted}
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
      showClaimedReturnedModal,
      showMissingModal,
      showCheckinNoteModal,
      showMultipieceModal,
      showDeclaredLostModal,
      showWithdrawnModal
    } = this.state;

    return (
      <>
        {showClaimedReturnedModal && this.renderClaimedReturnedModal()}
        {showMissingModal && this.renderMissingModal()}
        {showCheckinNoteModal && this.renderCheckinNoteModal()}
        {showMultipieceModal && this.renderMultipieceModal()}
        {showDeclaredLostModal && this.renderDeclaredLostModal()}
        {showWithdrawnModal && this.renderWithdrawnModal()}
      </>
    );
  }
}

export default injectIntl(ModalManager);
