
import React from 'react';
import PropTypes from 'prop-types';
import ReactToPrint from 'react-to-print';
import {
  Button,
} from '@folio/stripes/components';

import ComponentToPrint from '../ComponentToPrint';
import css from './PrintButton.css';

class PrintButton extends React.Component {
  static propTypes = {
    data: PropTypes.object,
    template: PropTypes.string,
    onBeforePrint: PropTypes.func,
  };

  constructor(props) {
    super(props);
    this.printContentRef = React.createRef();
  }

  render() {
    const {
      data,
      template,
      onBeforePrint,
      children,
    } = this.props;

    return (
      <React.Fragment>
        <ReactToPrint
          onBeforePrint={onBeforePrint}
          trigger={() => <Button {...this.props}>{children}</Button>}
          content={() => this.printContentRef.current}
        />
        <div className={css.hiddenContent}>
          <div className="ql-editor" ref={this.printContentRef}>
            <ComponentToPrint template={template} data={data} />
          </div>
        </div>
      </React.Fragment>
    );
  }
}

export default PrintButton;
