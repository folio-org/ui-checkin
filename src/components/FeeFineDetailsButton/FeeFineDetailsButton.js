import React from 'react';
import PropTypes from 'prop-types';
import {
  FormattedMessage,
} from 'react-intl';

import {
  Button,
} from '@folio/stripes/components';

class FeeFineDetailsButton extends React.Component {
  static propTypes = {
    userId: PropTypes.string,
    itemId: PropTypes.string,
    mutator: PropTypes.shape({
      accounts: PropTypes.shape({
        GET: PropTypes.func.isRequired,
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
          feeFinesCount: feeFines.totalRecords,
        });

        if (feeFines.totalRecords === 1) {
          this.setState({
            feeFineId: feeFines.accounts[0].id,
          });
        }
      });
    }
  }

  componentWillUnmount() {
    if (this._asyncRequest) {
      this._asyncRequest.cancel();
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
      feeFinesCount,
      feeFineId,
    } = this.state;

    if (this.isDisabled()) {
      return '#';
    }

    if (feeFinesCount === 1) {
      return `/users/${userId}/accounts/view/${feeFineId}`;
    }

    return `/users/${userId}/accounts/open`;
  };

  isDisabled = () => {
    const {
      userId,
      itemId,
    } = this.props;
    const {
      feeFinesCount,
    } = this.state;

    return !userId || !itemId || !feeFinesCount;
  };

  render() {
    return (
      <div data-test-fee-fine-details>
        <Button
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

export default FeeFineDetailsButton;
