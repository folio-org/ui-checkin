# Change history for ui-checkin

## 12.0.0 IN PROGRESS

* *BREAKING* Use `convertToSlipData` and supporting functions from `stripes-util`. Refs UICHKIN-456.

## [11.0.0] (https://github.com/folio-org/ui-checkin/tree/v11.0.0) (2025-03-14)
[Full Changelog](https://github.com/folio-org/ui-checkin/compare/v10.0.1...v11.0.0)

* *BREAKING* Update `react-intl` to `^7`. Refs UICHKIN-453.
* Migrate to shared GA workflows. Refs UICHKIN-451.
* Add pagination to the Select item dialog. Refs UICHKIN-428.
* *BREAKING* Update stripes-* dependencies to latest version. Refs UICHKIN-452.
* Implement support for fields without information. Refs UICHKIN-454.
* Add support for new printing tokens in hold slips. Fixes UICHKIN-457.

## [10.0.1] (https://github.com/folio-org/ui-checkin/tree/v10.0.1) (2025-01-23)
[Full Changelog](https://github.com/folio-org/ui-checkin/compare/v10.0.0...v10.0.1)

* Implement feature toggle for switch between `circulation/check-in-by-barcode` and `circulation-bff/loans/check-in-by-barcode`. Refs UICHKIN-439.

## [10.0.0] (https://github.com/folio-org/ui-checkin/tree/v10.0.0) (2025-01-16)
[Full Changelog](https://github.com/folio-org/ui-checkin/compare/v9.2.1...v10.0.0)

* *BREAKING* Migrate from `circulation/check-in-by-barcode` to `circulation-bff/loans/check-in-by-barcode`. Refs UICHKIN-437.

## [9.2.1] (https://github.com/folio-org/ui-checkin/tree/v9.2.1) (2024-11-13)
[Full Changelog](https://github.com/folio-org/ui-checkin/compare/v9.2.0...v9.2.1)

* Fix `DOMPurify` import. Refs UICHKIN-435.

## [9.2.0] (https://github.com/folio-org/ui-checkin/tree/v9.2.0) (2024-10-30)
[Full Changelog](https://github.com/folio-org/ui-checkin/compare/v9.1.1...v9.2.0)

* Remove bigtests from github actions. Refs UICHKIN-425.
* Update upload-artifact actions from v1 and v2 to v4. Refs UICHKIN-431.
* Remove barcode trimming before it is sent to backend for processing. Refs UICHKIN-424.
* Also support okapiInterfaces `inventory` `14.0`. Refs UICHKIN-433.

## [9.1.1] (https://github.com/folio-org/ui-checkin/tree/v9.1.1) (2024-03-27)
[Full Changelog](https://github.com/folio-org/ui-checkin/compare/v9.1.0...v9.1.1)

* Add support for Barcode tag with sanitize. Refs UICHKIN-421, UICHKIN-422.

## [9.1.0] (https://github.com/folio-org/ui-checkin/tree/v9.1.0) (2024-03-22)
[Full Changelog](https://github.com/folio-org/ui-checkin/compare/v9.0.2...v9.1.0)

* Also support `feesfines` interface version `19.0`. Refs UICHKIN-401.
* Hide fee/fine action menu items when requester is virtual user. Refs UICHKIN-398.
* Hide “Item details” option in Actions menu when item is virtual. Refs UICHKIN-403.
* UI tests replacement with RTL/Jest for view CheckIn. Refs UICHKIN-287.
* UI tests replacement with RTL/Jest for Scan component. Refs UICHKIN-289.
* Add support for displaySummary token for Staff Slips. Refs UICHKIN-415.
* Remove DST boundary adjustment for item return time. Refs UICHKIN-420.

## [9.0.3] (https://github.com/folio-org/ui-checkin/tree/v9.0.3) (2024-03-27)
[Full Changelog](https://github.com/folio-org/ui-checkin/compare/v9.0.2...v9.0.3)

* Add support for Barcode tag with sanitize. Refs UICHKIN-421, UICHKIN-422.

## [9.0.2] (https://github.com/folio-org/ui-checkin/tree/v9.0.2) (2024-03-21)
[Full Changelog](https://github.com/folio-org/ui-checkin/compare/v9.0.1...v9.0.2)

* Only certain HTML tags should be rendered when displaying staff slips. Refs UICHKIN-421, UICHKIN-422.

## [9.0.1] (https://github.com/folio-org/ui-checkin/tree/v9.0.1) (2023-10-23)
[Full Changelog](https://github.com/folio-org/ui-checkin/compare/v9.0.0...v9.0.1)
* Fix circulation timeout issue. Refs UICHKIN-392.

## [9.0.0] (https://github.com/folio-org/ui-checkin/tree/v9.0.0) (2023-10-12)
[Full Changelog](https://github.com/folio-org/ui-checkin/compare/v8.0.1...v9.0.0)

* Use camel case notation for all data-testid. Refs UICHKIN-375.
* UI tests replacement with RTL/Jest for CheckedInListItems. Refs UICHKIN-361.
* Support `feesfines` interface version `17.0` and `18.0`. Refs UICHKIN-379.
* Populate the token "requester.departments" in the hold, request delivery and transit slips, with the data provided by the backend in the ui-checkin module. Refs UICHKIN-350.
* Populate the token "currentDateTime" in the hold, request delivery and transit slips, with the data provided by the backend in the ui-checkin module. Refs UICHKIN-348.
* Also support `circulation` `14.0`. Refs UICHKIN-381.
* Added requestDate token. Refs UICHKIN-384.
* Add sessionId field to check-in request body JSON. Refs UICHKIN-385.
* Upgrade babel config. Refs UICHKIN-389.
* Add possible for run axe tests. Refs UICHKIN-386.
* Update Node.js to v18 in GitHub Actions. Refs UICHKIN-390.
* *BREAKING* Upgrade React to v18. Refs UICHKIN-388.
* *BREAKING* bump `react-intl` to `v6.4.4`. Refs UICHKIN-396.
* Fix issues with skipped tests. Refs UICHKIN-395.
* Remove outdated imports. Refs UICHKIN-397.
* Fix import for utils.js. Refs UICHKIN-405.

## [8.0.1] (https://github.com/folio-org/ui-checkin/tree/v8.0.1) (2023-03-28)
[Full Changelog](https://github.com/folio-org/ui-checkin/compare/v8.0.0...v8.0.1)

* Fix incorrect checkin time. Refs UICHKIN-377.

## [8.0.0] (https://github.com/folio-org/ui-checkin/tree/v8.0.0) (2023-02-22)
[Full Changelog](https://github.com/folio-org/ui-checkin/compare/v7.2.0...v8.0.0)

* Bump major versions of several @folio/stripes-* packages. Refs UICHKIN-369.
* Remove unneeded `react-redux`. Refs UICHKIN-371.
* Support `inventory` `13.0` interface version. Refs UICHKIN-366.
* Cover `SelectItemModal` by jest/RTL tests. UICHKIN-360.
* The fee/fine account (Actual Cost) is fully closed when Claimed Returned item is checked in. Refs UICHKIN-372.
* UI tests replacement with RTL/Jest for `index.js`. Refs UICHKIN-362.

## [7.2.0] (https://github.com/folio-org/ui-checkin/tree/v7.2.0) (2022-10-20)
[Full Changelog](https://github.com/folio-org/ui-checkin/compare/v7.1.1...v7.2.0)

* Add support for users intervace 16.0.  Refs UICHKIN-345.
* Add Jest/RTL testing for `ComponentToPrint` component. Refs UICHKIN-281.
* Add improvement and Jest/RTL testing for `CheckIn` component. Refs UICHKIN-343.
* Remove hardcoded empty values. Refs UICHKIN-356.
* Also support `inventory` `12.0`. Refs UICHKIN-357.
* Populate the token "requester.preferredFirstName" in the hold, request delivery and transit slips, with the data provided by the backend in the ui-checkin module. Refs UICHKIN-349.
* Populate the token "requester.patronGroup" in the hold, request delivery and transit slips, with the data provided by the backend in the ui-checkin module. Refs UICHKIN-347.

## [7.1.1] (https://github.com/folio-org/ui-checkin/tree/v7.1.1) (2022-07-27)
[Full Changelog](https://github.com/folio-org/ui-checkin/compare/v7.1.0...v7.1.1)

* Retrieve service point from `okapi.currentUser` because `stripes.user` is out of sync. Refs UICHKIN-344.

## [7.1.0] (https://github.com/folio-org/ui-checkin/tree/v7.1.0) (2022-06-29)
[Full Changelog](https://github.com/folio-org/ui-checkin/compare/v7.0.1...v7.1.0)

* Add id for Pane component. Refs UICHKIN-329.
* Compile Translation Files into AST Format. Refs UICHKIN-243.
* Refactor away from react-intl-safe-html Refs UICHKIN-260.
* Add Jest/RTL testing for `ClaimedReturnedModal` component in `src\components\ClaimedReturnedModal`. Refs UICHKIN-280.
* Cover `ConfirmStatusModal` component by RTL/jest tests. Refs UICHKIN-282.
* UI tests replacement with RTL/Jest for component `MultipieceModal`. Refs UICHKIN-283.
* Cover `PrintButton` component by RTL/jest tests. Refs UICHKIN-285.
* Cover `RouteForDeliveryModal` component by RTL/jest tests. Refs UICHKIN-286.
* Add Jest/RTL testing for `ModalManager` component. Refs UICHKIN-288.
* Remove react-hot-loader. Refs UICHKIN-333.
* Replace babel-eslint with @babel/eslint-parser. Refs UICHKIN-336.
* Update NodeJS to v16 in GitHub Actions. Refs UICHKIN-338.
* Improvement for bigtest running. Refs UICHKIN-341.

## [7.0.1] (https://github.com/folio-org/ui-checkin/tree/v7.0.1) (2022-04-06)
[Full Changelog](https://github.com/folio-org/ui-checkin/compare/v7.0.0...v7.0.1)

* Fix heading of `Request delivery slip`. Refs UICHKIN-334.

## [7.0.0] (https://github.com/folio-org/ui-checkin/tree/v7.0.0) (2022-02-24)
[Full Changelog](https://github.com/folio-org/ui-checkin/compare/v6.0.1...v7.0.0)

* Upgrade `@folio/react-intl-safe-html` for compatibility with `@folio/stripes` `v7`. Refs UICHKIN-308.
* Use `MAX_RECORDS` constant instead of hardcoded value for query limits. Refs UICHKIN-317.
* Remove webpack from dependencies. Refs UICHKIN-316.
* Add RTL/Jest testing for `CheckInFooter` component. Refs UICHKIN-278.
* Update mocha in package.json. Refs UICHKIN-324.
* Also support `circulation` `12.0`. Refs UICHKIN-310.
* Unhandled errors bubble up on UI to say that somethin go wrong. Refs UICHKIN-163.
* Also support `circulation` `13.0`. Refs UICHKIN-319.
* Perform Wildcard Item Lookup Before Performing Check in Transactions in Check in App. Refs UICHKIN-309.
* Fix date formats when slip print. Refs UICHKIN-320.
* Cover CheckInNoteModal component by RTL/jest tests

## [6.0.1] (https://github.com/folio-org/ui-checkin/tree/v6.0.1) (2021-11-08)
[Full Changelog](https://github.com/folio-org/ui-checkin/compare/v6.0.0...v6.0.1)

* Fix the issue when fee/fine details doesn't open up if fee/fines have been refunded. Refs UICHKIN-312.

## [6.0.0] (https://github.com/folio-org/ui-checkin/tree/v6.0.0) (2021-09-30)
[Full Changelog](https://github.com/folio-org/ui-checkin/compare/v5.1.0...v6.0.0)

* Fix import paths. Refs UICHKIN-256.
* Add changes for UI consistency. Refs UICHKIN-255.
* Send ISO-8601 dates in API requests. Fixes UICHKIN-272.
* Undefined Bar Code - Requester info not showing. Refs UICHKIN-276.
* Increment `stripes` to `v7`, `react` to `v17`. Refs UICHKIN-290.
* Replace okapiInterfaces dependency `item-storage: 8.0` by `inventory 10.0`. Refs UICHKIN-9, UICHKIN-258.
* Add alternate okapiInterfaces dependency `inventory: 11.0` for optimistic locking. Refs UICHKIN-258.

## [5.1.0] (https://github.com/folio-org/ui-checkin/tree/v5.1.0) (2021-06-17)
[Full Changelog](https://github.com/folio-org/ui-checkin/compare/v5.0.3...v5.1.0)
* Update the .gitignore file. Refs UICHKIN-232.
* Add pull request template. Refs UICHKIN-233.
* Add settings up for Jest/RTL tests. Refs UICHKIN-237.
* Also support `inventory` `10.0`. Refs UICHKIN-244.
* Include missing fee/fine-related permissions in `ui-checkin.all` pset. Refs UICHKIN-253.
* Also support `circulation` `11.0`. Refs UICHKIN-254.
* Fix bug setting wrong checkin time when passing through DST. Fixes UICHKIN-234.
* Fix failed build on ui-checkin. Fixes UICHKIN-265.
* Fix incorrect check in time. Refs UICHKIN-219.
* Adjust `ui-checkin.all` permission set. Fixes UICHKIN-261.
* Fix failed build on ui-checkin. Refs UICHKIN-302.

## [5.0.5] (https://github.com/folio-org/ui-checkin/tree/v5.0.5) (2021-06-23)
[Full Changelog](https://github.com/folio-org/ui-checkin/compare/v5.0.4...v5.0.5)

* Adjust `ui-checkin.all` permission set. Fixes UICHKIN-261.

## [5.0.4] (https://github.com/folio-org/ui-checkin/tree/v5.0.4) (2021-06-11)
[Full Changelog](https://github.com/folio-org/ui-checkin/compare/v5.0.3...v5.0.4)

* Include missing fee/fine-related permissions in `ui-checkin.all` pset. Refs UICHKIN-253.
* Fix failed build on ui-checkin. Fixes UICHKIN-265.

## [5.0.3] (https://github.com/folio-org/ui-checkin/tree/v5.0.3) (2021-04-22)
[Full Changelog](https://github.com/folio-org/ui-checkin/compare/v5.0.2...v5.0.3)
* Add patron comment token for staff slips. Refs UICHKIN-248.

## [5.0.2] (https://github.com/folio-org/ui-checkin/tree/v5.0.2) (2021-04-21)
[Full Changelog](https://github.com/folio-org/ui-checkin/compare/v5.0.1...v5.0.2)
* Fix content cut off for two-page staff slips. Refs UICHKIN-245.

## [5.0.1] (https://github.com/folio-org/ui-checkin/tree/v5.0.1) (2021-04-13)
[Full Changelog](https://github.com/folio-org/ui-checkin/compare/v5.0.0...v5.0.1)
* Navigating back to `Checkin` page leads to error message. Refs UICHKIN-239.
* The fee/fine account is fully closed when Claimed Returned item is checked in. Refs UICHKIN-235.

## [5.0.0] (https://github.com/folio-org/ui-checkin/tree/v5.0.0) (2021-03-10)
[Full Changelog](https://github.com/folio-org/ui-checkin/compare/v4.0.2...v5.0.0)
* Fix typo in status label. Fixes UICHKIN-211.
* Display patron notes in `<ConfirmStatusModal>`. Refs UICHKIN-208.
* Check in items with Restricted status. Refs UICHKIN-221.
* Prevent check in when item with intellectual item status is scanned. Refs UICHKIN-210.
* Update to stripes v6. Refs UICHKIN-226.
* Fix incorrect ref assignment. Refs UICHKIN-205.
* Increment `@folio/stripes-cli` to `v2`. Refs UICHKIN-231.
* Show confirmation modal when check in an item with one of the new statuses (Long missing, In process (non-requestable), Unavailable, Unknown). Refs UICHKIN-120.
* Claim returned: Cancel SET COST fee at check in. Refs UICHKIN-225
* Add support for optional `readyPrefix` property at the module level in stripes.config.js. If set, this prefix will be displayed in the title when the app is ready to receive a scanned item barcode. Implements UICHKIN-224.

## [4.0.2] (https://github.com/folio-org/ui-checkin/tree/v4.0.2) (2021-01-22)
[Full Changelog](https://github.com/folio-org/ui-checkin/compare/v4.0.1...v4.0.2)

* Barcode image not rendering on staff slips. Refs UICHKIN-220.

## [4.0.1] (https://github.com/folio-org/ui-checkin/tree/v4.0.1) (2020-11-12)
[Full Changelog](https://github.com/folio-org/ui-checkin/compare/v4.0.0...v4.0.1)

* `Timepicker` defaults to local time. Refs UICHKIN-206.
* Clear `checkinNotesMode` after succesful checkin or cancel. Fixes UICHKIN-207.

## [4.0.0] (https://github.com/folio-org/ui-checkin/tree/v4.0.0) (2020-10-08)
[Full Changelog](https://github.com/folio-org/ui-checkin/compare/v3.0.0...v4.0.0)

* Refactor from `bigtest/mirage` to `miragejs`.
* Increment `@folio/stripes` to `v5`, `react-router` to `v5.2`.
* Only show fees/fines for checkin items when loan ID matches. Fixes UICHKIN-183.
* Fix `{{requester.country}}` token not populating in delivery staff slip. Fixes UICHKIN-190.
* Show confirmation modal when an item with the status `Aged to lost` is checked in. Refs UICHKIN-164.
* Escape values passed to `react-to-print`. Fixes UICHKIN-193.
* Update `react-intl` to `v5.7.0`.
* Fixed issue where tooltip were rendering on top of the dropdown on the actions button. UICHKIN-198.
* Handle malformed timestamps. Refs UICHKIN-195.
* Apply MultiColumnList columnWidths API - UICHKIN-199
* Change ' ' column header from gear icon to 'Actions' text.
* Localize permission names. Refs UICHKIN-201.
* Display source as last name, first name. Fixes UICHKIN-147.

## [3.0.0] (https://github.com/folio-org/ui-checkin/tree/v3.0.0) (2020-06-11)
[Full Changelog](https://github.com/folio-org/ui-checkin/compare/v2.0.1...v3.0.0)

* Upgrade to `stripes` `4.0`, `react-intl` `4.5`. Refs STRIPES-672.
* Check for `accounts.collection.get` permission before rendering fee/fines components. Fixes UICHKIN-174.
* Fix import path to stripes util. Fixes UICHKIN-175.
* Show confirmation modal when item with withdrawn status is checked in. Refs UICHKIN-126.
* Purge `intlShape` in prep for `react-intl` `v4` migration. Refs STRIPES-672.
* Clear Check In Page When Session Expires. Refs UICHCKIN-177.
* Add support for checking in Claimed returned items. Refs UICHKIN-116.
* Add link to request details in action menu. Refs UICHKIN-103.
* Don't lookup undefined country value (cleans up testing output).
* Show confirmation modal when an item with the status `Lost and paid` is checked in. Refs UICHKIN-119.
* Refactor forms to use final-form. Refs UICHKIN-157.

## [2.0.1](https://github.com/folio-org/ui-checkin/tree/v2.0.1) (2020-04-28)
[Full Changelog](https://github.com/folio-org/ui-checkin/compare/v2.0.0...v2.0.1)

* do not send duplicate check-in notices. Fixes UICHKIN-176.

## [2.0.0](https://github.com/folio-org/ui-checkin/tree/v2.0.0) (2020-03-13)
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
