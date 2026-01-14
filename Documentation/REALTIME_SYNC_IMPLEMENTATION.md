# TechCare Real-Time Data Synchronization Implementation

## Overview

This document outlines the comprehensive real-time data synchronization system implemented across all user roles (Customer, Technician, Admin) in the TechCare application.

## Technology Stack

- **Frontend**: Supabase Realtime subscriptions via `@supabase/supabase-js`
- **Backend**: Express.js with Supabase Admin Client
- **Database**: PostgreSQL (Supabase)

---

## 1. Frontend Real-Time Subscriptions

### Customer Dashboard (`src/pages/CustomerDashboard.jsx`)
**Subscribed Tables:**
- `bookings` - Updates when booking status changes
- `technicians` - Updates when technician info changes

**Triggers Refresh For:**
- Active bookings list
- Booking status changes
- Technician assignment updates

### Technician Dashboard (`src/pages/TechnicianDashboard.jsx`)
**Subscribed Tables:**
- `technicians` (filtered by user_id)
- `bookings`
- `bids`
- `reviews`
- `gigs`

**Triggers Refresh For:**
- Dashboard statistics
- New job availability
- Bid status changes
- New reviews received
- Gig approval status

### Admin Dashboard (`src/pages/Admin.jsx`)
**Subscribed Tables:**
- `profiles`
- `customers`
- `technicians`
- `bookings`
- `reviews`
- `gigs`
- `services`

**Triggers Refresh For:**
- All dashboard statistics
- User/Technician lists
- Booking management
- Review moderation
- Service management

### MobileRepair Page (`src/pages/MobileRepair.jsx`)
**Subscribed Tables:**
- `technicians`

**Triggers Refresh For:**
- Technician listings
- Rating updates
- Availability changes

### Technicians Page (`src/pages/Technicians.jsx`)
**Subscribed Tables:**
- `technicians`

**Triggers Refresh For:**
- Shop listings
- Verification status
- Rating updates

### Booking Tracker (`src/pages/BookingTracker.jsx`)
**Subscribed Tables:**
- `bookings` (filtered by booking_id)

**Triggers Refresh For:**
- Real-time booking status updates
- Progress bar changes

### QuickBookingForm (`src/components/QuickBookingForm.jsx`)
**Subscribed Tables:**
- `technicians`

**Triggers Refresh For:**
- Technician dropdown list
- Availability changes

---

## 2. Cross-Role Notification System

### When Customer Actions Occur:

| Action | Notification Recipient | Backend File |
|--------|----------------------|--------------|
| Create Booking | - (Technicians see via real-time) | `customers.js` |
| Cancel Booking | Assigned Technician | `customers.js` |
| Select Bid | Technician (bid accepted) | `customers.js` |
| Submit Review | Technician (rating updated) | `customers.js` |

### When Technician Actions Occur:

| Action | Notification Recipient | Backend File |
|--------|----------------------|--------------|
| Accept Booking | Customer | `technicians.js` |
| Complete Job | Customer | `technicians.js` |
| Submit Bid | Customer | `technicians.js` |
| Create Gig | Admin (pending approval) | `technicians.js` |

### When Admin Actions Occur:

| Action | Notification Recipient | Backend File |
|--------|----------------------|--------------|
| Verify Technician | Technician | `admin.js` |
| Update Booking | Customer + Technician | `admin.js` |
| Approve/Reject Gig | Technician | `admin.js` |
| Create Service | (All via real-time) | `services.js` |

---

## 3. Real-Time Service Utility

File: `src/utils/realtimeService.js`

A centralized singleton service for managing Supabase subscriptions:

```javascript
import realtimeService from '../utils/realtimeService';

// Subscribe to technicians
const unsubscribe = realtimeService.subscribeToTechnicians((payload) => {
  console.log('Technician updated:', payload);
});

// Cleanup
unsubscribe();
```

**Available Methods:**
- `subscribeToTechnicians(callback)`
- `subscribeToBookings(callback)`
- `subscribeToReviews(callback)`
- `subscribeToServices(callback)`
- `subscribeToGigs(callback)`
- `subscribeToNotifications(userId, callback)`
- `subscribeToBids(callback)`
- `subscribeAll(callbacks)`
- `unsubscribeAll()`

---

## 4. Data Flow Diagram

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Customer  │     │  Technician │     │    Admin    │
└──────┬──────┘     └──────┬──────┘     └──────┬──────┘
       │                   │                   │
       │  Create Booking   │                   │
       ├──────────────────>│                   │
       │                   │ Real-time Update  │
       │                   ├──────────────────>│
       │                   │                   │
       │                   │  Accept Job       │
       │<──────────────────┤                   │
       │ Notification      │                   │
       │                   │                   │
       │                   │                   │  Verify Tech
       │                   │<──────────────────┤
       │                   │ Notification      │
       │ Real-time Update  │                   │
       │<──────────────────│                   │
       │                   │                   │
       └───────────────────┴───────────────────┘
                           │
                    ┌──────┴──────┐
                    │  Supabase   │
                    │  Realtime   │
                    └─────────────┘
```

---

## 5. Fallback Mechanisms

All real-time subscriptions include fallback polling:

- **CustomerDashboard**: 2-minute polling fallback
- **TechnicianDashboard**: 2-minute polling fallback
- **Admin**: 1-minute polling fallback

---

## 6. Testing Real-Time Updates

1. **Customer creates booking** → Technician dashboard immediately shows new available job
2. **Technician accepts job** → Customer dashboard immediately updates with assigned technician
3. **Admin verifies technician** → Technician dashboard shows "Verified" badge, public listings update
4. **Customer submits review** → Technician rating recalculates instantly

---

## 7. Environment Requirements

Ensure `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are correctly set for real-time features to work.

Supabase project must have **Realtime** enabled for the following tables:
- `bookings`
- `technicians`
- `customers`
- `profiles`
- `reviews`
- `gigs`
- `bids`
- `notifications`
- `services`

---

## Changelog

- **2024-01-14**: Initial comprehensive real-time implementation
  - Added Supabase subscriptions to all major dashboards
  - Implemented cross-role notifications for all CRUD operations
  - Created centralized `realtimeService.js` utility
  - Added fallback polling mechanisms
