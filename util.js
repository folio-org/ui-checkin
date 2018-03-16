import React from 'react';
import { FormattedDate, FormattedTime } from 'react-intl'; // eslint-disable-line import/no-extraneous-dependencies,
import dateFormat from 'dateformat';
import moment from 'moment'; // eslint-disable-line import/no-extraneous-dependencies

export function formatDate(dateStr) {
  if (!dateStr) return dateStr;
  return (<FormattedDate value={dateStr} />);
}

export function formatDateTime(dateStr) {
  if (!dateStr) return dateStr;
  return (<span><FormattedDate value={dateStr} /> <FormattedTime value={dateStr} /></span>);
}

export function formatDateTimePicker(date, time) {
  const formatDateUTC = `${dateFormat(date, 'yyyy-mm-dd')}T${time}`;
  //  grab the local time from the generated UTC date and time from formatdateUTC
  const localTime = moment(formatDateUTC).local().format().split('T')[1];
  //  build a new object with date and local time
  const localDateTime = `${dateFormat(date, 'yyyy-mm-dd')}T${localTime}`;
  //  convert dateTime to utc to send down to the backend
  const systemReturnDateUTC = moment(localDateTime).utc().format();
  return systemReturnDateUTC;
}
