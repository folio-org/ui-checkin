
import { omit } from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import ReactToPrint from 'react-to-print';
import {
  Button,
} from '@folio/stripes/components';

import ComponentToPrint from '../ComponentToPrint';
// eslint-disable-next-line import/no-webpack-loader-syntax
import '!style-loader!css-loader!./quillEditor.css';
import css from './PrintButton.css';

class PrintButton extends React.Component {
  static propTypes = {
    dataSource: PropTypes.object,
    template: PropTypes.string,
    onBeforePrint: PropTypes.func,
  };

  constructor(props) {
    super(props);
    this.printContentRef = React.createRef();
  }

  render() {
    const {
      dataSource,
      template,
      onBeforePrint,
      children,
    } = this.props;

    const btnProps = omit(this.props, ['dataSource', 'template', 'onBeforePrint']);

    return (
      <React.Fragment>
        <ReactToPrint
          onBeforePrint={onBeforePrint}
          trigger={() => <Button {...btnProps}>{children}</Button>}
          content={() => this.printContentRef.current}
        />
        <div className={css.hiddenContent}>
          <div className="ql-editor" ref={this.printContentRef}>
            <ComponentToPrint template={template} dataSource={dataSource} />
          </div>
        </div>
      </React.Fragment>
    );
  }
}

export default PrintButton;
