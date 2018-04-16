import dateFormat from 'dateformat';
import moment from 'moment-timezone';

export default function formatDateTimePicker(date, time, timezone) {
  // if date is today, get todays date
  const SystemcheckinDate = (date === 'today') ? moment.tz(timezone).format() : date;
  // if time is now, get todays time in UTC
  const SystemcheckinTime = (time === 'now') ? (moment.tz(moment.tz(timezone).format(), 'UTC').format().split('T')[1]) : time;
  // format the UTC dateTime with todays date and the UTC time returned by the timepicker
  const DateFromDatePicker = moment.tz(SystemcheckinDate, timezone).format().split('T')[0];
  // SystemcheckinTime is returned as UTC, so create a string with todays date and SystemcheckinTime
  const formatDateUTC = `${dateFormat(new Date(), 'yyyy-mm-dd')}T${SystemcheckinTime}`;
  //  extract the local time from the UTC time returned by the datepicker
  const localTime = moment.tz(formatDateUTC, timezone).format().split('T')[1].split('-')[0];
  //  build a new string with date returned from datepicker and local time extracted
  const localDateTime = `${DateFromDatePicker}T${localTime}`;
  return moment.tz(localDateTime, timezone).tz('UTC').format();
}
