import {
  get,
  orderBy,
  upperFirst,
  includes,
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
import {
  statuses,
  statusMessages,
} from './consts';
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
        validate: this.shouldConfirmStatusModalBeShown,
        exec: () => this.setState({ showConfirmModal: true }),
      },
      {
        validate: this.shouldMultipieceModalBeShown,
        exec: () => this.setState({ showMultipieceModal: true }),
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

  shouldConfirmStatusModalBeShown = () => {
    const { checkedinItem } = this.state;

    return includes([
      statuses.WITHDRAWN,
      statuses.DECLARED_LOST,
      statuses.MISSING,
      statuses.LOST_AND_PAID,
      statuses.AGED_TO_LOST,
    ], checkedinItem?.status?.name);
  }

  shouldClaimedReturnedModalBeShown = () => {
    const { checkedinItem } = this.state;

    return checkedinItem?.status?.name === statuses.CLAIMED_RETURNED;
  }

  shouldCheckinNoteModalBeShown = () => {
    const { checkedinItem } = this.state;

    return get(checkedinItem, 'circulationNotes', [])
      .some(note => note.noteType === statuses.CHECK_IN);
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

  confirmMultipieceModal = () => {
    this.setState({ showMultipieceModal: false }, () => this.execSteps(3));
  }

  confirmCheckinNoteModal = () => {
    this.setState({ showCheckinNoteModal: false }, () => this.props.onDone());
  }

  onConfirm = () => {
    this.setState({ showConfirmModal: false }, () => this.execSteps(2));
  }

  onCancel = () => {
    this.setState({
      showCheckinNoteModal: false,
      showClaimedReturnedModal: false,
      checkinNotesMode: false,
      showMultipieceModal: false,
      showConfirmModal: false,
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

  renderConfirmModal() {
    const { intl: { formatMessage } } = this.props;
    const {
      checkedinItem,
      showConfirmModal,
    } = this.state;
    const {
      title,
      barcode,
      discoverySuppress,
      status: { name },
    } = checkedinItem;
    const materialType = upperFirst(checkedinItem?.materialType?.name ?? '');
    const discoverySuppressMessage = discoverySuppress
      ? formatMessage({ id:'ui-checkin.confirmModal.discoverySuppress' })
      : '';
    const status = formatMessage({ id: statusMessages[name] });
    const message = (
      <SafeHTMLMessage
        id="ui-checkin.confirmModal.message"
        values={{
          title,
          barcode,
          status,
          discoverySuppressMessage,
          materialType,
        }}
      />
    );

    return (
      <ConfirmationModal
        open={showConfirmModal}
        heading={<FormattedMessage id="ui-checkin.confirmModal.heading" values={{ status }} />}
        onConfirm={this.onConfirm}
        onCancel={this.onCancel}
        cancelLabel={<FormattedMessage id="ui-checkin.confirmModal.cancel" />}
        confirmLabel={<FormattedMessage id="ui-checkin.confirmModal.confirm" />}
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
      showCheckinNoteModal,
      showMultipieceModal,
      showConfirmModal,
    } = this.state;

    return (
      <>
        {showClaimedReturnedModal && this.renderClaimedReturnedModal()}
        {showConfirmModal && this.renderConfirmModal()}
        {showMultipieceModal && this.renderMultipieceModal()}
        {showCheckinNoteModal && this.renderCheckinNoteModal()}
      </>
    );
  }
}

export default injectIntl(ModalManager);
