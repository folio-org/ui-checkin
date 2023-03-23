import React from 'react';
import PropTypes from 'prop-types';
import { Field } from 'react-final-form';
import {
  FormattedMessage,
  injectIntl,
} from 'react-intl';

import {
  Col,
  Datepicker,
  Icon,
  Label,
  Timepicker,
} from '@folio/stripes/components';

import css from './CheckinDateTime.css';

export const parser = (value) => (value);

class CheckinDateTime extends React.Component {
  static propTypes = {
    intl: PropTypes.shape({
      formatDate: PropTypes.func.isRequired,
      formatMessage: PropTypes.func.isRequired,
    }).isRequired,
    showPickers: PropTypes.bool.isRequired,
    onClick: PropTypes.func.isRequired,
  }

  render() {
    const {
      intl: {
        formatMessage,
      },
      showPickers,
      onClick,
    } = this.props;
    const dateReturnedLabel = formatMessage({ id: 'ui-checkin.dateReturnedLabel' });
    const checkinDateLabel = formatMessage({ id: 'ui-checkin.checkinDate' });
    const timeReturnedLabel = formatMessage({ id: 'ui-checkin.timeReturnedLabel' });
    const checkinTimeLabel = formatMessage({ id: 'ui-checkin.checkinTime' });

    return (
      <>
        <Col xs={12} smOffset={3} sm={2}>
          {showPickers ? (
            <div data-test-process-date>
              <Field
                name="item.checkinDate"
                aria-label={checkinDateLabel}
                label={dateReturnedLabel}
                component={Datepicker}
                autoComplete="off"
                timeZone="UTC"
                backendDateStandard="YYYY-MM-DD"
              />
            </div>
          ) : (
            <>
              <Label>{dateReturnedLabel}</Label>
              <button
                data-test-checkin-modify-date
                data-testid="datePickerOnClick"
                onClick={onClick}
                className={css['modify-datetime-button']}
                type="button"
              >
                <Icon
                  icon="edit"
                  iconPosition="end"
                >
                  <FormattedMessage id="ui-checkin.today" />
                </Icon>
              </button>
            </>
          )}
        </Col>
        <Col xs={12} sm={2}>
          {showPickers ? (
            <div data-test-process-time>
              <Field
                name="item.checkinTime"
                aria-label={checkinTimeLabel}
                label={timeReturnedLabel}
                component={Timepicker}
                autoComplete="off"
                timeZone="UTC"
                parser={parser}
              />
            </div>
          ) : (
            <>
              <Label>{timeReturnedLabel}</Label>
              <button
                data-test-checkin-modify-time
                data-testid="timePickerOnClick"
                onClick={onClick}
                className={css['modify-datetime-button']}
                type="button"
              >
                <Icon
                  icon="edit"
                  iconPosition="end"
                >
                  <FormattedMessage id="ui-checkin.now" />
                </Icon>
              </button>
            </>
          )}
        </Col>
      </>
    );
  }
}

export default injectIntl(CheckinDateTime);
