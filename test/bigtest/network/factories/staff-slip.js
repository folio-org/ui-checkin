import { Factory, faker } from '@bigtest/mirage';

export default Factory.extend({
  id: faker.random.uuid,
  name: faker.random.arrayElement(['Hold', 'Transit']),
  active: true,
  template: '<p>{{Barcode}}</p>',
});
