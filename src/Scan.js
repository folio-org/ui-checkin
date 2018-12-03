import get from 'lodash/get';
import minBy from 'lodash/minBy';
import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, injectIntl, intlShape } from 'react-intl';
import moment from 'moment-timezone';
import { SubmissionError, change, reset } from 'redux-form';
import CheckIn from './CheckIn';
import ConfirmStatusModal from './components/ConfirmStatusModal';

class Scan extends React.Component {
  static manifest = Object.freeze({
    scannedItems: { initialValue: [] },
    query: { initialValue: {} },
    requests: {
      type: 'okapi',
      records: 'requests',
      accumulate: 'true',
      path: 'circulation/requests',
      fetch: false,
    },
    staffSlips: {
      type: 'okapi',
      records: 'staffSlips',
      path: 'staff-slips-storage/staff-slips?query=(name=="Hold")',
      throwErrors: false,
    },
    checkIn: {
      type: 'okapi',
      path: 'circulation/check-in-by-barcode',
      fetch: false,
      throwErrors: false,
    }
  });

  static propTypes = {
    intl: intlShape,
    stripes: PropTypes.object,
    resources: PropTypes.shape({
      scannedItems: PropTypes.arrayOf(
        PropTypes.shape({
          id: PropTypes.string,
        }),
      ),
      requests: PropTypes.shape({
        records: PropTypes.arrayOf(PropTypes.object),
      }),
      staffSlips: PropTypes.shape({
        records: PropTypes.arrayOf(PropTypes.object),
      }),
    }),

    mutator: PropTypes.shape({
      query: PropTypes.shape({
        update: PropTypes.func,
      }),
      checkIn: PropTypes.shape({
        POST: PropTypes.func,
      }),
      requests: PropTypes.shape({
        GET: PropTypes.func,
        reset: PropTypes.func,
      }),
      scannedItems: PropTypes.shape({
        replace: PropTypes.func,
      }),
      staffSlips: PropTypes.shape({
        GET: PropTypes.func,
      }),
    }),
  };

  constructor(props) {
    super(props);
    this.store = props.stripes.store;

    this.checkIn = this.checkIn.bind(this);
    this.onSessionEnd = this.onSessionEnd.bind(this);
    this.onConfirm = this.onConfirm.bind(this);
    this.onCancel = this.onCancel.bind(this);

    this.checkInRef = React.createRef();
    this.state = {};
  }

  onSessionEnd() {
    this.clearResources();
    this.clearForm('CheckIn');
  }

  clearForm(formName) {
    this.store.dispatch(reset(formName));
  }

  clearResources() {
    this.props.mutator.scannedItems.replace([]);
  }

  validate(item) {
    const { intl: { formatMessage } } = this.props;
    const barcode = formatMessage({ id: 'ui-checkin.fillOut' });
    if (!item || !item.barcode) {
      throw new SubmissionError({ item: { barcode } });
    }
  }

  checkIn(data, checkInInst) {
    const { mutator: { checkIn }, stripes: { user } } = this.props;
    const { item } = data;
    this.validate(item);

    const { barcode, checkinDate, checkinTime } = item;
    const servicePointId = get(user, ['user', 'curServicePoint', 'id'], '');
    const checkInDate = this.buildDateTime(checkinDate, checkinTime);
    const requestData = {
      servicePointId,
      checkInDate,
      itemBarcode: barcode,
    };

    return checkIn.POST(requestData)
      .then((checkinResp) => this.fetchRequest(checkinResp))
      .then(checkinResp => this.addScannedItem(checkinResp))
      .then(() => this.clearField('CheckIn', 'item.barcode'))
      .catch((resp) => {
        const contentType = resp.headers.get('Content-Type') || '';
        if (contentType.startsWith('application/json')) {
          return resp.json().then(error => this.handleJsonError(error));
        } else {
          return resp.text().then(error => this.handleTextError(error));
        }
      })
      .finally(() => checkInInst.focusInput());
  }

  handleTextError(error) {
    const item = { barcode: error };
    throw new SubmissionError({ item });
  }

  handleJsonError({
    errors: [
      {
        parameters,
        message,
      } = {},
    ] = [],
  }) {
    const itemError = (!parameters || !parameters.length)
      ? {
        barcode: <FormattedMessage id="ui-checkin.unknownError" />,
        _error: 'unknownError',
      }
      : {
        barcode: message,
        _error: parameters[0].key,
      };

    throw new SubmissionError({ item: itemError });
  }

  fetchRequest(checkinResp) {
    const { loan } = checkinResp;
    if (!loan) return checkinResp;

    const query = `(itemId==${loan.itemId} and requestType=="Hold" and (status=="Open - Not yet filled" or status=="Open - Awaiting pickup"))`;
    const { mutator } = this.props;
    mutator.requests.reset();
    return mutator.requests.GET({ params: { query } }).then((requests) => {
      if (requests.length) {
        const nextRequest = minBy(requests, 'position');
        nextRequest.item = loan.item;
        this.setState({ nextRequest });
      }

      return checkinResp;
    });
  }

  buildDateTime(date, time) {
    if (date && time) {
      let timeString = time;

      if (time.indexOf('T') > -1) {
        timeString = time.split('T')[1];
      }

      return `${date.substring(0, 10)}T${timeString}`;
    } else {
      return moment().tz('UTC').format();
    }
  }

  addScannedItem({ loan, item }) {
    const { mutator, resources } = this.props;
    const scannedItem = loan || { item };
    const scannedItems = [scannedItem].concat(resources.scannedItems);
    return mutator.scannedItems.replace(scannedItems);
  }

  clearField(formName, fieldName) {
    this.props.stripes.store.dispatch(change(formName, fieldName, ''));
  }

  throwError(error) {
    this.error = error;
    throw this.error;
  }

  onConfirm() {
    // TODO: handle transit
    this.setState({ nextRequest: null });
  }

  onCancel() {
    this.setState({ nextRequest: null });
  }

  render() {
    const { resources } = this.props;
    const { nextRequest } = this.state;
    const scannedItems = resources.scannedItems || [];
    const staffSlips = (resources.staffSlips || {}).records || [];
    const holdSlip = staffSlips[0] || {};

    return (
      <div data-test-check-in-scan>
        {nextRequest &&
          <ConfirmStatusModal
            open={!!nextRequest}
            request={nextRequest}
            onConfirm={this.onConfirm}
            holdSlipTemplate={holdSlip.template}
            onCancel={this.onCancel}
          />
        }
        <CheckIn
          submithandler={this.checkIn}
          onSessionEnd={this.onSessionEnd}
          scannedItems={scannedItems}
          ref={this.checkInRef}
          initialValues={
            { item:
              {
                checkinDate: '',
                checkinTime: '',
              } }
          }
          {...this.props}
        />
      </div>
    );
  }
}

export default injectIntl(Scan);
