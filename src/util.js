import { get } from 'lodash';

export function buildTemplate(str) {
  return o => {
    return str.replace(/{{([^{}]*)}}/g, (a, b) => {
      const r = o[b];
      return typeof r === 'string' || typeof r === 'number' ? r : a;
    });
  };
}

export function convertRequestToHold(request, intl) {
  const { item = {}, requester } = request;
  const slipData = {
    'Item title': item.title,
    'Item barcode': `<Barcode>${item.barcode}</Barcode>`,
    'Transaction Id': request.id,
    'Requester last name': requester.lastName,
    'Requester first name': requester.firstName,
    'Hold expiration': intl.formatDate(request.holdShelfExpirationDate, {
      timeZone: 'UTC'
    }),
    'Requester barcode': `<Barcode>${requester.barcode}</Barcode>`
  };

  return slipData;
}

export function convertLoanToTransition(loan, intl) {
  const { item = {} } = loan;
  const authors = (item.contributors || []).map(c => c.name).join(', ');
  const destinationServicePoint = get(
    item,
    'inTransitDestinationServicePoint.name',
    ''
  );
  const slipData = {
    'From Service Point': get(item, 'location.name', ''),
    'To Service Point': destinationServicePoint,
    'Item title': item.title,
    'Item barcode': `<Barcode>${item.barcode}</Barcode>`,
    'Item author(s)': authors || '',
    'Item call number': item.callNumber,
    'Staff slip name': 'Transit'
  };

  if (loan.dueDate) {
    slipData['Needed for'] = intl.formatDate(loan.dueDate, { timeZone: 'UTC' });
  }

  if (loan.loanDate) {
    slipData.Date = intl.formatDate(loan.loanDate, { timeZone: 'UTC' });
  }

  return slipData;
}

export default {};
