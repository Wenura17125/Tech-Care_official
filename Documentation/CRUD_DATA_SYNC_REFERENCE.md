# TechCare - CRUD Operations & Data Sync Reference

## Complete CRUD Matrix

### Bookings Table

| Operation | Customer | Technician | Admin | Real-Time Sync |
|-----------|----------|------------|-------|----------------|
| **CREATE** | ✅ POST /customers/bookings | ❌ | ❌ | Techs see new job |
| **READ** | ✅ Own bookings | ✅ Assigned bookings | ✅ All | Dashboard refresh |
| **UPDATE** | ✅ Cancel/Reschedule | ✅ Accept/Complete | ✅ Any field | All parties notified |
| **DELETE** | ❌ | ❌ | ✅ | All parties notified |

#### Booking Status Flow:
```
pending → confirmed → in_progress → completed
    ↓         ↓
cancelled  cancelled
```

---

### Bids Table

| Operation | Customer | Technician | Admin | Real-Time Sync |
|-----------|----------|------------|-------|----------------|
| **CREATE** | ❌ | ✅ POST /technicians/bids | ❌ | Customer notified |
| **READ** | ✅ On own bookings | ✅ Own bids | ✅ All | Dashboard shows |
| **UPDATE** | ✅ Accept/Reject | ✅ Withdraw | ✅ Any | Tech notified |
| **DELETE** | ❌ | ✅ Own pending | ✅ | - |

#### Bid Status Flow:
```
pending → accepted
    ↓
rejected
```

---

### Reviews Table

| Operation | Customer | Technician | Admin | Real-Time Sync |
|-----------|----------|------------|-------|----------------|
| **CREATE** | ✅ POST /bookings/:id/review | ❌ | ❌ | Tech rating updated |
| **READ** | ✅ Own reviews | ✅ Own reviews | ✅ All | Public display |
| **UPDATE** | ✅ Own reviews | ❌ | ✅ Moderate | - |
| **DELETE** | ✅ Own reviews | ❌ | ✅ | Tech rating recalc |

---

### Technicians Table

| Operation | Customer | Technician | Admin | Real-Time Sync |
|-----------|----------|------------|-------|----------------|
| **CREATE** | ❌ | ❌ | ✅ | Listings update |
| **READ** | ✅ Public profiles | ✅ Own profile | ✅ All | - |
| **UPDATE** | ❌ | ✅ Own profile | ✅ Any | Listings update |
| **DELETE** | ❌ | ❌ | ✅ | Listings update |

---

### Gigs Table

| Operation | Customer | Technician | Admin | Real-Time Sync |
|-----------|----------|------------|-------|----------------|
| **CREATE** | ❌ | ✅ POST /technicians/gigs | ❌ | Admin sees pending |
| **READ** | ✅ Approved only | ✅ Own gigs | ✅ All | - |
| **UPDATE** | ❌ | ✅ PUT /technicians/gigs/:id | ✅ Approve/Reject | Tech notified |
| **DELETE** | ❌ | ✅ Own gigs | ✅ | - |

---

### Services Table

| Operation | Customer | Technician | Admin | Real-Time Sync |
|-----------|----------|------------|-------|----------------|
| **CREATE** | ❌ | ❌ | ✅ | Schedule page updates |
| **READ** | ✅ | ✅ | ✅ | - |
| **UPDATE** | ❌ | ❌ | ✅ | Schedule page updates |
| **DELETE** | ❌ | ❌ | ✅ | Schedule page updates |

---

### Notifications Table

| Operation | Customer | Technician | Admin | Real-Time Sync |
|-----------|----------|------------|-------|----------------|
| **CREATE** | System only | System only | System only | Instant via Supabase |
| **READ** | ✅ Own | ✅ Own | ✅ All | - |
| **UPDATE** | ✅ Mark read | ✅ Mark read | ✅ | - |
| **DELETE** | ✅ Own | ✅ Own | ✅ | - |

---

### Favorites Table

| Operation | Customer | Technician | Admin | Real-Time Sync |
|-----------|----------|------------|-------|----------------|
| **CREATE** | ✅ | ❌ | ❌ | - |
| **READ** | ✅ Own | ❌ | ✅ | - |
| **UPDATE** | ❌ | ❌ | ❌ | - |
| **DELETE** | ✅ Own | ❌ | ✅ | - |

---

### Payments Table

| Operation | Customer | Technician | Admin | Real-Time Sync |
|-----------|----------|------------|-------|----------------|
| **CREATE** | ✅ Via Stripe | ❌ | ❌ | Booking status updates |
| **READ** | ✅ Own | ✅ Own earnings | ✅ All | - |
| **UPDATE** | ❌ | ❌ | ✅ Refund | - |
| **DELETE** | ❌ | ❌ | ❌ | - |

---

## Cross-Role Notification Triggers

### When Customer Acts:

