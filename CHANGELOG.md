# Change history for ui-checkin

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
