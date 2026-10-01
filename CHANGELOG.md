# Changelog

All notable changes to Mellow Visual Timer are documented in this file. Longer discussions of why a
change was made live in [DEVLOG.md](DEVLOG.md).

## [Unreleased]

### Added

- A compact layout for square windows: the dial is centered and sized by the shorter viewport side, with the controls moved to the four corners.
- The compact layout also takes over whenever either viewport side drops to 256px or less, whatever the proportion.
- Corner controls become rounded tiles with the dial subtracted from them, so their inner edge follows the dial's arc, once a round button would reach into it.
- A single 8px gap in the compact layout: between the dial and the window, between a control and the window, and between the dial and each control.
- A Compact layout setting to restrict that layout to small windows, so large square windows keep the regular layout.
- A setting for the remaining time in the compact layout: inside the dial, in the top-right corner, or hidden. In the corner option the unit switch takes the spot the countdown leaves on the dial.

### Changed

- Mirrored the bottom controls of the compact layout relative to the control row: reset on the left, add-time on the right.
- Split the control row into individual buttons (`ListOrAddButton`, `StartStopButton`, `SettingsOrResetButton`) so the vertical, horizontal, and compact layouts share the same controls.
- Replaced the `useAspectRatio` hook with `useViewportMetrics`, which also reports the viewport sides.

### Fixed

- The dial is no longer pushed below the center of the window when the window is reduced to a small square.
- The minutes/seconds switch no longer reappears while a timer is paused, where using it would silently reset the countdown.

### Changed (deployment)

- Allowed `https://kuuh4.github.io` as an origin of the notifications Worker and pointed `homepage` at this fork's GitHub Pages URL.

## [0.5.0] - 2026-08-22

### Added

- Reliable background completion alerts through Web Push and a Cloudflare Durable Object scheduler.
- A Background alerts control in Timer & Sound settings, including platform guidance for installed iPhone and iPad PWAs.
- A single, non-intrusive running-status notification while a timer continues in the background.
- A Test alert action for confirming that background notifications work on the current device.

### Changed

- Enabled Cloudflare Worker observability for timer-scheduling requests and Durable Object failures.

### Fixed

- Persisted uploaded alarm audio and made its preview controllable and removable from settings.
- Derived timer state from an absolute end time so timer completion remains accurate after background throttling.
- Made pause, reset, and foreground return cancel or refresh the background alert correctly.
- Request notification permission from the first manual timer start and deliver running-status messages before the page is controlled by the service worker.
- Restored the negative elapsed-time display after a timer completes without retriggering completion handling.
- Registered the development service worker with its app-shell fallback so local notification testing works.
- Created a Push subscription when notification permission was granted before background alerts were enabled.
- Tightened the spacing of links in the About & Developer settings tab.

## [0.4.1] - 2026-08-20

### Fixed

- Made alarm previews consistently stoppable from the settings control, including synthesized alarm sounds.
- Decoupled timer-editor surfaces from the browser color scheme so they follow the selected app theme.
- Widened desktop timer cards and aligned the Routine Timer interactive dial with the Basic Timer editor.

### Changed

- Added staged-file formatting through `lint-staged` and Prettier.

## [0.4.0] - 2026-08-19

### Added

- Compact, expandable routine-step editor for creating and editing sequential timers.
- Context-aware timer creation: the Basic and Routine filters open their matching timer form.

### Changed

- Unified timer type, duration-unit, and list-filter controls with sliding segmented controls.
- Simplified timer cards to prioritize the timer information and management actions.
- Updated the About version and README to reflect the v0.4.0 release.

### Fixed

- Dragging a clock face no longer scrolls the surrounding view; scrolling remains available outside the dial.

## [0.3.0] - 2026-08-19

### Added

- Focus session history, daily and weekly focus statistics, and streak tracking.
- Downloadable social sharing image cards for daily focus achievements.
- Preset alarm sounds, volume control, and custom audio uploads.
- Five built-in themes and custom theme management.
- About-tab version information with a link to release notes.

### Changed

- Combined timer direction, alarm sound, and volume settings into one tab.
- Simplified the focus-statistics sharing UI and added distinct KPI emoji markers.
- Migrated the app build to Vite with Vite PWA support.
