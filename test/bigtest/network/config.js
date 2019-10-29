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

  this.get('/service-points', function (schema) {
    return schema.servicePoints.all();
  });

  this.get('/staff-slips-storage/staff-slips', (schema) => {
    return schema.staffSlips.all();
  });

  this.get('/inventory/items', ({ items }, request) => {
    console.log(123123214);
    
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

  this.get('/circulation/requests', () => {
    console.log('asdasdasdasdasfoiasdnjgflkijsdklji');
    
    return ({
      "requests": [{
        "id": "3d2a2bd9-1289-4efe-9e28-ffadf229a3f1",
        "requestType": "Hold",
        "requestDate": "2019-10-28T11:04:52.000+0000",
        "requesterId": "11dd4634-e4a9-45f0-9683-fa4d7a8f9728",
        "itemId": "7212ba6a-8dcf-45a1-be9a-ffaa847c4423",
        "status": "Open - Not yet filled",
        "position": 1,
        "item": {
          "title": "A semantic web primer",
          "barcode": "10101",
          "holdingsRecordId": "e3ff6133-b9a2-4d4c-a1c9-dc1867d4df19",
          "instanceId": "5bf370e0-8cca-4d9c-82e4-5170ab2a0a39",
          "location": {
            "name": "Main Library",
            "libraryName": "Datalogisk Institut",
            "code": "KU/CC/DI/M"
          },
          "contributorNames": [{
            "name": "Antoniou, Grigoris"
          }, {
            "name": "Van Harmelen, Frank"
          }],
          "enumeration": "",
          "status": "In transit",
          "callNumber": "TK5105.88815 . A58 2004 FT MEADE",
          "copyNumbers": ["Copy 2"]
        },
        "requester": {
          "lastName": "Denesik",
          "firstName": "Vickie",
          "middleName": "Ronny",
          "barcode": "668365498167",
          "patronGroup": {
            "id": "bdc2b6d4-5ceb-4a12-ab46-249b9a68473e",
            "group": "undergrad",
            "desc": "Undergraduate Student"
          },
          "patronGroupId": "bdc2b6d4-5ceb-4a12-ab46-249b9a68473e"
        },
        "fulfilmentPreference": "Delivery",
        "deliveryAddressTypeId": "1c4b225f-f669-4e9b-afcd-ebc0e273a34e",
        "metadata": {
          "createdDate": "2019-10-28T11:04:52.777+0000",
          "createdByUserId": "57e5914b-16f4-5c9e-bbe4-92adb7e0a0fc",
          "updatedDate": "2019-10-28T11:04:52.805+0000",
          "updatedByUserId": "57e5914b-16f4-5c9e-bbe4-92adb7e0a0fc"
        },
        "deliveryAddress": {
          "addressTypeId": "1c4b225f-f669-4e9b-afcd-ebc0e273a34e",
          "addressLine1": "30190 McKenzie Mission Apt. 317",
          "city": "Tucson",
          "region": "AE",
          "postalCode": "51117",
          "countryId": "US"
        }
      }, {
        "id": "010e8c66-7c35-472a-b7b7-15a26d978fd3",
        "requestType": "Hold",
        "requestDate": "2019-10-28T12:58:22.000+0000",
        "requesterId": "08522da4-668a-4450-a769-3abfae5678ad",
        "itemId": "7212ba6a-8dcf-45a1-be9a-ffaa847c4423",
        "status": "Open - Not yet filled",
        "position": 2,
        "item": {
          "title": "A semantic web primer",
          "barcode": "10101",
          "holdingsRecordId": "e3ff6133-b9a2-4d4c-a1c9-dc1867d4df19",
          "instanceId": "5bf370e0-8cca-4d9c-82e4-5170ab2a0a39",
          "location": {
            "name": "Main Library",
            "libraryName": "Datalogisk Institut",
            "code": "KU/CC/DI/M"
          },
          "contributorNames": [{
            "name": "Antoniou, Grigoris"
          }, {
            "name": "Van Harmelen, Frank"
          }],
          "enumeration": "",
          "status": "In transit",
          "callNumber": "TK5105.88815 . A58 2004 FT MEADE",
          "copyNumbers": ["Copy 2"]
        },
        "requester": {
          "lastName": "Braun",
          "firstName": "Aleen",
          "barcode": "548755241194417",
          "patronGroup": {
            "id": "3684a786-6671-4268-8ed0-9db82ebca60b",
            "group": "staff",
            "desc": "Staff Member"
          },
          "patronGroupId": "3684a786-6671-4268-8ed0-9db82ebca60b"
        },
        "fulfilmentPreference": "Delivery",
        "deliveryAddressTypeId": "1c4b225f-f669-4e9b-afcd-ebc0e273a34e",
        "metadata": {
          "createdDate": "2019-10-28T12:58:23.340+0000",
          "createdByUserId": "57e5914b-16f4-5c9e-bbe4-92adb7e0a0fc",
          "updatedDate": "2019-10-28T12:58:23.365+0000",
          "updatedByUserId": "57e5914b-16f4-5c9e-bbe4-92adb7e0a0fc"
        },
        "deliveryAddress": {
          "addressTypeId": "1c4b225f-f669-4e9b-afcd-ebc0e273a34e",
          "addressLine1": "32796 Kuhn Drive Suite 950",
          "city": "Bowling Green",
          "region": "CT",
          "postalCode": "52150-4432",
          "countryId": "US"
        }
      }],
      "totalRecords": 2
    });
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
}
