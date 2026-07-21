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