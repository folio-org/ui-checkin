import { describe, it } from '@bigtest/mocha';
import { expect } from 'chai';

import setupApplication from '../helpers/setup-application';
import { getCheckinSettings } from '../../../src/util';

describe('Utility functions', () => {
  setupApplication();

  describe('getting checkin settings', () => {
    it('returns undefined for an empty array', () => {
      expect(getCheckinSettings([])).to.equal(undefined);
    });
    it('returns parsed JSON for a valid input', () => {
      expect(getCheckinSettings([{ value:'"v1"' }])).to.equal('v1');
    });
    it('returns an empty object if there\'s an error', () => {
      expect(getCheckinSettings([{ value:'' }])).to.deep.equal({});
    });
  });
});
