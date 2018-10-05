import React from 'react';
import { intlShape } from 'react-intl';
import PropTypes from 'prop-types';
import uniqueId from 'lodash/uniqueId';
import ReactToPrint from 'react-to-print';
import HtmlToReact, { Parser } from 'html-to-react';
import Barcode from 'react-barcode';
import SafeHTMLMessage from '@folio/react-intl-safe-html';
import { injectIntl } from 'react-intl';
import {
  Modal,
  Button,
  Checkbox,
  Row,
  Col
} from '@folio/stripes/components';

import { template } from '../../util';
import css from './ConfirmStatusModal.css';

class ConfirmStatusModal extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    onCancel: PropTypes.func.isRequired,
    onConfirm: PropTypes.func.isRequired,
    open: PropTypes.bool.isRequired,
    request: PropTypes.object,
    holdSlipTemplate: PropTypes.string,
  };

  constructor(props) {
    super(props);
    this.printContentRef = React.createRef();
    this.state = {};

    const processNodeDefinitions = new HtmlToReact.ProcessNodeDefinitions(React);
    this.rules = [
      {
        replaceChildren: true,
        shouldProcessNode: node => node.name === 'barcode',
        processNode: (node, children) => (<Barcode value={children[0] ? children[0].trim() : ' '} />),
      },
      {
        shouldProcessNode: () => true,
        processNode: processNodeDefinitions.processDefaultNode,
      }
    ];

    this.parser = new Parser();
  }

  render() {
    const { intl, request, onConfirm, onCancel, open, holdSlipTemplate } = this.props;
    const { printSlip } = this.state;
    const testId = uniqueId('confirm-status-');
    const cancelLabel = intl.formatMessage({ id: 'ui-checkin.statusModal.back' });
    const confirmLabel = intl.formatMessage({ id: 'ui-checkin.statusModal.confirm' });
    const heading = intl.formatMessage({ id: 'ui-checkin.statusModal.heading' });
    const printHoldSlipLabel = intl.formatMessage({ id: 'ui-checkin.statusModal.printHoldSlip' });

    const data = {
      'Item title': request.item.title,
      'Item barcode': `<Barcode>${request.item.barcode}</Barcode>`,
      'Transaction Id': request.id,
      'Requester last name': request.requester.lastName,
      'Requester first name': request.requester.firstName,
      'Hold expiration': request.requestDate,
      'Item call number': request.itemId,
    };

    const tmpl = template(holdSlipTemplate || '');
    const componentStr = tmpl(data);
    const contentComponent = this.parser.parseWithInstructions(componentStr, () => true, this.rules);
    const footer = (
      <Row>
        <Col xs>
          {printSlip ?
            <ReactToPrint
              onBeforePrint={onConfirm}
              trigger={() => <Button buttonStyle="primary">{confirmLabel}</Button>}
              content={() => this.printContentRef.current}
            /> :
            <Button
              label={confirmLabel}
              onClick={onConfirm}
              id={`clickable-${testId}-confirm`}
              buttonStyle="primary"
            >
              {confirmLabel}
            </Button>
          }
          <Button
            label={cancelLabel}
            onClick={onCancel}
            id={`clickable-${testId}-cancel`}
            buttonStyle="default"
          >
            {cancelLabel}
          </Button>
        </Col>
      </Row>
    );

    return (
      <Modal
        open={open}
        id={testId}
        label={heading}
        scope="module"
        size="small"
        footer={footer}
      >
        <p>
          <SafeHTMLMessage
            id="ui-checkin.statusModal.message"
            values={{ title: request.item.title, barcode: request.item.barcode }}
          />
        </p>
        <Row>
          <Col xs>
            <Checkbox
              name="printSlip"
              label={printHoldSlipLabel}
              onChange={() => this.setState(prevState => ({ printSlip: !prevState.printSlip }))}
              value={this.state.printSlip}
            />
          </Col>
        </Row>

        <div className={css.hiddenContent}>
          <div className="ql-editor" ref={this.printContentRef}>
            {contentComponent}
          </div>
        </div>
      </Modal>
    );
  }
}

export default injectIntl(ConfirmStatusModal);
