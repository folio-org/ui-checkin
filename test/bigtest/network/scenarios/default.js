/* istanbul ignore file */

export default function defaultScenario(server) {
  /*
  server.create('item', 'withLoan', {
    barcode: 9676761472500
  });
  */
  server.create('staffSlip', { name: 'Hold' });
  server.create('staffSlip', { name: 'Transit' });
}
