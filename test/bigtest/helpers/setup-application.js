import { beforeEach } from '@bigtest/mocha';
import { setupAppForTesting, visit, location } from '@bigtest/react';
import App from '@folio/stripes-core/src/App';
import * as stripes from 'stripes-config';
import startMirage from '../network/start';

// load these styles for our tests
import 'typeface-source-sans-pro'; // eslint-disable-line import/no-extraneous-dependencies
import '@folio/stripes-components/lib/global.css';

export default function setupApplication({
  disableAuth = true,
  scenarios
} = {}) {
  beforeEach(async function () {
    this.app = await setupAppForTesting(App, {
      mountId: 'testing-root',

      props: {
        disableAuth
      },

      setup: () => {
        this.server = startMirage(scenarios);
        this.server.logging = false;
        Object.assign(stripes.config, { logCategories: '' });
      },

      teardown: () => {
        this.server.shutdown();
      }
    });

    // set the root to 100% height
    document.getElementById('testing-root').style.height = '100%';

    // setup react helpers
    Object.defineProperties(this, {
      visit: { value: visit },
      location: { get: location }
    });
  });
}
