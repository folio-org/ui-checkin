import CQLParser, { CQLBoolean } from './cql';

// typical mirage config export
export default function configure() {
  this.get('/accounts', {
    accounts: [],
    totalRecords: 0,
  });

  // users
  this.get('/users', ({ users }, request) => {
    if (request.queryParams.query) {
      const cqlParser = new CQLParser();
      cqlParser.parse(request.queryParams.query);
      return {
        users: users.where({
          id: cqlParser.tree.term
        })
      };
    } else {
      return { users: [] };
    }
  });

  this.get('/service-points', function (schema) {
    return schema.servicePoints.all();
  });

  this.get('/staff-slips-storage/staff-slips', (schema) => {
    return schema.staffSlips.all();
  });

  this.get('/inventory/items', ({ items }, request) => {
    if (request.queryParams.query) {
      const cqlParser = new CQLParser();
      cqlParser.parse(request.queryParams.query);
      return items.where({
        barcode: cqlParser.tree.term
      });
    } else {
      return items.all();
    }
  });

  this.get('/circulation/loans', ({ loans }, request) => {
    if (request.queryParams.query) {
      const cqlParser = new CQLParser();
      cqlParser.parse(request.queryParams.query);
      if (cqlParser.tree instanceof CQLBoolean) {
        return loans.where({
          itemId: cqlParser.tree.left.term
        });
      } else {
        return loans.where({
          itemId: cqlParser.tree.term
        });
      }
    } else {
      return loans.all();
    }
  });

  this.put('/circulation/loans/:id', (_, request) => {
    return JSON.parse(request.requestBody);
  });

  this.post('/circulation/check-in-by-barcode', ({ loans, items }, request) => {
    const params = JSON.parse(request.requestBody);
    const item = items.findBy({ barcode: params.itemBarcode });
    const loan = loans.findBy({ itemId: item.id });
    return loan;
  });

  this.get('/holdings-storage/holdings', {
    holdingsRecords: [],
    totalRecords: 0
  });

  this.get('/circulation/requests', ({ requests }) => {
    return this.serializerOrRegistry.serialize(requests.all());
  });

  this.get('/service-points-users', {
    servicePointsUsers: [],
    totalRecords: 0
  });

  this.get('/users', {
    users: [],
    totalRecords: 0,
  });

  this.get('/proxiesfor', {
    proxiesFor: [],
    totalRecords: 0,
  });

  this.get('/perms/users/:id/permissions', {
    permissionNames: [],
  });

  this.get('/perms/permissions', {
    permissions: [],
    totalRecords: 0,
  });

  this.get('/addresstypes', {
    'addressTypes': [],
    'totalRecords': 0,
  });

  this.get('/groups', {
    usergroups: [],
    totalRecords: 0
  });

  this.get('/users/:id', {});

  this.post('/circulation/end-patron-action-session', {});
}
