import setupStripesCore from '@folio/stripes-core/test/bigtest/helpers/setup-application';
import mirageOptions from '../network';

export default function setupApplication({
  scenarios = ['default'],
} = {}) {
  setupStripesCore({
    mirageOptions: {
      serverType: 'miragejs',
      ...mirageOptions
    },
    scenarios,
    currentUser: {
      curServicePoint: { id: 1 },
    }
  });
}
