# TechCare Application - Complete Flow Diagrams

## Table of Contents
1. [System Architecture](#1-system-architecture)
2. [User Roles Overview](#2-user-roles-overview)
3. [Customer Flows](#3-customer-flows)
4. [Technician Flows](#4-technician-flows)
5. [Admin Flows](#5-admin-flows)
6. [Shared Features](#6-shared-features)

---

## 1. System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           FRONTEND (React + Vite)                           │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────────────────┐│
│  │   Pages     │ │ Components  │ │  Context    │ │    Utils/Services       ││
│  │ (40 pages)  │ │ (53 comps)  │ │ (5 ctx)     │ │ (realtime, currency)    ││
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────────────────┘│
└────────────────────────────────────┬────────────────────────────────────────┘
                                     │ HTTP/WebSocket
┌────────────────────────────────────▼────────────────────────────────────────┐
│                        BACKEND (Express.js on Vercel)                        │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────────────────┐│
│  │   Routes    │ │ Middleware  │ │    Lib      │ │       Models            ││
│  │ (16 routes) │ │ (auth,cors) │ │ (supabase)  │ │    (11 models)          ││
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────────────────┘│
└────────────────────────────────────┬────────────────────────────────────────┘
                                     │ PostgreSQL
┌────────────────────────────────────▼────────────────────────────────────────┐
│                         DATABASE (Supabase)                                  │
│  Tables: profiles, customers, technicians, bookings, bids, payments,         │
│          reviews, notifications, gigs, services, favorites, loyalty_*        │
│  Features: Auth, Realtime, Storage, RLS Policies                            │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. User Roles Overview

| Role | Access Level | Dashboard | Key Features |
|------|-------------|-----------|--------------|
| **Guest** | Public | None | Browse, Diagnostics, View Technicians |
| **Customer (user)** | Authenticated | CustomerDashboard | Book repairs, Track, Review, Favorites, Loyalty |
| **Technician** | Authenticated | TechnicianDashboard | Manage jobs, Bids, Gigs, Earnings, Profile |
| **Admin** | Authenticated | Admin | Full CRUD, Verify techs, Approve gigs, Stats |

---

## 3. Customer Flows

### 3.1 Registration Flow
```
[Landing Page] → [Register Button]
       ↓
┌──────────────────┐
│  Register Form   │
│  - Name          │
│  - Email         │
│  - Password      │
│  - Role: user    │
└────────┬─────────┘
         ↓
┌──────────────────┐     ┌──────────────────┐
│ Supabase Auth    │────→│ Create Profile   │
│ Create User      │     │ Create Customer  │
└────────┬─────────┘     └────────┬─────────┘
         ↓                        ↓
    [Login Page] ←───── [Success Message]
```

### 3.2 Booking a Repair (Complete Flow)
```
[Home/Mobile Repair/PC Repair]
         ↓
┌──────────────────────────────────────────────────────┐
│  Step 1: Browse Technicians                          │
│  - View technician cards with ratings                │
│  - Filter by location, service type                  │
│  - See real-time availability                        │
└────────────────────────┬─────────────────────────────┘
                         ↓
┌──────────────────────────────────────────────────────┐
│  Step 2: Select Service & Technician                 │
│  - Choose repair type (screen, battery, etc.)        │
│  - Select technician OR "Find Best Match"            │
└────────────────────────┬─────────────────────────────┘
                         ↓
┌──────────────────────────────────────────────────────┐
│  Step 3: Schedule Page (/schedule)                   │
│  - Device details (brand, model, type)               │
│  - Issue description                                 │
│  - Preferred date/time                               │
│  - Address/location                                  │
└────────────────────────┬─────────────────────────────┘
                         ↓
┌──────────────────────────────────────────────────────┐
│  Step 4: Payment (/payment)                          │
│  - View cost breakdown                               │
│  - Stripe payment (platform fee)                     │
│  - Apply loyalty reward codes                        │
└────────────────────────┬─────────────────────────────┘
                         ↓
┌──────────────────────────────────────────────────────┐
│  Step 5: Booking Created (status: pending)           │
│  - Booking saved to DB                               │
│  - Notification sent to customer                     │
│  - Available to technicians                          │
└────────────────────────┬─────────────────────────────┘
                         ↓
              [Customer Dashboard]
              [Track via /tracker/:id]
```

### 3.3 Bid Selection Flow
```
[Customer Dashboard - View Bids]
         ↓
┌────────────────────────────────┐
│  Multiple Technicians Bid:     │
│  - Technician A: Rs. 5000      │
│  - Technician B: Rs. 4500      │
│  - Technician C: Rs. 5500      │
└──────────────┬─────────────────┘
               ↓
┌────────────────────────────────┐
│  Customer Selects Bid          │
│  - Accept Technician B         │
└──────────────┬─────────────────┘
               ↓
┌────────────────────────────────┐
│  System Actions:               │
│  1. Selected bid → "accepted"  │
│  2. Other bids → "rejected"    │
│  3. Booking → "confirmed"      │
│  4. Technician notified        │
└──────────────┬─────────────────┘
               ↓
        [Booking Confirmed]
```

### 3.4 Review Submission Flow
```
[Completed Booking]
         ↓
┌────────────────────────────────┐
│  Submit Review:                │
│  - Star rating (1-5)           │
│  - Written comment             │
│  - Service quality             │
│  - Communication rating        │
└──────────────┬─────────────────┘
               ↓
┌────────────────────────────────┐
│  System Updates:               │
│  1. Review saved               │
│  2. Technician rating updated  │
│  3. Technician notified        │
│  4. Loyalty points awarded     │
└────────────────────────────────┘
```

---

## 4. Technician Flows

### 4.1 Technician Dashboard Overview
```
┌─────────────────────────────────────────────────────────────────┐
│                    TECHNICIAN DASHBOARD                         │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │ Profile     │  │ Stats       │  │ Earnings    │              │
│  │ - Shop name │  │ - Rating    │  │ - Today     │              │
│  │ - Status    │  │ - Jobs done │  │ - Weekly    │              │
│  │ - Verified  │  │ - Active    │  │ - Pending   │              │
│  └─────────────┘  └─────────────┘  └─────────────┘              │
├─────────────────────────────────────────────────────────────────┤
│  TABS:                                                          │
│  [Active Jobs] [Available Jobs] [Bids] [Gigs] [Reviews] [More]  │
├─────────────────────────────────────────────────────────────────┤
│  Active Jobs:          │  Available Jobs:                       │
│  - In-progress work    │  - Open bookings                       │
│  - Accept/Complete     │  - Submit bids                         │
├────────────────────────┴────────────────────────────────────────┤
│  Gigs (Services):      │  Reviews:                              │
│  - Create custom gigs  │  - View customer feedback              │
│  - Pending approval    │  - Rating breakdown                    │
└─────────────────────────────────────────────────────────────────┘
```

### 4.2 Job Acceptance Flow
```
[Available Jobs List]
         ↓
┌────────────────────────────────┐
│  View Job Details:             │
│  - Device: iPhone 14           │
│  - Issue: Screen cracked       │
│  - Location: Colombo           │
│  - Customer: John D.           │
│  [Accept Job] [Submit Bid]     │
└──────────────┬─────────────────┘
               ↓
      ┌────────┴────────┐
      ▼                 ▼
[Direct Accept]    [Submit Bid]
      │                 │
      ▼                 ▼
┌────────────┐   ┌────────────────┐
│ Booking:   │   │ Bid Created:   │
│ confirmed  │   │ - Amount       │
│ Tech: You  │   │ - Message      │
└─────┬──────┘   │ - Est. time    │
      │          └───────┬────────┘
      ▼                  ▼
[Customer Notified] [Customer Notified]
```

### 4.3 Gig Creation Flow
```
[Technician Dashboard - Create Gig]
         ↓
┌────────────────────────────────┐
│  Gig Details:                  │
│  - Title: "iPhone Screen Fix"  │
│  - Description                 │
│  - Price: Rs. 5000             │
│  - Category: Mobile Repair     │
│  - Duration: 1 hour            │
└──────────────┬─────────────────┘
               ↓
┌────────────────────────────────┐
│  Status: pending               │
│  → Sent to Admin for approval  │
└──────────────┬─────────────────┘
               ↓
      ┌────────┴────────┐
      ▼                 ▼
[Admin Approves]   [Admin Rejects]
      │                 │
      ▼                 ▼
  Status:          Status:
  approved         rejected
  (visible)        (+ feedback)
```

---

## 5. Admin Flows

### 5.1 Admin Dashboard Overview
```
┌─────────────────────────────────────────────────────────────────┐
│                       ADMIN DASHBOARD                           │
├─────────────────────────────────────────────────────────────────┤
│  Stats Cards:                                                   │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐           │
│  │ Users    │ │ Techs    │ │ Bookings │ │ Revenue  │           │
│  │ 150      │ │ 45       │ │ 320      │ │ Rs 2.5M  │           │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘           │
├─────────────────────────────────────────────────────────────────┤
│  SECTIONS:                                                      │
│  [Dashboard] [Users] [Technicians] [Bookings] [Reviews]         │
│  [Services] [Transactions] [Settings]                           │
├─────────────────────────────────────────────────────────────────┤
│  Management Actions:                                            │
│  - CRUD Users/Technicians                                       │
│  - Verify/Unverify Technicians                                  │
│  - Approve/Reject Gigs                                          │
│  - Update Booking Status                                        │
│  - Delete Reviews                                               │
│  - Manage Services                                              │
└─────────────────────────────────────────────────────────────────┘
```

### 5.2 Technician Verification Flow
```
[Admin Dashboard - Technicians]
         ↓
┌────────────────────────────────┐
│  Technician List:              │
│  - Name, Email, Status         │
│  - Rating, Jobs completed      │
│  - Verified badge (or not)     │
└──────────────┬─────────────────┘
               ↓
┌────────────────────────────────┐
│  [Verify Technician] clicked   │
└──────────────┬─────────────────┘
               ↓
┌────────────────────────────────┐
│  System Actions:               │
│  1. is_verified = true         │
│  2. Notification sent to tech  │
│  3. Verified badge appears     │
│  4. Higher visibility          │
└────────────────────────────────┘
```

---

## 6. Shared Features

### 6.1 Authentication Flow
```
┌─────────────────────────────────────────────────────────────────┐
│                    AUTHENTICATION FLOW                          │
└─────────────────────────────────────────────────────────────────┘

[Login Page]
     ↓
┌────────────────┐
│ Enter Email    │
│ Enter Password │
└───────┬────────┘
        ↓
┌────────────────────────┐
│ Supabase Auth          │
│ signInWithPassword()   │
└───────────┬────────────┘
            ↓
┌────────────────────────┐
│ Fetch Profile          │
│ from profiles table    │
└───────────┬────────────┘
            ↓
    ┌───────┴───────┬────────────────┐
    ▼               ▼                ▼
role=user     role=technician    role=admin
    │               │                │
    ▼               ▼                ▼
/customer-    /technician-       /admin
 dashboard     dashboard
```

### 6.2 Real-Time Data Sync
```
┌─────────────────────────────────────────────────────────────────┐
│                 SUPABASE REALTIME SUBSCRIPTIONS                 │
└─────────────────────────────────────────────────────────────────┘

Component               │ Subscribed Tables
────────────────────────┼──────────────────────────────
CustomerDashboard       │ bookings, technicians
TechnicianDashboard     │ technicians, bookings, bids, reviews, gigs
Admin                   │ profiles, customers, technicians, bookings, 
                        │ reviews, gigs, services
MobileRepair            │ technicians
Technicians             │ technicians
BookingTracker          │ bookings (filtered by ID)
QuickBookingForm        │ technicians

Event Types: INSERT, UPDATE, DELETE
→ Triggers immediate UI refresh
→ Fallback: Polling every 60-120 seconds
```

### 6.3 Payment Flow
```
[Payment Page]
     ↓
┌─────────────────────────┐
│ Create PaymentIntent    │
│ POST /api/payment/      │
│ create-payment-intent   │
└───────────┬─────────────┘
            ↓
┌─────────────────────────┐
│ Stripe Elements         │
│ Card input form         │
└───────────┬─────────────┘
            ↓
┌─────────────────────────┐
│ Confirm Payment         │
│ stripe.confirmPayment() │
└───────────┬─────────────┘
            ↓
┌─────────────────────────┐
│ POST /api/payment/      │
│ confirm-payment         │
│ - Save to payments DB   │
│ - Update booking status │
└───────────┬─────────────┘
            ↓
[Payment Success Page]
→ Redirect to Dashboard
```

### 6.4 Notification System
```
┌─────────────────────────────────────────────────────────────────┐
│                   NOTIFICATION TRIGGERS                         │
└─────────────────────────────────────────────────────────────────┘

Action                      │ Recipient        │ Type
────────────────────────────┼──────────────────┼────────────────
Customer creates booking    │ Customer         │ booking_created
Customer cancels booking    │ Technician       │ booking_cancelled
Customer selects bid        │ Technician       │ bid_accepted
Customer submits review     │ Technician       │ review_received
Technician accepts job      │ Customer         │ booking_accepted
Technician completes job    │ Customer         │ booking_completed
Technician submits bid      │ Customer         │ new_bid
Admin verifies technician   │ Technician       │ account_verified
Admin updates booking       │ Customer + Tech  │ booking_status_change

Storage: notifications table
Delivery: Real-time via Supabase subscriptions
```

---

## 7. Database Schema Overview

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│    profiles     │     │   customers     │     │   technicians   │
├─────────────────┤     ├─────────────────┤     ├─────────────────┤
│ id (PK)         │←───→│ user_id (FK)    │     │ user_id (FK)    │
│ email           │     │ id (PK)         │     │ id (PK)         │
│ name            │     │ name            │     │ name            │
│ role            │     │ email           │     │ rating          │
│ phone           │     │ phone           │     │ is_verified     │
└─────────────────┘     └────────┬────────┘     │ specializations │
                                 │              └────────┬────────┘
                                 ▼                       ▼
┌─────────────────────────────────────────────────────────────────┐
│                           bookings                               │
├─────────────────────────────────────────────────────────────────┤
│ id (PK) │ customer_id (FK) │ technician_id (FK) │ status        │
│ device_type │ device_brand │ issue_description │ price          │
│ scheduled_date │ payment_status │ created_at                    │
└───────────────────────────────┬─────────────────────────────────┘
                                │
        ┌───────────────────────┼───────────────────────┐
        ▼                       ▼                       ▼
┌───────────────┐     ┌─────────────────┐     ┌─────────────────┐
│     bids      │     │    reviews      │     │    payments     │
├───────────────┤     ├─────────────────┤     ├─────────────────┤
│ booking_id    │     │ booking_id      │     │ booking_id      │
│ technician_id │     │ customer_id     │     │ customer_id     │
│ amount        │     │ technician_id   │     │ amount          │
│ status        │     │ rating          │     │ status          │
└───────────────┘     └─────────────────┘     └─────────────────┘
```

---

## 8. API Routes Summary

| Route Prefix | File | Key Endpoints |
|-------------|------|---------------|
| `/api/auth` | auth.js | POST /register |
| `/api/technicians` | technicians.js | GET /all, /nearby, /dashboard, POST /bids |
| `/api/customers` | customers.js | GET /dashboard, /bookings, /favorites |
| `/api/bookings` | bookings.js | POST /, GET /:id, POST /:id/select-bid |
| `/api/payment` | payment.js | POST /create-payment-intent, /confirm |
| `/api/admin` | admin.js | All CRUD for users, technicians, bookings |
| `/api/reviews` | reviews.js | GET /, POST /, PATCH /:id |
| `/api/notifications` | notifications.js | GET /, PATCH /:id/read |
| `/api/loyalty` | loyalty.js | GET /account, POST /redeem |
| `/api/services` | services.js | GET /, POST / |
| `/api/gigs` | gigs.js | GET /approved, POST /:id/bid |

---

*Document generated for TechCare Application v1.0*
