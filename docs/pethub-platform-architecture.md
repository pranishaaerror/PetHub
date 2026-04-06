# PetHub Platform Architecture

## Product Direction
PetHub is structured as a warm, premium pet-care platform with a single design system across landing, auth, onboarding, dashboard, records, booking, adoption, community, profile, and notifications.

The visual system uses:
- primary orange `#F5A623`
- cream background `#F4EAD9`
- white and warm beige cards
- large rounded corners
- soft shadows
- dark elegant typography

## Frontend Structure
Frontend lives in `frontend/src` and is organized by reusable app concerns:

- `apis/`
  - Axios client and resource hooks for auth, pets, onboarding, records, bookings, adoption requests, community, notifications, payments, and services
- `components/`
  - shared UI such as onboarding progress, upload cards, empty states, and adoption showcase cards
- `context/`
  - Firebase-backed auth session state
- `layouts/`
  - `ProtectedRoute` and `MainLayout`
- `pages/`
  - route-level product screens
- `utils/`
  - adoption decorators, onboarding draft persistence, auth session helpers, password strength helpers, and navigation search

## Backend Structure
Backend lives in `backend/` and is organized around modular Express routes plus Mongoose models:

- `models/`
  - `User`, `Pet`, `MedicalRecord`, `AppointmentTable`, `Adoption`, `AdoptionRequest`, `CommunityMeetup`, `Notification`, `Services`, `PasswordResetOtp`
- `routes/`
  - auth, users, pets, onboarding, records, bookings, adoption pets, adoption requests, community, notifications, payments, services
- `middleware/`
  - auth guard and upload middleware
- `services/`
  - current-user sync, notifications, mail, eSewa sandbox helpers
- `uploads/`
  - pet image storage

## Auth Strategy
PetHub currently uses a secure token strategy built around Firebase Authentication plus backend verification.

Flow:
1. Frontend signs in with Firebase email/password or Google.
2. Frontend stores the Firebase ID token.
3. Backend `verifyToken` verifies the token on protected routes.
4. Backend syncs the authenticated account into MongoDB through `currentUserService.js`.
5. App routes use onboarding state to determine whether the user should land on onboarding or the dashboard.

This keeps login secure while still allowing a full custom MongoDB profile, pet, booking, adoption, and notification layer.

## Routing Logic
Public routes:
- `/`
- `/login`
- `/signup`
- `/forgot-password`

Protected routes:
- `/onboarding`
- `/dashboard`
- `/medical-records`
- `/service-booking`
- `/adoption`
- `/adoption/:petId`
- `/adoption/:petId/request`
- `/community`
- `/profile`
- `/notifications`

Guard behavior:
- unauthenticated users are redirected to login with a `redirect` query param
- authenticated users with incomplete onboarding are redirected to onboarding
- authenticated users with completed onboarding can access the app shell

## Onboarding Logic
Onboarding is a multi-step guided flow:
1. welcome
2. pet photo upload
3. pet basics
4. health basics
5. preferences
6. completion

Draft behavior:
- local draft is stored in browser storage
- step data is also saved to the backend through `/api/onboarding/save-step`
- completion creates or updates the primary pet record and marks `onboardingCompleted = true`

## Core App Modules
### Dashboard
- personalized greeting
- profile completion state
- pet card with uploaded image
- reminders
- bookings
- recent records
- service highlights
- meetup and notifications surfaces

### Medical Records
- record tabs by type
- pet-specific timeline
- searchable records
- reminders and add-record workflow

### Service Booking
- live service catalog
- required owner and pet details
- booking ID generation
- MongoDB persistence
- appointment listing
- eSewa sandbox payment handoff in NPR

### Adoption
- seeded adoption pets
- detailed pet profiles
- duplicate-safe adoption requests
- request lifecycle visibility

### Community
- meetup and conversation routes
- RSVP and saved interactions

### Notifications
- per-user notification feed with read-state tracking

## Reusable Component Architecture
Shared UI pieces currently include:
- `MainLayout`
- `ProtectedRoute`
- `StepProgress`
- `UploadPetPhotoCard`
- `EmptyState`
- `AdoptionOrbitCarousel`

These components establish the design language used across the platform and are intended to stay reusable as the product grows.
