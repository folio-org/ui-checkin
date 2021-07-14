import React from 'react';
import PropTypes from 'prop-types';
import {
  FormattedMessage,
} from 'react-intl';

import {
  Button,
  Col,
  Row,
} from '@folio/stripes/components';

import css from './CheckInFooter.css';

class CheckInFooter extends React.Component {
  static propTypes = {
    handleSessionEnd: PropTypes.func.isRequired,
  };

  render() {
    const {
      handleSessionEnd,
    } = this.props;

    return (
      <div className={css.footer}>
        <Row>
          <Col
            xsOffset={8}
            xs={4}
          >
            <Row end="xs">
              <Button
                id="clickable-end-session"
                buttonStyle="primary mega"
                onClick={handleSessionEnd}
              >
                <FormattedMessage id="ui-checkin.endSession" />
              </Button>
            </Row>
          </Col>
        </Row>
      </div>
    );
  }
}

export default CheckInFooter;
