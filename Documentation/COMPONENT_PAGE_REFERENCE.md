# TechCare - Component & Page Reference

## Frontend Pages (40 Total)

### Public Pages (No Auth Required)
| Page | Route | Component | Purpose |
|------|-------|-----------|---------|
| Home | `/` | Home.jsx | Landing page with hero, features |
| Mobile Repair | `/mobile-repair` | MobileRepair.jsx | Browse mobile technicians |
| PC Repair | `/pc-repair` | PCRepair.jsx | Browse PC/laptop technicians |
| Technicians | `/technicians` | Technicians.jsx | Full technician directory |
| Reviews | `/reviews` | Reviews.jsx | Public reviews page |
| Services | `/services` | Services.jsx | List of services offered |
| Diagnostics | `/diagnostics` | Diagnostics.jsx | AI-powered device diagnosis |
| Service Areas | `/service-areas` | ServiceAreas.jsx | Coverage areas |
| Support | `/support` | Support.jsx | Help & FAQ |
| Company | `/company` | Company.jsx | About us |
| Terms | `/terms` | Terms.jsx | Terms of service |
| Privacy | `/privacy` | Privacy.jsx | Privacy policy |
| Login | `/login` | Login.jsx | User authentication |
| Register | `/register` | Register.jsx | New user registration |
| Forgot Password | `/forgot-password` | ForgotPassword.jsx | Password reset request |
| Reset Password | `/reset-password` | ResetPassword.jsx | Password reset form |

### Protected: Customer Role (`user`)
| Page | Route | Component | Purpose |
|------|-------|-----------|---------|
| Customer Dashboard | `/customer-dashboard` | CustomerDashboard.jsx | Main customer hub |
| History | `/history` | History.jsx | Past bookings |
| Favorites | `/favorites` | Favorites.jsx | Saved technicians |
| Compare | `/compare` | Compare.jsx | Compare technicians |
| Settings | `/settings` | Settings.jsx | Account settings |
| Schedule | `/schedule` | Schedule.jsx | Book appointment |
| Payment | `/payment` | Payment.jsx | Stripe payment |
| Payment Success | `/payment-success` | PaymentSuccess.jsx | Confirmation |
| Booking Tracker | `/tracker/:id` | BookingTracker.jsx | Track repair status |
| Chat | `/chat/:bookingId` | Chat.jsx | Message technician |

### Protected: Technician Role
| Page | Route | Component | Purpose |
|------|-------|-----------|---------|
| Technician Dashboard | `/technician-dashboard` | TechnicianDashboard.jsx | Main tech hub |
| Settings | `/settings` | Settings.jsx | Profile settings |
| Chat | `/chat/:bookingId` | Chat.jsx | Message customer |

### Protected: Admin Role
| Page | Route | Component | Purpose |
|------|-------|-----------|---------|
| Admin Dashboard | `/admin` | Admin.jsx | Full admin panel |
| Settings | `/settings` | Settings.jsx | Admin settings |

---

## Frontend Components (53 Total)

### UI Components (23)
Located in `src/components/ui/`:
- accordion, alert-dialog, avatar, badge, button, calendar
- card, checkbox, dialog, dropdown-menu, input, label
- popover, progress, radio-group, scroll-area, select
- separator, sheet, switch, table, tabs, textarea, toaster, toast

### Core Components (28)
| Component | File | Purpose |
|-----------|------|---------|
| Header | Header.jsx | Navigation bar with auth state |
| Footer | Footer.jsx | Site footer with links |
| Layout | Layout.jsx | Page wrapper with header/footer |
| ProtectedRoute | ProtectedRoute.jsx | Route access control |
| RoleBasedRedirect | RoleBasedRedirect.jsx | Redirect by user role |
| BookingGuard | BookingGuard.jsx | Protect booking flow |
| ErrorBoundary | ErrorBoundary.jsx | Error handling wrapper |
| Loading | Loading.jsx | Loading spinner |
| SEO | SEO.jsx | Meta tags for pages |
| QuickBookingForm | QuickBookingForm.jsx | Fast booking widget |
| TechnicianCard | TechnicianCard.jsx | Technician display card |
| AIDiagnostics | AIDiagnostics.jsx | AI chatbot for diagnosis |
| BookingCancellation | BookingCancellation.jsx | Cancel booking dialog |
| BookingTracker | BookingTracker.jsx | Booking progress display |
| CurrencyDisplay | CurrencyDisplay.jsx | Format LKR amounts |
| EarningsChart | EarningsChart.jsx | Technician earnings chart |
| GoogleMap | GoogleMap.jsx | Location picker |
| ImageUpload | ImageUpload.jsx | Photo upload component |
| InvoiceGenerator | InvoiceGenerator.jsx | Generate PDF invoices |
| LoyaltyPoints | LoyaltyPoints.jsx | Points & rewards display |
| NotificationBell | NotificationBell.jsx | Header notification icon |
| NotificationsModal | NotificationsModal.jsx | Notification dropdown |
| SearchModal | SearchModal.jsx | Global search |
| TechCareLogo | TechCareLogo.jsx | Brand logo |
| Toast | Toast.jsx | Toast notifications |
| DataSourceToggle | DataSourceToggle.jsx | Dev toggle for data source |
| VideoHeroBackground | VideoHeroBackground.jsx | Hero video component |
| AccountModal | AccountModal.jsx | Account quick actions |

