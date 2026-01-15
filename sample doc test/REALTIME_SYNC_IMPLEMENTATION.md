# TechCare - Full Real-Time Synchronization Implementation

TechCare utilizes a sophisticated "Reactive Data Layer" powered by **Supabase Realtime (CDC)** to ensure all roles see live updates without page refreshes.

## 1. Role-Specific Data Subscriptions

### 1.1 Customer Role (`user`)
| Context | Table | Trigger Event | Result |
|---------|-------|---------------|--------|
| Dashboard | `bookings` | `UPDATE` | Booking status changes instantly (e.g., "Diagnosing" -> "In Progress"). |
| Dashboard | `bids` | `INSERT` | New technician price offers appear live. |
| Tracker | `bookings` | `UPDATE` | Progress bar moves forward automatically. |
| Chat | `messages` | `INSERT` | New messages appear in bubble view. |

### 1.2 Technician Role
| Context | Table | Trigger Event | Result |
|---------|-------|---------------|--------|
| Marketplace | `bookings` | `INSERT` | New jobs appear in "Available" tab for bidding. |
| Active Jobs | `bookings` | `UPDATE` | Customer cancellations reflect instantly. |
| Earnings | `payments` | `INSERT` | Balance updates as soon as customer pays. |
| Profile | `gigs` | `UPDATE` | Approval notification when admin approves a service. |

### 1.3 Administrator Role
| Context | Table | Trigger Event | Result |
|---------|-------|---------------|--------|
| Overview | `profiles` | `INSERT` | "Total Users" counter increments live. |
| Moderation | `reviews` | `INSERT` | New reviews appear for moderation. |
| Verification| `technicians`| `UPDATE` | Status changes live if another admin verifies. |

---

## 2. Backend Propagation Logic

### 2.1 The "Notification Chain"
Every manual action in a REST controller results in a `notifications` table insert.
```
1. [PATCH /api/admin/verify] 
2. [DB: technicians.is_verified = true]
3. [Insert: notifications { user_id: tech_id, type: "VERIFIED" }]
4. [Supabase Realtime Broadcast]
5. [Frontend: NotificationBell.unreadCount++ ]
```

### 2.2 Table CDC Config
The following tables are enabled for Realtime Broadcast in the Supabase Dashboard:
- `bookings` (ALL events)
- `messages` (INSERT)
- `notifications` (INSERT)
- `bids` (ALL)
- `payments` (INSERT)

---

## 3. Real-Time Service Utility (`src/utils/realtimeService.js`)

This singleton manages the `supabase.channel` pool.

**Subscribed Channels:**
- `public:bookings`: Listen for state changes.
- `chat:${bookingId}`: Dedicated low-latency channel for messaging.
- `user:${userId}`: Role-specific private notification feed.

---

## 4. Known Gaps & Silent Failures

### 4.1 Latency & Conflict
- **Race Conditions**: If a customer selects a bid exactly when a technician withdraws it, the UI may lag.
- **Polling Fallback**: The current fallback is set to **120 seconds**, which is insufficient for the "Repair Tracker".

### 4.2 Connection Health
- **Zombie Connections**: No proactive heartbeat to reset the socket if the laptop lid is closed and reopened.
- **Auth Expiry**: If the JWT expires, Realtime subscriptions drop silently without a "Re-authenticating" state.

### 4.3 Missing Indicators
- **Role Activity**: No "Technician is typing..." or "Customer is online" indicators in the chat.
- **Sync Status**: No visual indicator (like a small green dot) to tell the user they are actively "Live".

---
*Strategy: Robust Real-Time v2.0 - Jan 2026*
