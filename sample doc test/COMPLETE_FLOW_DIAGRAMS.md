# TechCare - Complete Application Flow Diagrams (Master System Architecture)

This document maps every user journey, backend handshake, and data lifecycle across the TechCare ecosystem.

## 1. The Customer "Repair to Resolution" Journey

```
[ ENTRY ] -> Home Page / Search Technicians / AI Diagnostics
               |
[ STAGE 1: DIAGNOSIS ] 
  AIDiagnostics Chat -> Generates "Issue Summary" -> [ Redirects to /schedule ]
               |
[ STAGE 2: SCHEDULING (Step 1) ]
  1. Pick Device (Smartphone/PC/Tablet)
  2. Enter Brand & Model
  3. Describe Issue (Auto-filled from Diagnosis)
  4. Select Technician (Optional: or skip for auto-bid)
  [ DATA: Saved to LocalStorage & Location State ]
               |
[ STAGE 3: THE PAYMENT GATEWAY ]
  - Redirect to /payment (Stripe Elements)
  - Process LKR Amount (Service + Platform Fee)
  - Successful Auth -> [ Redirect to /payment-success ]
               |
[ STAGE 4: FINALIZATION (Step 2) ]
  - /payment-success -> Backend creates "Pending" Booking in DB
  - Auto-Redirect back to /schedule?step=2
  - Pick Appointment Date & Timeslot
  - Final Submit -> [ DB Status: "Confirmed" or "Scheduled" ]
               |
[ STAGE 5: POST-BOOKING ]
  - Booking Tracker (Live Status)
  - Chat with Technician (Real-time Messaging)
  - Completion -> Submit Review -> [ EARN LOYALTY POINTS - *To Be Implemented* ]
```

---

## 2. The Technician "Gig to Growth" Journey

```
[ STAGE 1: ONBOARDING ]
  Register -> Role=Technician -> Profile Completion (Shop Name, Bio, Specialty)
               |
[ STAGE 2: ADVERTISING ]
  Manage Gigs -> Create "Screen Repair Service" -> [ DB: Pending Admin Approval ]
               |
[ STAGE 3: THE BIDDING WAR ]
  1. Receive Alert: "New Job Request in Colombo"
  2. View Marketplace -> Job Details (Device info, Issue)
  3. Submit Bid (Offer LKR 5,000 + 2 Hours Estimate)
               |
[ STAGE 4: THE REPAIR ]
  - Bid Accepted -> Job Status: "Under Maintenance"
  - Interactive Tracker: Start Diagnosis -> Waiting for Parts -> Repairing -> Done
  - Internal Chat: Discuss spare parts with Customer live
               |
[ STAGE 5: EARNINGS ]
  Job Marked "Completed" -> Payment Released to Wallet -> Request Payout -> Bank Xfer
```

---

## 3. The Backend "Real-Time Hook" Lifecycle

This flow explains what happens inside the server when a status is updated.

```
[ EVENT ] Technician clicks "Completed" on Dashboard
   |
[ API ]  PUT /api/bookings/:id/status { status: "completed" }
   |
[ DB ]   UPDATE bookings.status = 'completed'
   |
[ HOOK ] Supabase Database Trigger fires on Update
   |
[ BROADCAST ] 
   1. Realtime Broadcast sent to Customer's Dashboard
   2. Realtime Broadcast sent to Admin's Overview
   |
[ NOTIFICATION ]
   - Backend logic inserts: { user_id: customer, title: "Repair Done!" } -> notifications table
   - NotificationBell in Header updates instantly
   |
[ RESULT ] 
   - Customer's Progress Bar hit 100%
   - "Leave a Review" button becomes active in Customer view
```

---

## 4. Admin "Orchestration" Lifecycle

```
[ USER REGISTRATION ] -> role: admin (Full system oversight)
               |
[ CONTENT MODERATION ]
  - Gigs Tab: Approve/Reject high-value services.
  - Reviews Tab: Flag/Delete malicious feedback.
               |
[ PLATFORM SECURITY ]
  - User Tab: Delete accounts, verify Tech credentials.
  - Logs Tab: Audit history of signups and payments.
               |
[ REVENUE MONITORING ]
  - Aggregate statistics from Stripe transactions.
  - Calculate total platform fees (Earnings - Payouts).
```

---

## 5. Logic "Fail-Safes" & Recovery

- **Payment Fail**: If Stripe fails, the user is kept on `/payment` with an error toast; `localStorage` keeps their booking data safe so they don't have to restart step 1.
- **Lost Connection**: Realtime Service has a fallback polling loop (120s) to refresh the data via standard GET requests if the WebSocket drops.
- **Double Booking**: The backend `scheduled_date` check prevents the same technician from being assigned to overlapping windows.

---
*Created for TechCare Documentation - Final v1.0 - Jan 2026*