```
Customer Action          → Notification To    → Type
─────────────────────────────────────────────────────
Creates booking          → Customer           → booking_created
Cancels booking          → Technician         → booking_cancelled
Selects bid              → Technician         → bid_accepted
Submits review           → Technician         → review_received
Adds to favorites        → (none)             → -
Redeems loyalty reward   → Customer           → reward_redeemed
```

### When Technician Acts:

```
Technician Action        → Notification To    → Type
─────────────────────────────────────────────────────
Accepts job              → Customer           → booking_accepted
Completes job            → Customer           → booking_completed
Submits bid              → Customer           → new_bid
Updates profile          → (none, realtime)   → -
Creates gig              → (Admin dashboard)  → gig_pending
Withdraws bid            → (none)             → -
```

### When Admin Acts:

```
Admin Action             → Notification To    → Type
─────────────────────────────────────────────────────
Verifies technician      → Technician         → account_verified
Approves gig             → Technician         → gig_approved
Rejects gig              → Technician         → gig_rejected
Updates booking          → Customer + Tech    → booking_status_change
Deletes review           → (none)             → -
Creates service          → (realtime update)  → -
```

---

## API Endpoint Reference

### Customer Endpoints (`/api/customers`)
```
GET    /dashboard         - Dashboard data
GET    /bookings          - List customer bookings
POST   /bookings          - Create new booking
PATCH  /bookings/:id      - Update booking (cancel/reschedule)
GET    /notifications     - Get notifications
PATCH  /notifications/:id - Mark notification read
GET    /profile           - Get profile
PATCH  /profile           - Update profile
GET    /favorites         - List favorites
POST   /favorites         - Add favorite
DELETE /favorites/:id     - Remove favorite
```

### Technician Endpoints (`/api/technicians`)
```
GET    /                  - List all technicians (public)
GET    /all               - List all technicians (public)
GET    /nearby            - Find nearby technicians (public)
GET    /:id               - Get technician by ID (public)
GET    /dashboard         - Dashboard data (auth)
GET    /jobs              - Available jobs (auth)
GET    /bookings          - Assigned bookings (auth)
PATCH  /bookings/:id/accept   - Accept job (auth)
PATCH  /bookings/:id/complete - Complete job (auth)
POST   /bids              - Submit bid (auth)
GET    /bids              - List own bids (auth)
GET    /earnings          - Earnings data (auth)
GET    /analytics         - Analytics (auth)
PATCH  /profile           - Update profile (auth)
GET    /gigs              - List own gigs (auth)
POST   /gigs              - Create gig (auth)
PATCH  /gigs/:id          - Update gig (auth)
DELETE /gigs/:id          - Delete gig (auth)
```

### Booking Endpoints (`/api/bookings`)
```
POST   /                  - Create booking
GET    /:id               - Get booking details
POST   /:id/select-bid    - Select winning bid
POST   /:id/review        - Submit review
```

### Admin Endpoints (`/api/admin`)
```
GET    /dashboard         - Dashboard statistics
GET    /stats             - Detailed statistics
GET    /users             - List all users
PUT    /users/:id         - Update user
DELETE /users/:id         - Delete user  
GET    /technicians       - List all technicians
PUT    /technicians/:id   - Update technician
PATCH  /technicians/:id/verify - Verify technician
DELETE /technicians/:id   - Delete technician
GET    /bookings          - List all bookings
PUT    /bookings/:id      - Update booking
GET    /reviews           - List all reviews
DELETE /reviews/:id       - Delete review
GET    /gigs              - List all gigs
GET    /gigs/pending      - List pending gigs for approval
PATCH  /gigs/:id/approve  - Approve gig (notifies technician)
PATCH  /gigs/:id/reject   - Reject gig (notifies technician)
DELETE /gigs/:id          - Delete gig
```

### Payment Endpoints (`/api/payment`)
```
POST   /create-payment-intent - Create Stripe intent
POST   /confirm-payment       - Confirm payment
GET    /payment/:id           - Get payment details
GET    /payments/customer/:id - Customer payments
POST   /webhook               - Stripe webhook
```

### Other Endpoints
```
/api/services     - GET, POST, PUT, DELETE services
/api/reviews      - GET, POST, PATCH, DELETE reviews
/api/notifications- GET, PATCH, DELETE notifications
/api/loyalty      - GET account, tiers, rewards; POST redeem
/api/auth         - POST register
/api/gigs         - GET approved gigs, POST bid on gig
/api/search       - GET search results
```

---

## Real-Time Subscription Channels

| Channel Name | Tables | Components |
|--------------|--------|------------|
| `customer-bookings-{id}` | bookings | CustomerDashboard |
| `technician-dashboard-{id}` | technicians, bookings, bids, reviews, gigs | TechnicianDashboard |
| `admin-dashboard` | profiles, customers, technicians, bookings, reviews, gigs, services | Admin |
| `technicians-list` | technicians | Technicians, MobileRepair |
| `booking-{id}` | bookings | BookingTracker |
| `quick-booking-technicians` | technicians | QuickBookingForm |

---

*CRUD & Data Sync Reference for TechCare Application*
