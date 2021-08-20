# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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

[Unreleased]: https://github.com/lucassabreu/comment-coverage-clover/compare/v0.1.4...HEAD
[0.1.4]: https://github.com/lucassabreu/comment-coverage-clover/compare/v0.1.4...v0.1.4
[0.1.3]: https://github.com/lucassabreu/comment-coverage-clover/compare/v0.1.2...v0.1.3
[0.1.2]: https://github.com/lucassabreu/comment-coverage-clover/compare/v0.1.1...v0.1.2
[0.1.1]: https://github.com/lucassabreu/comment-coverage-clover/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/lucassabreu/comment-coverage-clover/compare/v0.0.1...v0.1.0
[0.0.1]: https://github.com/lucassabreu/comment-coverage-clover/releases/tag/v0.0.1
