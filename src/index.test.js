import { MemoryRouter } from 'react-router-dom';

import {
  render,
  screen,
} from '@folio/jest-config-stripes/testing-library/react';

import CheckInRouting from './index';

const testIds = {
  scanComponent: 'scan-component',
  noMatch: 'noMatch',
};
const checkinRoute = '/checkin';
const basicProps = {
  stripes: {
    connect: (component) => component,
  },
  match: {
    path: checkinRoute,
  },
  location: {
    pathname: checkinRoute,
  },
};

jest.mock('./Scan', () => () => <div data-testid={testIds.scanComponent}>Scan</div>);

describe('UI CheckIn', () => {
  describe('When route is matched', () => {
    beforeEach(() => {
      render(
        <MemoryRouter initialEntries={[checkinRoute]}>
          <CheckInRouting
            {...basicProps}
          />
        </MemoryRouter>
      );
    });

    it('should render "Scan" component', () => {
      expect(screen.getByTestId(testIds.scanComponent)).toBeInTheDocument();
    });
  });

  describe('When route is not matched', () => {
    const badRoute = '/bad-route';
    const props = {
      ...basicProps,
      match: {
        path: badRoute,
      },
      location: {
        pathname: badRoute,
      },
    };

    beforeEach(() => {
      render(
        <MemoryRouter initialEntries={[checkinRoute]}>
          <CheckInRouting
            {...props}
          />
        </MemoryRouter>
      );
    });

    it('should render "NoMatch" component', () => {
      expect(screen.getByTestId(testIds.noMatch)).toBeInTheDocument();
    });
  });
});
