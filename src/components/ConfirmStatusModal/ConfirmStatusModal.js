import uniqueId from 'lodash/uniqueId';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import PropTypes from 'prop-types';
import ReactToPrint from 'react-to-print';
import HtmlToReact, { Parser } from 'html-to-react';
import Barcode from 'react-barcode';
import {
  Modal,
  Button,
  Checkbox,
  Row,
  Col
} from '@folio/stripes/components';
// eslint-disable-next-line import/no-extraneous-dependencies
import mfCss from '@folio/stripes-components/lib/ModalFooter/ModalFooter.css';

import { template } from '../../util';
import css from './ConfirmStatusModal.css';

class ConfirmStatusModal extends React.Component {
  static propTypes = {
    label: PropTypes.node.isRequired,
    message: PropTypes.node.isRequired,
    onConfirm: PropTypes.func.isRequired,
    open: PropTypes.bool.isRequired,
    slipTemplate: PropTypes.string,
    slipData: PropTypes.object,
  };

  constructor(props) {
    super(props);
    this.printContentRef = React.createRef();
    this.state = { printSlip: true };

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
    const {
      onConfirm,
      open,
      slipTemplate = '',
      slipData,
      label,
      message,
    } = this.props;
    const { printSlip } = this.state;

    const testId = uniqueId('confirm-status-');
    const printSlipLabel = (<FormattedMessage id="ui-checkin.statusModal.printSlip" />);
    const closeLabel = (<FormattedMessage id="ui-checkin.statusModal.close" />);
    const tmpl = template(slipTemplate);
    const componentStr = tmpl(slipData);
    const contentComponent = this.parser.parseWithInstructions(componentStr, () => true, this.rules);
    const footer = (
      <div className={mfCss.modalFooterButtons}>
        {printSlip ?
          <ReactToPrint
            onBeforePrint={onConfirm}
            trigger={() => <Button buttonStyle="primary" buttonClass={mfCss.modalFooterButton}>{closeLabel}</Button>}
            content={() => this.printContentRef.current}
          /> :
          <Button
            label={label}
            onClick={onConfirm}
            id={`clickable-${testId}-confirm`}
            buttonStyle="primary"
            buttonClass={mfCss.modalFooterButton}
          >
            {closeLabel}
          </Button>
        }
      </div>
    );

    return (
      <Modal
        open={open}
        id={testId}
        label={label}
        scope="module"
        size="small"
        footer={footer}
      >
        <p>{message}</p>
        <Row>
          <Col xs>
            <Checkbox
              name="printSlip"
              label={printSlipLabel}
              onChange={() => this.setState(prevState => ({ printSlip: !prevState.printSlip }))}
              checked={this.state.printSlip}
              value={this.state.printSlip + ''}
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

export default ConfirmStatusModal;
