import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl } from 'react-intl';

import {
  Button,
  Col,
  Row,
} from '@folio/stripes/components';

import css from './CheckInFooter.css';

class CheckInFooter extends React.Component {
  static propTypes = {
    handleSessionEnd: PropTypes.func.isRequired,
    intl: PropTypes.shape({
      formatMessage: PropTypes.func.isRequired,
    }).isRequired,
  };

  render() {
    const {
      handleSessionEnd,
      intl: {
        formatMessage,
      },
    } = this.props;

    return (
      <div className={css.footer}>
        <Row end="xs">
          <Col>
            <Button
              id="clickable-end-session"
              buttonStyle="primary mega"
              onClick={handleSessionEnd}
            >
              {formatMessage({ id: 'ui-checkin.endSession' })}
            </Button>
          </Col>
        </Row>
      </div>
    );
  }
}

export default injectIntl(CheckInFooter);
