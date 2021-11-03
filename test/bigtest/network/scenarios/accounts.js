export default server => {
  server.get('/accounts', {
    accounts: [
      {
        id: 'accounts id #1',
        status: {
          name: 'Open',
        },
      },
      {
        id: 'accounts id #2',
        status: {
          name: 'Open',
        },
      },
    ],
    totalRecords: 2,
  });
};
