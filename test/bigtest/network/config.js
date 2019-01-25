import CQLParser, { CQLBoolean } from './cql';

// typical mirage config export
export default function configure() {
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

  // item-storage
  this.get('/service-points', {
    servicepoints: [],
    totalRecords: 0
  });

  this.get('/staff-slips-storage/staff-slips', {
    'staffSlips': [
      {
        'id': '3a082c5c-dc03-4b05-b77a-1a8f61424fdf',
        'name': 'Hold',
        'active': true,
        'template': '<p></p>',
        'metadata': {
          'createdDate': '2019-01-15T18:22:35.596+0000',
          'createdByUserId': '1d2a5d7d-e472-55a3-8da2-285ef27f7125',
          'updatedDate': '2019-01-15T18:22:35.596+0000',
          'updatedByUserId': '1d2a5d7d-e472-55a3-8da2-285ef27f7125'
        }
      },
      {
        'id': '2bf4f1cb-90af-4757-a84f-15f41722e111',
        'name': 'Transit',
        'active': true,
        'template': '<p></p>',
        'metadata': {
          'createdDate': '2019-01-15T18:22:35.598+0000',
          'createdByUserId': '1d2a5d7d-e472-55a3-8da2-285ef27f7125',
          'updatedDate': '2019-01-15T18:22:35.598+0000',
          'updatedByUserId': '1d2a5d7d-e472-55a3-8da2-285ef27f7125'
        }
      }
    ],
    'totalRecords': 2
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

  this.get('/circulation/requests', {
    requests: [],
    totalRecords: 0
  });

  this.get('/service-points-users', {
    servicePointsUsers: [],
    totalRecords: 0
  });

  this.get('/staff-slips-storage/staff-slips', {});
  this.get('/groups', {
    usergroups: [],
    totalRecords: 0
  });

  this.get('/addresstypes', {});
  this.get('/users/:id', {});
  this.get('/perms/users/:id/permissions', {});
}
