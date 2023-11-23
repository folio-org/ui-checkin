import React from 'react';
import PropTypes from 'prop-types';
import {
  FormattedMessage,
} from 'react-intl';

import {
  Button,
} from '@folio/stripes/components';

const FEE_FINES_STATUSES = {
  open: 'Open',
  closed: 'Closed',
};

class FeeFineDetailsButton extends React.Component {
  static propTypes = {
    isVirtualUser: PropTypes.bool,
    userId: PropTypes.string,
    itemId: PropTypes.string,
    mutator: PropTypes.shape({
      accounts: PropTypes.shape({
        GET: PropTypes.func.isRequired,
        cancel: PropTypes.func.isRequired,
      }).isRequired,
      query: PropTypes.shape({
        update: PropTypes.func.isRequired,
      }).isRequired,
    }).isRequired,
  }

  constructor(props) {
    super(props);

    this.state = {
      feeFinesCount: null,
      feeFineId: null,
      feeFinesStatusToRedirect: null,
    };
  }

  componentDidMount() {
    const {
      userId,
      itemId,
      mutator,
    } = this.props;

    if (userId && itemId) {
      const query = `(userId==${userId} and itemId==${itemId}) AND (status.name=="${FEE_FINES_STATUSES.open}" OR status.name=="${FEE_FINES_STATUSES.closed}")`;

      this._asyncRequest = mutator.accounts.GET({ params: { query } }).then((feeFines) => {
        this._asyncRequest = null;
        this.setState({
          feeFinesCount: feeFines.totalRecords,
        });

        const openFeeFines = feeFines.accounts.filter(item => item.status.name === FEE_FINES_STATUSES.open);
        const closedFeeFines = feeFines.accounts.filter(item => item.status.name === FEE_FINES_STATUSES.closed);

        if (openFeeFines.length > 1) {
          this.setState({ feeFinesStatusToRedirect: 'open' });
        } else if (openFeeFines.length === 1) {
          this.setState({
            feeFineId: openFeeFines[0].id,
          });
        } else if (closedFeeFines.length > 1) {
          this.setState({ feeFinesStatusToRedirect: 'closed' });
        } else if (closedFeeFines.length === 1) {
          this.setState({
            feeFineId: closedFeeFines[0].id,
          });
        }
      });
    }
  }

  componentWillUnmount() {
    if (this._asyncRequest) {
      this.props.mutator.accounts.cancel();
    }
  }

  onClick = (event) => {
    event.preventDefault();
    event.stopPropagation();

    const {
      mutator,
    } = this.props;

    mutator.query.update({
      _path: this.getPath(),
    });
  };

  getPath = () => {
    const {
      userId,
    } = this.props;
    const {
      feeFineId,
    } = this.state;

    if (this.isDisabled()) {
      return '#';
    }

    if (this.state.feeFineId) {
      return `/users/${userId}/accounts/view/${feeFineId}`;
    }

    return `/users/${userId}/accounts/${this.state.feeFinesStatusToRedirect}`;
  };

  isDisabled = () => {
    const {
      userId,
      itemId,
      isVirtualUser,
    } = this.props;
    const {
      feeFinesCount,
    } = this.state;

    return isVirtualUser || !userId || !itemId || !feeFinesCount;
  };

  render() {
    if (this.isDisabled()) {
      return null;
    }

    return (
      <div data-test-fee-fine-details>
        <Button
          data-test-button
          disabled={this.isDisabled()}
          role="menuitem"
          buttonStyle="dropdownItem"
          href={this.getPath()}
          onClick={(event) => this.onClick(event)}
        >
          <FormattedMessage
            id="ui-checkin.feeFineDetails"
          />
        </Button>
      </div>
    );
  }
}

FeeFineDetailsButton.defaultProps = {
  isVirtualUser: false,
};

export default FeeFineDetailsButton;
