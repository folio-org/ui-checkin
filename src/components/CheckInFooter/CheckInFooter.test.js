import {
  fireEvent,
  render,
  screen,
} from '@folio/jest-config-stripes/testing-library/react';

import { runAxeTest } from '@folio/stripes-testing';

import CheckInFooter from './CheckInFooter';

describe('CheckInFooter', () => {
  const handleSessionEnd = jest.fn();
  const labelIds = {
    endSession: 'ui-checkin.endSession',
  };
  const defaultProps = {
    handleSessionEnd,
  };

  beforeEach(() => {
    render(<CheckInFooter {...defaultProps} />);
  });

  it('should render with no axe errors', async () => {
    await runAxeTest({
      rootNode: document.body,
    });
  });

  it('should render "endSession" button', () => {
    expect(screen.getByText(labelIds.endSession)).toBeVisible();
  });

  it('should execute "handleSessionEnd" event on click', () => {
    fireEvent.click(screen.getByRole('button'));

    expect(handleSessionEnd).toHaveBeenCalled();
  });
});
