import ApplicationSerializer from './application';

export default ApplicationSerializer.extend({
  embed: true,
  include: ['item', 'user'],

  serialize(...args) {
    const json = ApplicationSerializer.prototype.serialize.apply(this, args);

    json.loans.forEach((loan, i) => {
      if (loan.item) {
        json.loans[i].itemId = json.loans[i].item.id;
      }

      if (loan.user) {
        json.loans[i].userId = json.loans[i].user.id;
      }
    });

    return json;
  }
});
