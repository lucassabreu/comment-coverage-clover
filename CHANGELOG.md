# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.15.4] - 2025-05-15

### Changed
- update dependencies for security reasons

## [0.15.3] - 2025-03-04

### Added
- sourcemap to help debugging

### Changed
- update dependencies for security reasons

## [0.15.2] - 2025-02-18

### Changed
- update dependencies for security reasons

## [0.15.1] - 2024-12-20

### Fixed
- increase and decrease default icons were wrong and don't exist

## [0.15.0] - 2024-12-20

### Added

- support to choosing which icons to use to better fit users situations

## [0.14.0] - 2024-09-24

### Fixed
- fix link on README about PAT

### Changed
- update dependencies for security reasons

### Thanks

Thank you to [@tom-reinders](https://github.com/tom-reinders) for improving the project on PR [#55](https://github.com/lucassabreu/comment-coverage-clover/pull/55)

## [0.13.0] - 2024-03-20

### Added

- explanation about forks and token permissions with them.
- new option `skip-comments-on-forks` to prevent blocking pull requests from forks because of lack of
  permissions.

### Changed

- improving error reporting for debugging purposes

## [0.12.0] - 2024-02-02

### Added

- create job step summary

## [0.11.0] - 2024-01-29

### Changed

- update action to node20

## [0.10.4] - 2023-11-01

### Fixed

- cover report with baseline example did not skip cover report action out of pull requests.

## [0.10.3] - 2023-10-19

### Added

- scopes required for the `github-token` input
- `signature` input documented on README

### Fixed

- when the token set for the action is not valid the action will now fail with an error.
- if the workflow context does no have a pull request the action will fail with an error.

## [0.10.2] - 2023-07-14

### Fixed

- security update for semver library

## [0.10.1] - 2023-07-11

### Fixed

- security update for semver library

## [0.10.0] - 2023-05-31

### Added

- better support for personal access tokens
  (asked for at [#35](https://github.com/lucassabreu/comment-coverage-clover/issues/35))

### Changed

- dependencies upgraded

## [0.9.4] - 2023-05-25

### Added

- note about the marketplace releases

## [0.9.3] - 2023-05-24

### Added

- option `with-branches` to control if the column `Branches` show be rendered

### Fixed

- plural of `branch` is `branches` ([#34](https://github.com/lucassabreu/comment-coverage-clover/issues/34))

## [0.9.2] - 2023-03-21

### Fixed

- when there was one package or file on a package the action failed to process the files

## [0.9.1] - 2023-03-01

### Added

- support for clover files generated from `jest`

### Thanks

Thank you to [@jacekk](https://github.com/jacekk) for improving the project on PR [#27](https://github.com/lucassabreu/comment-coverage-clover/pull/27)

## [0.9.0] - 2023-02-17

### Fixed

- when no files/lines are left after the filters the comment will show "No files reported or matching filters"
  on the table.
- when the size of the comment becomes too big for Github, the table will be cut short with the comment
  "Table truncated to fit comment"

## [0.8.0] - 2022-11-02

### Added

- option `table-coverage-change` to filter files shown on table by percentage change of a file.
- option `show-percentage-change-on-table` to show coverage changes on the table

## [0.7.1] - 2022-11-02

### Fixed

- action was "panicking" when the `file` with the coverage was not found, a clearer message is shown now.

## [0.7.0] - 2022-10-21

### Changed

- upgrading node version to 16

### Thanks

Thank you to [@sertxudev](https://github.com/sertxudev) for the contribution at [#21](https://github.com/lucassabreu/comment-coverage-clover/pull/21).

## [0.6.0] - 2022-09-20

### Added

- new option `only-with-coverable-lines` to filter out files that don't have lines of code to check.

## [0.5.2] - 2022-08-18

### Fixed

- `@actions/core` has Delimiter Injection Vulnerability in exportVariable

## [0.5.1] - 2022-01-19

### Fixed

- parameter should be name `table-below-coverage`, not `table-bellow-coverage`

## [0.5.0] - 2022-01-18

### Added

- options `table-type-coverage`, `table-bellow-coverage` and
  `table-above-coverage` to allow users to hide files where the coverage is out
  of a range, that way large projects were most files are above 80% coverage
  can hide the ones bellow that.

## [0.4.2] - 2022-01-07

### Fixed

- fixing typo "Lengend" to "Legend" (thanks [@DennisLammers](https://github.com/DennisLammers))

## [0.4.1] - 2021-12-17

### Fixed

- option `with-table` was "hidding" the summary totals.

## [0.4.0] - 2021-12-17

### Added

- option `with-table` to show the table summary (on by default)

## [0.3.0] - 2021-08-19

### Added

- options `max-line-coverage-decrease` to fail the action when the diff
between current and previous coverage percentage of lines or methods is
above a threshold
- options `min-line-coverage` and `min-method-coverage` to fail the action
when coverage percentage of lines or methods goes below a threshold

## [0.2.0] - 2021-08-19

### Changed
- examples on readme changed to use `@main` instead of `@v0.1.4`

### Added
- a ascii chart will be generated with the distribution of coverage to help
visualize the state of the project.

## [0.1.5] - 2021-08-17
### Added
- support for a custom signature on the pull request comment.
- example on readme on how to use artifacts to compare coverage between base
branch and current commit.
- this changelod file to help keep track of repository progression.

### Changed
- when `base-file` is not found an non-blocking error will be created on the
workflow for user diagnosis, instead of just skipping it.
- release workflow now uses notes from `CHANLOG.md` on release summary.

## [0.1.4] - 2021-08-16
### Changed
- example workflow now simulates a missing `base-file`

### Fixed
- missing `base-file` was being converted to `false`, which breaks action

## [0.1.3] - 2021-08-16
### Fixed
- prevent action from failing if the `base-file` was not found.

## [0.1.2] - 2021-08-16
### Fixed
- indentation and steps on readme's example workflow

## [0.1.1] - 2021-08-15
### Fixed
- small adjustments on readme
- missing properties on `action.yml`

### Added
- release the action on github marketplace to be discoverable.

## [0.1.0] - 2021-08-15
### Added
- a readme explaining what the action was about and how to set it up.
- support to compare current coverage report with a previous one and add it to
pull request comment.
- clover.xml examples and a example workflow to test the action before release.

## [0.0.1] - 2021-08-15
### Added
into comments in the pull request.
- guaranteeing that only one comment will be created on the pull request.
- inspired on [danhunsaker/clover-reporter-action](https://github.com/danhunsaker/clover-reporter-action)
and [FirebaseExtended/action-hosting-deploy](https://github.com/FirebaseExtended/action-hosting-deploy)
- typescript choose as the language for the action and [rollup.js](https://rollupjs.org/guide/en/)
as bundling tool.
- implemented base action reading clover.xml files and converting then.
- release.yml workflow to auto-release tags

[Unreleased]: https://github.com/lucassabreu/comment-coverage-clover/compare/v0.15.4...HEAD
[0.15.4]: https://github.com/lucassabreu/comment-coverage-clover/compare/v0.15.3...v0.15.4
[0.15.3]: https://github.com/lucassabreu/comment-coverage-clover/compare/v0.15.2...v0.15.3
[0.15.2]: https://github.com/lucassabreu/comment-coverage-clover/compare/v0.15.1...v0.15.2
[0.15.1]: https://github.com/lucassabreu/comment-coverage-clover/compare/v0.15.0...v0.15.1
[0.15.0]: https://github.com/lucassabreu/comment-coverage-clover/compare/v0.14.0...v0.15.0
[0.14.0]: https://github.com/lucassabreu/comment-coverage-clover/compare/v0.13.0...v0.14.0
[0.13.0]: https://github.com/lucassabreu/comment-coverage-clover/compare/v0.12.0...v0.13.0
[0.12.0]: https://github.com/lucassabreu/comment-coverage-clover/compare/v0.11.0...v0.12.0
[0.11.0]: https://github.com/lucassabreu/comment-coverage-clover/compare/v0.10.2...v0.11.0
[0.10.4]: https://github.com/lucassabreu/comment-coverage-clover/compare/v0.10.1...v0.10.2
[0.10.3]: https://github.com/lucassabreu/comment-coverage-clover/compare/v0.10.1...v0.10.2
[0.10.2]: https://github.com/lucassabreu/comment-coverage-clover/compare/v0.10.1...v0.10.2
[0.10.1]: https://github.com/lucassabreu/comment-coverage-clover/compare/v0.10.0...v0.10.1
[0.10.0]: https://github.com/lucassabreu/comment-coverage-clover/compare/v0.9.4...v0.10.0
[0.9.4]: https://github.com/lucassabreu/comment-coverage-clover/compare/v0.9.3...v0.9.4
[0.9.3]: https://github.com/lucassabreu/comment-coverage-clover/compare/v0.9.2...v0.9.3
[0.9.2]: https://github.com/lucassabreu/comment-coverage-clover/compare/v0.9.1...v0.9.2
[0.9.1]: https://github.com/lucassabreu/comment-coverage-clover/compare/v0.9.0...v0.9.1
[0.9.0]: https://github.com/lucassabreu/comment-coverage-clover/compare/v0.8.0...v0.9.0
[0.8.0]: https://github.com/lucassabreu/comment-coverage-clover/compare/v0.7.1...v0.8.0
[0.7.1]: https://github.com/lucassabreu/comment-coverage-clover/compare/v0.7.0...v0.7.1
[0.7.0]: https://github.com/lucassabreu/comment-coverage-clover/compare/v0.6.0...v0.7.0
[0.6.0]: https://github.com/lucassabreu/comment-coverage-clover/compare/v0.5.2...v0.6.0
[0.5.2]: https://github.com/lucassabreu/comment-coverage-clover/compare/v0.5.1...v0.5.2
[0.5.1]: https://github.com/lucassabreu/comment-coverage-clover/compare/v0.5.0...v0.5.1
[0.5.0]: https://github.com/lucassabreu/comment-coverage-clover/compare/v0.4.2...v0.5.0
[0.4.2]: https://github.com/lucassabreu/comment-coverage-clover/compare/v0.4.1...v0.4.2
[0.4.1]: https://github.com/lucassabreu/comment-coverage-clover/compare/v0.4.0...v0.4.1
[0.4.0]: https://github.com/lucassabreu/comment-coverage-clover/compare/v0.3.0...v0.4.0
[0.3.0]: https://github.com/lucassabreu/comment-coverage-clover/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/lucassabreu/comment-coverage-clover/compare/v0.1.5...v0.2.0
[0.1.5]: https://github.com/lucassabreu/comment-coverage-clover/compare/v0.1.4...v0.1.5
[0.1.4]: https://github.com/lucassabreu/comment-coverage-clover/compare/v0.1.3...v0.1.4
[0.1.3]: https://github.com/lucassabreu/comment-coverage-clover/compare/v0.1.2...v0.1.3
[0.1.2]: https://github.com/lucassabreu/comment-coverage-clover/compare/v0.1.1...v0.1.2
[0.1.1]: https://github.com/lucassabreu/comment-coverage-clover/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/lucassabreu/comment-coverage-clover/compare/v0.0.1...v0.1.0
[0.0.1]: https://github.com/lucassabreu/comment-coverage-clover/releases/tag/v0.0.1