### Admin Components (2)
Located in `src/components/admin/`:
- ServiceManagement.jsx - CRUD services
- TransactionHistory.jsx - View payments

---

## Context Providers (5)

| Context | File | Purpose |
|---------|------|---------|
| AuthContext | AuthContext.jsx | User authentication state, login/logout |
| ThemeContext | ThemeContext.jsx | Dark/light mode |
| CurrencyContext | CurrencyContext.jsx | Currency conversion (LKR) |
| NotificationContext | NotificationContext.jsx | In-app notifications |
| WebSocketContext | WebSocketContext.jsx | Real-time socket events |

---

## Utility Services (5)

| Service | File | Purpose |
|---------|------|---------|
| API Client | api.js | Axios instance with auth |
| Supabase Client | supabase.js | DB client with helpers |
| Google Sheets | googleSheetsService.js | Fallback data source |
| Realtime Service | realtimeService.js | Supabase subscriptions |
| WebSocket Service | websocketService.js | Socket.io client |
| Currency Utils | currency.js, currencyService.js | LKR formatting |
| Date Utils | date.js | Date formatting helpers |

---

## Backend Routes (16)

| Route | File | Endpoints Count | Purpose |
|-------|------|-----------------|---------|
| /api/auth | auth.js | 1 | Registration |
| /api/technicians | technicians.js | 20+ | All technician operations |
| /api/customers | customers.js | 15+ | Customer operations |
| /api/bookings | bookings.js | 4 | Booking CRUD |
| /api/payment | payment.js | 5 | Stripe integration |
| /api/admin | admin.js | 12 | Admin operations |
| /api/reviews | reviews.js | 8 | Review CRUD |
| /api/notifications | notifications.js | 4 | Notification management |
| /api/loyalty | loyalty.js | 7 | Points & rewards |
| /api/services | services.js | 4 | Service catalog |
| /api/gigs | gigs.js | 2 | Marketplace gigs |
| /api/jobs | jobs.js | 10 | Job board (legacy) |
| /api/search | search.js | 2 | Global search |
| /api/emails | emails.js | 3 | Email sending |
| /api (index) | index.js | 3 | General routes |
| Supabase Auth | supabaseAuth.js | middleware | Auth middleware |

---

## Data Models (11)

| Model | File | Fields |
|-------|------|--------|
| User | User.js | name, email, password, role |
| Technician | Technician.js | name, specialty, rating, location |
| Customer | Customer.js | name, email, phone |
| Booking | Booking.js | device, issue, status, technician |
| Bid | Bid.js | jobId, technicianId, amount, status |
| Job | Job.js | title, description, budget, status |
| Review | Review.js | rating, comment, technician, customer |
| Payment | Payment.js | amount, status, stripeId |
| Notification | Notification.js | title, message, type, read |
| Service | Service.js | name, description, price |
| Gig | Gig.js | title, price, technician, status |

---

## Feature Matrix by Role

| Feature | Guest | Customer | Technician | Admin |
|---------|-------|----------|------------|-------|
| Browse Technicians | ✅ | ✅ | ✅ | ✅ |
| AI Diagnostics | ✅ | ✅ | ✅ | ✅ |
| View Reviews | ✅ | ✅ | ✅ | ✅ |
| Create Booking | ❌ | ✅ | ❌ | ❌ |
| Track Booking | ❌ | ✅ | ✅ | ✅ |
| Submit Review | ❌ | ✅ | ❌ | ❌ |
| Save Favorites | ❌ | ✅ | ❌ | ❌ |
| Loyalty Points | ❌ | ✅ | ❌ | ❌ |
| Accept Jobs | ❌ | ❌ | ✅ | ❌ |
| Submit Bids | ❌ | ❌ | ✅ | ❌ |
| Create Gigs | ❌ | ❌ | ✅ | ❌ |
| View Earnings | ❌ | ❌ | ✅ | ✅ |
| Manage Users | ❌ | ❌ | ❌ | ✅ |
| Verify Technicians | ❌ | ❌ | ❌ | ✅ |
| Approve Gigs | ❌ | ❌ | ❌ | ✅ |
| View All Stats | ❌ | ❌ | ❌ | ✅ |

---

*Reference document for TechCare Application*
