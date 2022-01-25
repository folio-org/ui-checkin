import { Factory, trait } from 'miragejs';
import faker from 'faker';

export default Factory.extend({
  title: () => faker.company.catchPhrase(),
  barcode: () => (Math.floor(Math.random() * 9000000000000) + 1000000000000).toString(),
  instanceId: () => faker.random.uuid(),
  callNumber: () => Math.floor(Math.random() * 90000000) + 10000000,
  holdingsRecordId: () => faker.random.uuid(),

  materialType: () => {
    return { name: faker.random.word() };
  },

  status: () => {
    return { name: 'Available' };
  },

  location: () => {
    return { name: faker.random.word() };
  },

  withLoan: trait({
    afterCreate(item, server) {
      server.create('loan', 'withUser', {
        item
      });
    }
  }),

  withLoanClaimReturned: trait({
    afterCreate(item, server) {
      server.create('loan', 'withUser', {
        item,
        status: { name: 'Open' },
        lostItemPolicyId: 1,
      });
    }
  })

});


