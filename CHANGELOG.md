<!-- markdownlint-disable -->
# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [v0.1.3] - 2024-09-19

### Added
- Add `String.dedent` where supported/polyfilled

### Changed
- Update dependencies
- Update eslint & config

## [v0.1.2] - 2024-03-12

### Added
- Add functions to load and register languages

### Changed
- Update dependencies
- Switch to using `core.js` for highlight (reduce size by not including languages)
- Update README to reflect changes and instruct on registering languages

## [v0.1.1] - 2024-03-03

### Changed
- Update to `@aegisjsproject/core@0.1.2`

## [v0.1.0] - 2024-02-28

### Added
- Add functions to load `highlight.js` stylesheets and fetch & parse markdown

### Fixed
- Do not publish `test/` directory

### Changed
- Renamed to `@aegisjsproject/markdown`

## [v0.0.3] - 2024-02-26

### Added
- Add `http-server` as dev dependency + `test/` page

### Changed
- Use `@highlightjs/cdn-assets` instead of `hightlight.js`
- Directly use `String.raw` to parse text
- Misc updates to dependencies

### Fixed
- Fix incorrect badges in `README.md`

## [v0.0.2] - 2024-02-08

### Changed
- Update dependencies
- Use `sanitizeString()` instead of `createHTMLParser()`

## [v0.0.1] - 2024-02-05

Initial Release
