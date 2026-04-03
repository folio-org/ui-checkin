import React from 'react';
import PropTypes from 'prop-types';
import {
  FormattedMessage,
} from 'react-intl';

class FeesFinesOwnedStatus extends React.Component {
  static propTypes = {
    userId: PropTypes.string,
    itemId: PropTypes.string,
    loanId: PropTypes.string,
    mutator: PropTypes.shape({
      accounts: PropTypes.shape({
        GET: PropTypes.func.isRequired,
        cancel: PropTypes.func.isRequired,
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
    this.fetchFeesFinesStatus();
  }

  componentDidUpdate(prevProps) {
    const {
      userId,
      itemId,
      loanId,
      mutator,
    } = this.props;

    if (
      userId !== prevProps.userId ||
      itemId !== prevProps.itemId ||
      loanId !== prevProps.loanId
    ) {
      mutator.accounts.cancel();

      this.setState({ showFeesFinesOwnedStatus: false }, () => {
        this.fetchFeesFinesStatus();
      });
    }
  }

  componentWillUnmount() {
    if (this._asyncRequest) {
      this.props.mutator.accounts.cancel();
    }
  }

  fetchFeesFinesStatus = () => {
    const {
      userId,
      itemId,
      loanId,
      mutator,
    } = this.props;

    if (userId && itemId) {
      const query = `(userId==${userId} and itemId==${itemId} and loanId==${loanId}) and status.name=="Open"`;

      this._asyncRequest = mutator.accounts.GET({ params: { query } }).then((feeFines) => {
        this._asyncRequest = null;
        this.setState({
          showFeesFinesOwnedStatus: !!feeFines.totalRecords,
        });
      });
    }
  }

  render() {
    const {
      showFeesFinesOwnedStatus,
    } = this.state;

    return (
      <div data-test-fee-fine-owned-status>
        { showFeesFinesOwnedStatus
          ? <FormattedMessage id="ui-checkin.feesFinesOwed" />
          : null
        }
      </div>
    );
  }
}

export default FeesFinesOwnedStatus;
