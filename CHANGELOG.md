# Change Log
All notable changes to this project will be documented in this file.
 
The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).


## [0.1.0] - 2026-06-29 (Gedeon Kebede)
  
Initial upload
 
### Added
- Parse models and classes
- Initialized data in back4app
 
## [0.2.0] - 2026-06-29 (Ray Yang)
 
### Added
- Routing for navigation between web pages
- Fleshed out design for web pages and integration with Parse models

## [0.3.0] - 2026-07-07 

### Added (Ray Yang)
- Added Student B Parse authentication service methods for register, login, logout, current user, and auth checking.
- Added login/register form handling through the shared AuthForm component.
- Added logout route and auth redirects for already authenticated users.

### Added (Gedeon Kebede)
- Added protected route integration to use the auth service check and redirect unauthenticated users to login.

### Changed (Ray Yang)
- Updated auth routes to use /auth, /auth/register, and /auth/login consistently.

## [0.4.0] - 2026-07-20

### Changed (Gedeon Kebede)
- Main page is now a basic shelter-finder
- new Parse class for shelters
    - info on name, distance, capacity, pets, wheelchair accessibility, and medical assistance
- added card design for each shelter

## [0.5.0] - 2026-07-25

### Added

- Added offline connection detection.
- Added a visible offline-mode notification.
- Added browser caching for recently loaded shelter information.
- Added fallback behavior that displays cached shelter data when live data cannot be loaded.
- Added an offline shelter update form.
- Added shelter status selection.
- Added shelter update notes.
- Added a local pending-update queue using Local Storage.
- Added pending-update status messages.
- Added manual pending-update deletion controls.
- Added automatic synchronization when the browser returns online.
- Added the Parse Cloud Function `syncShelterUpdate`.
- Added timestamp conflict resolution using `clientUpdatedAt`.
- Added the `ShelterHistory` class for archived shelter versions.
- Added logic that stores the older version as a historical record.
- Added logic that keeps the newest version in the `Shelter` class.
- Added logic that removes pending updates only after server confirmation.
- Added protected Cloud Code database writes.
- Added Material UI to the React frontend.
- Added a responsive Material UI Shelter Details dialog.
- Added a responsive Material UI Favourites module.
- Added persistent favourite shelter IDs using Local Storage.
- Added Material UI cards.
- Added Material UI chips.
- Added Material UI tabs.
- Added Material UI buttons.
- Added Material UI icons.
- Added accessible button labels.
- Added `aria-pressed` to favourite controls.
- Added live synchronization announcements.
- Added keyboard-accessible dialog controls.
- Added responsive mobile layouts.
- Added responsive desktop layouts.
- Added synchronization success messages.
- Added synchronization failure messages.

### Changed

- Converted shelter cards to Material UI components.
- Updated shelter cards to display status.
- Updated shelter cards to display distance.
- Updated shelter cards to display services.
- Updated shelter cards to display notes.
- Updated shelter cards to display update time.
- Added Shelters and Favourites tabs.
- Updated the application layout for desktop and mobile.
- Updated the frontend service layer to call Parse Cloud Code.
- Replaced direct shelter updates with Cloud Code synchronization.
- Updated the pending-update workflow to process older updates first.
- Updated cached shelter data after successful synchronization.
- Updated Back4App permissions so the frontend can read shelters.
- Restricted direct public shelter writes.
- Updated the production build with Material UI dependencies.
- Updated status colors for open, limited, full, and closed shelters.
- Updated the Shelter Details module with responsive layout behavior.
- Updated the Favourites module with responsive card behavior.

### Fixed

- Fixed the unresolved Material UI delete icon import.
- Fixed React warnings caused by passing `flexWrap` directly to DOM elements.
- Fixed React warnings caused by passing `justifyContent` directly to DOM elements.
- Fixed React warnings caused by passing `alignItems` directly to DOM elements.
- Fixed pending updates disappearing before server confirmation.
- Fixed the Cloud Function deployment issue.
- Fixed the invalid `syncShelterUpdate` function error.
- Fixed Shelter read-permission errors.
- Fixed cached-data fallback handling.
- Fixed pending synchronization messages.
- Fixed inconsistent status color handling.
- Fixed uppercase and lowercase shelter-status comparisons.
- Fixed failed updates being removed too early.
- Fixed the frontend shelter list not refreshing after synchronization.

### Security

- Kept the Parse Master Key out of the React frontend.
- Kept the Parse Master Key out of GitHub.
- Kept Back4App account credentials out of the repository.
- Routed protected Shelter writes through Parse Cloud Code.
- Routed ShelterHistory creation through Parse Cloud Code.
- Restricted direct public database updates.
- Restricted direct public database deletion.
- Allowed only required public Shelter read permissions.

### Verification

- Confirmed `npm run build` completes successfully.
- Confirmed Material UI compiles successfully.
- Confirmed offline shelter information remains visible.
- Confirmed offline updates can be saved locally.
- Confirmed pending updates appear in the local queue.
- Confirmed pending updates synchronize after reconnection.
- Confirmed synchronized updates disappear from the pending queue.
- Confirmed the newest version is stored in Shelter.
- Confirmed the older version is stored in ShelterHistory.
- Confirmed the Shelter Details dialog opens.
- Confirmed favourites can be added.
- Confirmed favourites can be removed.
- Confirmed favourites persist after refresh.
- Confirmed Material UI cards display correctly.
- Confirmed Material UI tabs display correctly.
- Confirmed Material UI icons display correctly.
- Confirmed the interface works at mobile width.
- Confirmed the interface works at desktop width.

## Earlier Development

### Added

- Created the initial Vite and React project.
- Added the Parse JavaScript SDK.
- Added Back4App connection configuration.
- Added shelter data loading.
- Added the original shelter cards.
- Added the search interface.
- Added the first project styles.
- Added team Git branches.
- Added the team integration workflow.
- Added the application service layer.
- Added React component structure.
- Added the initial shelter database connection.