import ApplicationSerializer from './application';

export default ApplicationSerializer.extend({
  embed: true,
  include: ['item', 'user'],

  serialize(...args) {
    const json = ApplicationSerializer.prototype.serialize.apply(this, args);
    json.loan.userId = json.loan.user.id;
    json.loan.itemId = json.loan.item.id;
    return json;
  }
});
