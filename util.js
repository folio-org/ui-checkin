import dateFormat from 'dateformat';
import moment from 'moment-timezone'; // eslint-disable-line import/no-extraneous-dependencies

export default function formatDateTimePicker(date, time, timezone) {
  // format the UTC dateTime with todays date and the UTC time returned by the timepicker
  const formatDateUTC = `${dateFormat(new Date(), 'yyyy-mm-dd')}T${time}`;
  //  extract the local time from the UTC time returned by the datepicker
  const localTime = moment.tz(formatDateUTC, timezone).format().split('T')[1].split('-')[0];
  //  build a new string with date returned from datepicker and local time extracted above
  const localDateTime = `${dateFormat(date, 'yyyy-mm-dd')}T${localTime}`;
  return localDateTime;
}
