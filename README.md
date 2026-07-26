# Shelter Finder

Shelter Finder is a responsive React application that helps users review recent shelter information, save favourite shelters, and submit shelter status updates even when the device is offline.

The project was developed by **Ray Yang** and **Gedeon Kebede** for Modern Web Development.

## Project Purpose

People may need shelter information during emergencies when internet access is unreliable. Shelter Finder keeps recently loaded shelter data in the browser, clearly warns the user when offline mode is active, and allows shelter updates to be saved locally.

When the connection returns, the application sends pending updates to Back4App through Parse Cloud Code.

The newest shelter version remains in the main `Shelter` class. The older version is preserved in `ShelterHistory`.

## Feature 6 User Stories

### 1. Offline shelter information

- Recently loaded shelter information is cached in browser storage.
- Cached information remains visible when the browser goes offline.
- An offline notification tells the user that offline mode is active.

### 2. Offline shelter updates

- A user can select a shelter.
- A user can choose a new shelter status.
- A user can enter an update note.
- The update is stored locally while offline.
- Pending updates remain visible until synchronization succeeds.
- Failed updates remain in the pending queue instead of being deleted.

### 3. Reconnection and historical records

- The application detects when the internet connection returns.
- Pending updates are sent to the `syncShelterUpdate` Parse Cloud Function.
- The Cloud Function compares the offline `clientUpdatedAt` value with the current server timestamp.
- The newest version is stored in `Shelter`.
- The older version is stored as a historical snapshot in `ShelterHistory`.
- A local pending update is removed only after the server confirms success.

## Feature 6 Developer Stories

### Back4App and Parse Cloud Code

The application uses:

- Back4App as the Parse Server host
- Parse JavaScript SDK in the React frontend
- Parse Cloud Code for protected synchronization
- `Shelter` for current shelter data
- `ShelterHistory` for older versions

The Parse Master Key is never stored in the React application or committed to GitHub.

### Material UI

The Shelter Details and Favourites modules use Material UI components, including:

- `Card`
- `Button`
- `Chip`
- `Tabs`
- `Dialog`
- `Typography`
- `Stack`
- Material UI icons

Responsive Material UI breakpoints provide:

- one-column cards on mobile;
- vertically stacked buttons on smaller screens;
- wider cards and horizontal actions on larger screens;
- a responsive Shelter Details dialog;
- keyboard-accessible controls;
- descriptive ARIA labels.

## Main Technologies

- React
- Vite
- JavaScript
- Material UI
- Emotion
- Parse JavaScript SDK
- Back4App
- Parse Cloud Code
- Local Storage
- Git
- GitHub

## Project Structure

```text
src/
├── Components/
│   ├── Favourites.jsx
│   ├── OfflineBanner.jsx
│   ├── OfflineUpdateForm.jsx
│   ├── ShelterCard.jsx
│   └── ShelterDetails.jsx
├── Hooks/
│   └── useOnlineStatus.js
├── Service/
│   ├── OfflineStorage.js
│   ├── OfflineUpdates.js
│   ├── ParseClient.js
│   └── ShelterService.js
├── cloud/
│   └── main.js
├── App.jsx
├── App.css
└── main.jsx



Testing the Offline Workflow

Start the application while online.
Confirm shelter data appears.
Open Chrome DevTools.
Open the Network tab.
Change the network setting to Offline.
Confirm the offline notification appears.
Confirm recent shelter information remains visible.
Select a shelter.
Choose a new status.
Enter an update note.
Save the update.
Confirm the update appears in the pending queue.
Change the network setting back to No throttling.
Confirm synchronization succeeds.
Confirm the pending item disappears.
Verify the newest data in Shelter.
Verify the older version in ShelterHistory.
Testing Material UI
Open the Shelter tab.
Select View Details on a shelter.
Confirm the Material UI dialog opens.
Confirm the dialog displays:
shelter name;
shelter status;
distance;
services;
latest note;
last updated time.
Add the shelter to Favourites.
Open the Favourites tab.
Confirm the shelter appears.
Remove the favourite.
Refresh the page.
Confirm saved favourites persist correctly.
Test the page at desktop and mobile widths.
Accessibility

The application includes:

semantic headings;
labelled form controls;
status messages using role="status";
live synchronization announcements using aria-live;
descriptive button labels;
aria-pressed on favourite controls;
keyboard-accessible Material UI dialogs;
keyboard-accessible buttons;
responsive layouts for mobile and desktop screens.
Design Decisions
Why Local Storage?

Local Storage allows recent shelter data and pending edits to remain available without a network connection.

It is simple and appropriate for the small amount of demonstration data used in this project.

For a larger application, IndexedDB would be a stronger option because it can handle larger and more structured offline data.

Why Parse Cloud Code?

Cloud Code protects database writes and keeps conflict-resolution logic on the server.

It also prevents privileged operations and the Master Key from being placed in the browser.

Why clientUpdatedAt?

Parse updatedAt represents the time the server saves an object.

An offline update may have been created much earlier.

clientUpdatedAt preserves the actual time the user made the update, so it provides a more accurate conflict comparison.

Why Material UI?

Material UI provides reusable React components with consistent styling, responsive breakpoints, and accessibility support.

This follows the class discussion of Material UI as a React-focused system of flexible, prebuilt interface components.

Known Limitations
The map area is currently a visual placeholder.
ZIP-code filtering depends on the team’s final integration.
Local Storage is suitable for this project, but IndexedDB would scale better for a larger offline dataset.
The production JavaScript bundle is larger than 500 kB.
Automated tests have not yet been added for every offline conflict case.
Future Improvements
Complete the interactive shelter map.
Connect ZIP-code searching to shelter filtering.
Add automated tests for the offline queue.
Add automated tests for Cloud Code conflict resolution.
Add lazy loading and code splitting.
Move repeated shelter-status formatting into one shared utility.
Add authentication and role-based access for ShelterHistory.
Add more realistic shelter data.
Contributors
Ray Yang — Student B
Offline shelter-data caching
Offline-mode notification
Offline update form
Local pending-update queue
Automatic synchronization
Parse Cloud Code integration
ShelterHistory archival workflow
Shelter Details module
Favourites module
Material UI responsiveness
Material UI accessibility
Gedeon Kebede — Student A
Team application features
Database integration
Other assigned shelter modules
Team integration support