import React from 'react';
import PropTypes from 'prop-types';
import {
  FormattedMessage,
} from 'react-intl';

class FeesFinesOwnedStatus extends React.Component {
  static propTypes = {
    userId: PropTypes.string,
    itemId: PropTypes.string,
    mutator: PropTypes.shape({
      accounts: PropTypes.shape({
        GET: PropTypes.func.isRequired,
      }).isRequired,
    }).isRequired,
  }

  constructor(props) {
    super(props);

    this.state = {
      showFeesFinesOwnedStatus: false,
    };
  }

  componentDidMount() {
    const {
      userId,
      itemId,
      mutator,
    } = this.props;

    if (userId && itemId) {
      const query = `(userId==${userId} and itemId==${itemId}) and status.name=="Open"`;

      this._asyncRequest = mutator.accounts.GET({ params: { query } }).then((feeFines) => {
        this._asyncRequest = null;
        this.setState({
          showFeesFinesOwnedStatus: !!feeFines.totalRecords,
        });
      });
    }
  }

  componentWillUnmount() {
    if (this._asyncRequest) {
      this._asyncRequest.cancel();
    }
  }

  render() {
    const {
      showFeesFinesOwnedStatus,
    } = this.state;

    return (
      <div data-test-fee-fine-owned-status>
        { showFeesFinesOwnedStatus
          ? <FormattedMessage id="ui-checkin.feesFinesOwned" />
          : null
        }
      </div>
    );
  }
}

export default FeesFinesOwnedStatus;
