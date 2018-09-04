import { Factory, faker, trait } from '@bigtest/mirage';

export default Factory.extend({
  systemReturnDate: () => faker.date.recent().toISOString(),

  withUser: trait({
    afterCreate(loan, server) {
      const user = server.create('user');
      loan.user = user;
      loan.save();
    }
  })
});
