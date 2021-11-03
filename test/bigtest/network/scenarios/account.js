export default server => {
  server.get('/accounts', {
    accounts: [{
      id: 'accounts id',
      status: {
        name: 'Open',
      },
    }],
    totalRecords: 1,
  });
};
