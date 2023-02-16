import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';

import {
  render,
  screen,
} from '@testing-library/react';

import '../test/jest/__mock__';

import CheckInRouting from './index';

const testIds = {
  scanComponent: 'scan-component',
};

jest.mock('./Scan', () => () => <div data-testid={testIds.scanComponent}>Scan</div>);

describe('UI CheckIn', () => {
  const renderCheckIn = () => {
    const component = (
      <Router>
        <CheckInRouting
          stripes={{
            connect: (item) => item,
          }}
          match={{
            path: '/checkin',
            url: '/checkin',
            isExact: true,
            params: {},
          }}
          location={{
            pathname: '/checkin',
            search: '',
            hash: '',
          }}
        />
      </Router>
    );

    return render(component);
  };

  it('should render', () => {
    expect(renderCheckIn()).toBeDefined();
  });

  it('should render checkin route', () => {
    window.history.pushState({}, '', '/checkin');

    renderCheckIn();

    expect(screen.getByTestId(testIds.scanComponent)).toBeInTheDocument();
  });
});
