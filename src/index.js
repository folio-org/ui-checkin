import React from 'react';
import PropTypes from 'prop-types';
import { Switch, Route } from 'react-router-dom';

import Scan from './Scan';

class CheckInRouting extends React.Component {
  static propTypes = {
    stripes: PropTypes.shape({
      connect: PropTypes.func.isRequired,
    }).isRequired,
    location: PropTypes.shape({
      pathname: PropTypes.string.isRequired,
    }).isRequired,
    match: PropTypes.shape({
      path: PropTypes.string.isRequired,
    }).isRequired,
  };

  constructor(props) {
    super(props);
    this.connectedApp = props.stripes.connect(Scan);
  }

  NoMatch() {
    return (
      <div data-testid="noMatch">
        <h2>Uh-oh!</h2>
        <p>
          How did you get to
          {' '}
          <tt>{this.props.location.pathname}</tt>
          ?
        </p>
      </div>
    );
  }

  render() {
    const { match: { path } } = this.props;

    return (
      <Switch>
        <Route
          path={`${path}`}
          render={() => <this.connectedApp {...this.props} />}
        />
        <Route component={() => this.NoMatch()} />
      </Switch>
    );
  }
}

export default CheckInRouting;
