import React from 'react';
import {
  FormattedMessage,
  injectIntl,
} from 'react-intl';
import PropTypes from 'prop-types';

import { IfPermission } from '@folio/stripes/core';
import {
  FormattedTime,
  InfoPopover,
  KeyValue,
} from '@folio/stripes/components';

import FeesFinesOwnedStatus from '../FeesFinesOwnedStatus';

import css from './ReturnedTime.css';

const TIME_FORMAT = {
  day: 'numeric',
  month: 'numeric',
  year: 'numeric',
};

const ReturnedTime = ({
  loan,
  mutator,
  intl: {
    formatTime,
  },
}) => {
  const popoverContent = (
    <>
      <KeyValue label={<FormattedMessage id="ui-checkin.processedAs" />}>
        <FormattedTime
          value={loan.returnDate}
          {...TIME_FORMAT}
        />
      </KeyValue>
      <KeyValue label={<FormattedMessage id="ui-checkin.actual" />}>
        <FormattedTime
          value={new Date()}
          {...TIME_FORMAT}
        />
      </KeyValue>
    </>
  );

  return (
    <div>
      { loan.returnDate ?
        <div
          data-testid="returnedDate"
          className={css.timeReturned}
        >
          <div data-test-check-in-return-time>
            {formatTime(`${loan.returnDate}`)}
          </div>
          <div>
            <InfoPopover content={popoverContent} />
          </div>
        </div> :
        null
      }
      { loan.userId && loan.itemId &&
        <IfPermission perm="accounts.collection.get">
          <FeesFinesOwnedStatus
            userId={loan.userId}
            itemId={loan.itemId}
            mutator={mutator}
            loanId={loan.id}
          />
        </IfPermission>
      }
    </div>
  );
};

ReturnedTime.propTypes = {
  intl: PropTypes.object.isRequired,
  mutator: PropTypes.object.isRequired,
  loan: PropTypes.shape({
    id: PropTypes.string,
    itemId: PropTypes.string,
    userId: PropTypes.string,
    returnDate: PropTypes.string,
  }),
};

export default injectIntl(ReturnedTime);
