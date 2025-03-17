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
    dataSource: PropTypes.arrayOf(PropTypes.object),
    template: PropTypes.string,
    onBeforePrint: PropTypes.func,
    onAfterPrint: PropTypes.func,
    children: PropTypes.node,
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
      onAfterPrint,
      children,
    } = this.props;

    const btnProps = omit(this.props, ['dataSource', 'template', 'onBeforePrint', 'onAfterPrint']);

    return (
      <>
        <ReactToPrint
          removeAfterPrint
          trigger={() => <Button {...btnProps}>{children}</Button>}
          content={() => this.printContentRef.current}
          onBeforePrint={onBeforePrint}
          onAfterPrint={onAfterPrint}
        />
        <div className={css.hiddenContent}>
          <div className={`ql-editor ${css.qlEditor}`} ref={this.printContentRef}>
            {dataSource.map((source) => (
              <div key={source['item.barcode']}>
                <ComponentToPrint
                  template={template}
                  dataSource={source}
                />
              </div>
            ))}
          </div>
        </div>
      </>
    );
  }
}

export default PrintButton;
