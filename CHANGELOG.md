# Change history for ui-checkin

## [2.0.0] (https://github.com/folio-org/ui-checkin/tree/v2.0.0) (2019-03-13)
[Full Changelog](https://github.com/folio-org/ui-checkin/compare/v1.10.0...v2.0.0)

* Provide two options for barcode tokens on staff slips. Refs UICIRC-393.
* Display effective call number prefix, call number, and call number suffix at check in. Refs UICHKIN-127.
* Update okapiInterfaces: `item-storage: 8.0`, `circulation: 9.0`. Refs UICHKIN-149.
* Make the Check in ellipsis accessible. Refs UICHKIN-134.
* Add 'in-house use' column to checked-in items table. Refs UICHKIN-100.
* Security update eslint to >= 6.2.1 or eslint-util >= 1.4.1. Refs. UICHKIN-150.
* Add declared lost modal. Refs UICHKIN-114.
* Display `effective call number prefix`, `call number`, `call number suffix`, `enumeration`, `chronology`, `volume` in loans contexts. Refs UIU-1391.
* Migrate to `stripes` `v3.0.0` and move `react-intl` and `react-router` to peerDependencies.
* Fix accessibility problems. Refs UICHKIN-159.
* Add fee/fine details button. Refs UICHKIN-125.
* Replace placeholder in-house use icon with the official icon. Refs UICHKIN-162.
* Implement automatic end session for check-in. Refs UICHKIN-140.
* Update translation strings.

## [1.10.0](https://github.com/folio-org/ui-checkin/tree/v1.10.0) (2019-12-4)
[Full Changelog](https://github.com/folio-org/ui-checkin/compare/v1.9.0...v1.10.0)

* Provide correct backend permissions in 'Check in: All permissions" permission. Fixes UICHKIN-110.
* Implement loader while checkin is processing. Refs UICHKIN-129.
* Show time of scan when checking any item in. UICHKIN-63.
* Update the circulation API to support changes in the rule editor. UICHKIN-117.
* Add "lastCheckedInDateTime" and remove "lastScannedServicePoint" tokens for staff slips. UICIRC-291

## [1.9.0](https://github.com/folio-org/ui-checkin/tree/v1.9.0) (2019-09-11)
[Full Changelog](https://github.com/folio-org/ui-checkin/compare/v1.8.0...v1.9.0)

* Update translation strings.
* Change fields order in ModalManager, fixed styles. UICHKIN-106.
* Update `react-to-print` to accept React via `peerDependencies`. UIIN-678.
* Add copy, loanType and numberOfPieces tokens to staff slips. UICIRC-300.
* Show time of scan when checking any item in. UICHKIN-63.

## [1.8.0](https://github.com/folio-org/ui-checkin/tree/v1.8.0) (2019-07-24)
[Full Changelog](https://github.com/folio-org/ui-checkin/compare/v1.7.0...v1.8.0)

* Refines list of tokens available for staff slip templates (UICIRC-189)
* Adds link to check-in notes displaying date, source (UICHKIN-87)

## [1.7.0](https://github.com/folio-org/ui-checkin/tree/v1.7.0) (2019-05-10)
[Full Changelog](https://github.com/folio-org/ui-checkin/compare/v1.6.0...v1.7.0)

* Trim whitespace padding from item barcodes to avoid server errors. Fixes UICHKIN-93.
* Fix hold expiration date and remove call number from staff slip. UICIRC-175.
* Link to check in notes in action menu. UICHKIN-78.
* Provide multiple messages at check in. UICHKIN-79.
* Bug fix: Cancel multipiece check-in clears check-in history. UICHKIN-88.

## [1.6.0](https://github.com/folio-org/ui-checkin/tree/v1.6.0) (2019-03-16)
[Full Changelog](https://github.com/folio-org/ui-checkin/compare/v1.5.0...v1.6.0)

* Supports `circulation` interface 7.0. UICHKIN-83.
* Supports `loan-policy-storage` interface 2.0. CIRCSTORE-96
* Print/reprint transit (routing) and hold slips at check-in. Part of UICHKIN-66.
* Adds warning on check-in of missing items. UICHKIN-58
* Adds check-in modal for items in transit. UICHKIN-49.
* Adds check-in modal for items awaiting pickut. UICHKIN-50.
* Inherits Check-in Modal Print Slip Print Defaults. UICHKIN-53.
* Add styles for quill editor. Part of UICHKIN-75.

## [1.5.0](https://github.com/folio-org/ui-checkin/tree/v1.5.0) (2019-01-25)
[Full Changelog](https://github.com/folio-org/ui-checkin/compare/v1.4.0...v1.5.0)

* Display modal for multipiece items. Part of UICHKIN-46.
* Add New fee/fine option on ellipsis menu . Ref UICHKIN-56.
* Upgrade to stripes v2.0.0.

## [1.4.0](https://github.com/folio-org/ui-checkin/tree/v1.4.0) (2018-12-13)
[Full Changelog](https://github.com/folio-org/ui-checkin/compare/v1.3.0...v1.4.0)

* Print hold slip at check in. Fixes UICHKIN-16.
* Extract hardcoded labels. Fixes UICHKIN-14.
* Use the new check-in-by-barcode API. Fixes UICHKIN-59.
* Handle check in for items that are In transit. Fixes UICHKIN-44.
* Display destination service point for in transit items. Fixes UICHKIN-40.
* Display modal when items go in transit. Fixes UICHKIN-41.
* Fix link to item. Fixes UICHKIN-61.

## [1.3.0](https://github.com/folio-org/ui-checkin/tree/v1.3.0) (2018-10-04)
[Full Changelog](https://github.com/folio-org/ui-checkin/compare/v1.2.0...v1.3.0)

* Add alternate dependency `item-storage` 6.0 UICHKIN-45
* Use `stripes` framework 1.0

## [1.2.0](https://github.com/folio-org/ui-checkin/tree/v1.2.0) (2018-09-12)
[Full Changelog](https://github.com/folio-org/ui-checkin/compare/v1.1.1...v1.2.0)

* Dependency on item-storage: 5.0
* use PropTypes, not React.PropTypes. Refs STRIPES-427.
* Refactor to use pure stripes-connect. Fixes UICHKIN-4.
* Use our implementations of `<Row>, <Col>`. Refs STRIPES-427.
* Use more-current stripes-components. Refs STRIPES-495.
* Ignore yarn-error.log file. Refs STRIPES-517.
* Change back-end queries by id to use exact match (==). UICHKIN-22.
* Update to current users interface. Refs UIU-495.
* Add test for item status UICHKIN-7
* Use inventory API for items UICHKIN-9.
* Checkin refinement UICHKIN-10.
* Show item details at checkin UICHKIN-29.
* Relocate language files UICHKIN-30.
* Fix focus issues. Fixes UICHKIN-31.
* Deny access to check in app if no service point is selected.
* Depend on v3.0 or 4.0 of `circulation` UICHKIN-36
* Bug fixes without a separate change log entry: UICHKIN-37, UICHKIN-34, UICHKIN-31, UICHKIN-27, UICHKIN-25, UICHKIN-24, UICHKIN-23

## [1.1.1](https://github.com/folio-org/ui-checkin/tree/v1.1.1) (2017-08-31)
[Full Changelog](https://github.com/folio-org/ui-checkin/compare/v1.1.0...v1.1.1)

* Update permissions. Completes STRIPES-435 for ui-checkin.

## [1.1.0](https://github.com/folio-org/ui-checkin/tree/v1.1.0) (2017-08-30)
[Full Changelog](https://github.com/folio-org/ui-checkin/compare/v1.0.0...v1.1.0)

* Make settings.loan-policies.all permission visible. For UIS-50.
* Testing: Add test stub for automated UI testing. FOLIO-801

## [1.0.0](https://github.com/folio-org/ui-checkin/tree/v1.0.0) (2017-08-21)
[Full Changelog](https://github.com/folio-org/ui-checkin/compare/v0.0.1...v1.0.0)

*  Switch from props.data to props.resources. Fixes UIS-66.
*  Assign element IDs for automated testing. STRIPES-300.

## [0.0.1](https://github.com/folio-org/ui-checkin/tree/v0.0.1) (2017-08-10)

* First version to have a documented change-log. Each subsequent version will
  describe its differences from the previous one.
