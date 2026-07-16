import {
  escape,
} from 'lodash';

import {
  dayjs,
} from '@folio/stripes/components';

import {
  statuses,
  DCB_INSTANCE_ID,
  DCB_HOLDINGS_RECORD_ID,
} from './consts';

export const escapeValue = (val) => {
  if (typeof val === 'string' && val.startsWith('<Barcode>') && val.endsWith('</Barcode>')) {
    return val;
  }

  return escape(val);
};

export function buildTemplate(str) {
  return o => {
    return str.replace(/{{([^{}]*)}}/g, (a, b) => {
      const r = o[b];
      return typeof r === 'string' || typeof r === 'number' ? escapeValue(r) : '';
    });
  };
}

export function buildDateTime(date, time, timezone, now) {
  if (date && time && timezone) {
    const timeWithoutOffset = time.substring(0, 5);
    const formattedDate = date.substring(0, 10);
    const formattedTime = dayjs(`${date} ${timeWithoutOffset}`).format('HH:mm');
    const effectiveReturnDate = dayjs.tz(`${formattedDate}T${formattedTime}`, timezone);

    return effectiveReturnDate.toISOString();
  } else {
    return dayjs(now).toISOString();
  }
}

export function getCheckinSettings(checkinSettings) {
  if (!checkinSettings.length) {
    return undefined;
  }

  return checkinSettings[0].value;
}

export function shouldConfirmStatusModalBeShown(item) {
  return [
    statuses.WITHDRAWN,
    statuses.DECLARED_LOST,
    statuses.MISSING,
    statuses.LOST_AND_PAID,
    statuses.AGED_TO_LOST,
    statuses.RESTRICTED,
    statuses.IN_PROCESS_NON_REQUESTABLE,
    statuses.LONG_MISSING,
    statuses.UNAVAILABLE,
    statuses.UNKNOWN,
  ].includes(item?.status?.name);
}

export const isDCBItem = (item) => item.instanceId === DCB_INSTANCE_ID && item.holdingsRecordId === DCB_HOLDINGS_RECORD_ID;

/**
 * Focuses the primary action button inside a modal when the modal opens.
 *
 * Background
 * ----------
 * Stripes' <Modal> component runs its own internal focus management after mount.
 * This causes the `autoFocus` prop on buttons placed inside the modal footer to be
 * ineffective — the modal steals focus back to its own container element immediately
 * after the browser processes `autoFocus`.
 *
 * Solution
 * --------
 * Instead of relying on `autoFocus`, attach a React ref to the primary button (or to
 * a wrapper <div> when the button is a composite component such as <PrintButton>) and
 * call this function from the Modal's `onOpen` callback. By the time `onOpen` fires,
 * the modal's internal focus management has already run, so focus set here is the final
 * winner.
 *
 * Why a wrapper <div> for <PrintButton>?
 * ---------------------------------------
 * <PrintButton> is a composite component that renders its own DOM subtree and does not
 * forward refs to the underlying <button> element. Wrapping it in a <div> and attaching
 * the ref to that <div> lets us walk the DOM to find the first focusable <button> inside.
 *
 * Usage
 * -----
 * // Class component (e.g. RouteForDeliveryModal):
 *   this.primaryButtonRef = React.createRef();
 *   onModalOpen = () => focusModalPrimaryButton(this.primaryButtonRef);
 *
 * // Function component (e.g. ConfirmStatusModal):
 *   const primaryButtonRef = useRef(null);
 *   const onModalOpen = useCallback(() => focusModalPrimaryButton(primaryButtonRef), []);
 *
 * @param {React.RefObject} ref - A ref attached either directly to a focusable element
 *   (e.g. a stripes <Button>) or to a <div> wrapper around a composite button component
 *   (e.g. <PrintButton>). When the ref points to a <div>, the first <button> descendant
 *   is focused instead.
 */
export const focusModalPrimaryButton = (ref) => {
  const focusTarget = ref?.current;

  if (!focusTarget) {
    return;
  }

  // If the ref points directly to a focusable element (e.g. a stripes <Button> which
  // renders as a <button> tag), focus it straight away.
  // Otherwise the ref points to a <div> wrapper (used when the primary action is a
  // composite component like <PrintButton> that does not forward its ref). In that case
  // we find and focus the first <button> element inside the wrapper.
  if (focusTarget.tagName !== 'DIV') {
    focusTarget.focus();
  } else {
    const btn = focusTarget.querySelector('button');

    if (btn) {
      btn.focus();
    }
  }
};

export default {};
