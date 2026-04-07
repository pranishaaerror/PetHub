# PetHub Data And API Map

## Database Schema Plan
### User
- `fullName`
- `email`
- `passwordHash`
- `phoneNumber`
- `role`
- `onboardingCompleted`
- `onboardingStep`
- `onboardingDraft`
- `authProvider`
- `avatar`
- `preferences`
- `createdAt`
- `updatedAt`

### Pet
- `userId`
- `photoUrl`
- `name`
- `species`
- `breed`
- `gender`
- `dob`
- `age`
- `weight`
- `color`
- `microchipId`
- `vaccinationStatus`
- `allergies`
- `medicalConditions`
- `medications`
- `preferredClinic`
- `planType`
- `createdAt`
- `updatedAt`

### MedicalRecord
- `userId`
- `petId`
- `type`
- `title`
- `description`
- `documentUrl`
- `date`
- `nextDueDate`
- `createdAt`

### Booking
Stored with `AppointmentTable` and booking metadata:
- `userId`
- `petId`
- `serviceId`
- `ownerName`
- `contactNumber`
- `petName`
- `petType`
- `note`
- `appointmentTime`
- `bookingId`
- `status`
- `payment`
- `createdAt`

### AdoptionPet
Stored with `Adoption`:
- `petName`
- `breed`
- `age`
- `gender`
- `intakeDate`
- `status`
- plus decorated frontend presentation data

### AdoptionRequest
- `userId`
- `petId`
- `status`
- `message`
- `fullName`
- `email`
- `contactNumber`
- `householdType`
- `lifestyle`
- `createdAt`
- `updatedAt`

### CommunityMeetup
- `title`
- `description`
- `type`
- `date`
- `time`
- `location`
- `hostName`
- `tags`
- `energy`
- `attendees`
- `createdAt`

### Notification
- `userId`
- `title`
- `message`
- `type`
- `isRead`
- `createdAt`

## API Route Map
### Auth
- `POST /api/auth/signup`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `POST /api/auth/me`
- `PATCH /api/auth/profile`
- `POST /api/auth/google`
- `POST /api/auth/forgot-password/request-otp`
- `POST /api/auth/forgot-password/verify-otp`
- `POST /api/auth/forgot-password/reset`

### Users And Pets
- `GET /api/users/me`
- `PATCH /api/users/me`
- `GET /api/pets/me`
- `POST /api/pets`
- `GET /api/pets/:id`
- `PATCH /api/pets/:id`
- `POST /api/pets/:id/photo`

### Onboarding
- `GET /api/onboarding/status`
- `POST /api/onboarding/save-step`
- `POST /api/onboarding/complete`

### Medical Records
- `POST /api/records`
- `GET /api/records/:petId`
- `PATCH /api/records/:id`
- `DELETE /api/records/:id`

### Bookings
- `POST /api/bookings`
- `GET /api/bookings/me`
- `PATCH /api/bookings/:id/reschedule`
- `PATCH /api/bookings/:id/cancel`

Legacy compatibility remains for the older appointment endpoints already in the project.

### Adoption
- `GET /api/adoption`
- `GET /api/adoption/:id`
- `GET /api/adoption-pets`
- `GET /api/adoption-pets/:id`
- `POST /api/adoption-requests`
- `GET /api/adoption-requests/me`

### Community
- `GET /api/community/posts`
- `GET /api/community/meetups`
- `POST /api/community/rsvp`
- `POST /api/community/message`

### Notifications
- `GET /api/notifications`
- `PATCH /api/notifications/:id/read`

### Payments
- `POST /api/payments/esewa/initiate`
- eSewa sandbox callback routes are handled by the backend payment flow

## Seed Strategy
### Adoption
- `backend/adoptionCatalog.js` ensures a default adoption gallery if the collection is empty

### Community
- `backend/communityCatalog.js` ensures starter meetups and discovery content

### Services
- `backend/serviceCatalog.js` ensures live bookable service cards exist in MongoDB

## Integration Flow Summary
1. User authenticates through Firebase.
2. Backend syncs the user into MongoDB.
3. Onboarding saves draft state and creates the first pet profile.
4. Dashboard, records, bookings, adoption, and notifications read against MongoDB-backed resources.
5. Booking confirmation can hand off to eSewa sandbox for NPR-only test payments.
