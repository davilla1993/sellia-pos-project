# SELLIA POS - Complete System Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   SELLIA POS Platform                   │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Frontend (Angular 19)          Backend (Spring Boot)   │
│  ├─ Auth & Session              ├─ Authentication      │
│  ├─ Multi-Caisse UI             ├─ Global Session Mgmt │
│  ├─ POS Interface               ├─ Cashier Mgmt        │
│  ├─ Bar Tickets Screen          ├─ Ticket System       │
│  ├─ Caisse Reports              ├─ Order Processing    │
│  ├─ Ticket Management           ├─ Reporting Engine    │
│  └─ PDF Downloads               ├─ PDF Generation      │
│                                 └─ Security Layers     │
│                                                          │
│  Database (PostgreSQL)          Message Queue (Optional)
│  ├─ Users & Roles               ├─ Notifications       │
│  ├─ Cashier Management          └─ Real-time Updates   │
│  ├─ Session Tracking                                   │
│  ├─ Order History                                      │
│  ├─ Tickets & Workflow                                 │
│  └─ Reporting Tables                                   │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## Core Features

### 1. Authentication & Security
- JWT Token-based authentication
- Role-based access control (ADMIN, CAISSIER, CUISINIER)
- PIN-based cashier session (4 digits)
- Brute-force protection (3 attempts = 15 min lock)
- Auto-logout after 15 minutes inactivity
- XSS/SQL injection prevention
- CSRF token validation

### 2. Multi-Cashier Management
- **GlobalSession** - Admin opens/closes daily session
- **Cashier** - Physical cash drawers with PIN
- **CashierSession** - Individual session per cashier/user
- **Multiple users per cashier** for shift rotations
- Automatic order tracking by cashier session
- Complete audit trail

### 3. Menu & Product System
- **Menu** - Grouped offerings (Menu du Jour, Menu VIP)
- **MenuItem** - Sellable items within menu
- **Product** - Base items with WorkStation assignment
- WorkStation routing (KITCHEN, BAR, PASTRY, CHECKOUT)
- Pricing flexibility (menu overrides)

### 4. Ticket System (Dual-Mode)
**Mode A: Separated Tickets**
- One ticket per WorkStation
- BAR prioritized (served first)
- KITCHEN waits for BAR ready
- Each station prints their own ticket

**Mode B: Unified Tickets**
- Single receipt for caisse
- All items grouped by station
- Print once at checkout
- Complete order view

### 5. Order Management
- Orders automatically link to active CashierSession
- Support for multiple order types (TABLE, TAKEAWAY)
- Customer session tracking
- Real-time order status
- Discount/adjustment support

### 6. Reporting & Analytics
- **JSON Reports** - Structured data export
  - Global Session summary
  - Per-Cashier breakdown
  - Per-User performance
  - Top products
  - Revenue analytics

- **PDF Reports** - Professional printable format
  - Formatted tables
  - Currency formatting (XAF)
  - Date range filtering
  - Summary statistics

---

## Database Schema

### Core Entities
```sql
-- Authentication
users (id, public_id, email, password_hash, role, deleted)
roles (id, name, permissions)

-- Session Management
global_sessions (id, public_id, status, initial_amount, final_amount, opened_at, closed_at, deleted)
cashiers (id, public_id, name, number, pin_hash, status, failed_attempts, locked_until, deleted)
cashier_sessions (id, public_id, global_session_id, cashier_id, user_id, status, last_activity, deleted)
cashier_users (cashier_id, user_id, assigned_at) -- Many-to-Many

-- Menu & Products
menus (id, public_id, name, type, active, deleted)
menu_items (id, public_id, menu_id, display_order, price_override, bundle_price, deleted)
menu_item_products (menu_item_id, product_id) -- Many-to-Many
products (id, public_id, name, price, category_id, work_station, deleted)

-- Orders & Items
customer_sessions (id, public_id, table_id, active, deleted)
orders (id, public_id, number, table_id, customer_session_id, cashier_session_id, status, total_amount, discount, deleted)
order_items (id, public_id, order_id, menu_item_id, product_id, quantity, unit_price, total_price, work_station, status, deleted)

-- Tickets
tickets (id, public_id, customer_session_id, work_station, status, priority, printed_at, ready_at, deleted)
ticket_items (ticket_id, order_item_id) -- Link to order items

-- Reporting
inventory_movements (id, type, product_id, quantity, reference, date)
audit_logs (id, entity_type, entity_id, action, user_id, timestamp)
```

---

## API Endpoints

### Authentication (8 endpoints)
```
POST   /api/auth/login                      - User login
POST   /api/auth/logout                     - User logout
POST   /api/auth/register                   - New user registration
POST   /api/auth/refresh-token              - Refresh JWT
GET    /api/auth/me                         - Current user info
POST   /api/auth/change-password            - Change password
POST   /api/auth/forgot-password            - Password reset
POST   /api/auth/reset-password             - Complete password reset
```

### Global Sessions (5 endpoints) - Admin Only
```
POST   /api/global-sessions/open            - Open daily session
GET    /api/global-sessions/current         - Get current session
POST   /api/global-sessions/{id}/close      - Close session
GET    /api/global-sessions/{id}            - Get session details
GET    /api/global-sessions                 - List all sessions
```

### Cashiers (8 endpoints) - Admin Only
```
POST   /api/cashiers                        - Create cashier
GET    /api/cashiers                        - List all cashiers
GET    /api/cashiers/{id}                   - Get cashier details
PUT    /api/cashiers/{id}                   - Update cashier
DELETE /api/cashiers/{id}                   - Soft delete cashier
POST   /api/cashiers/{id}/change-pin        - Change PIN
POST   /api/cashiers/{id}/assign-user       - Assign user to cashier
POST   /api/cashiers/{id}/remove-user       - Remove user from cashier
```

### Cashier Sessions (10 endpoints) - Caissier
```
POST   /api/cashier-sessions/open           - Open cashier session
GET    /api/cashier-sessions/current        - Get current session
POST   /api/cashier-sessions/{id}/lock      - Lock session
POST   /api/cashier-sessions/{id}/unlock    - Unlock with PIN
POST   /api/cashier-sessions/{id}/close     - Close session
POST   /api/cashier-sessions/{id}/activity  - Update activity
GET    /api/cashier-sessions/{id}           - Get session details
PUT    /api/cashier-sessions/{id}           - Update session
DELETE /api/cashier-sessions/{id}           - Soft delete
GET    /api/cashier-sessions                - List all sessions
```

### Orders (12 endpoints)
```
POST   /api/orders                          - Create order
GET    /api/orders/{id}                     - Get order details
GET    /api/orders                          - List orders (paginated)
PUT    /api/orders/{id}                     - Update order
PUT    /api/orders/{id}/status/{status}     - Update status
PUT    /api/orders/{id}/discount            - Add discount
PUT    /api/orders/{id}/payment             - Mark as paid
GET    /api/orders/pending/unpaid           - Get unpaid orders
GET    /api/orders/kitchen/active           - Get kitchen queue
GET    /api/orders/table/{tableId}          - Get table orders
GET    /api/orders/customer-session/{id}    - Get session orders
DELETE /api/orders/{id}                     - Cancel order
```

### Tickets (7 endpoints)
```
POST   /api/tickets/session/{id}/generate/separated   - Generate separated tickets
POST   /api/tickets/session/{id}/generate/unified     - Generate unified ticket
GET    /api/tickets/station/{station}/active          - Get station tickets
GET    /api/tickets/session/{id}/status               - Get session overview
PUT    /api/tickets/{id}/print                        - Mark printed
PUT    /api/tickets/{id}/ready                        - Mark ready
PUT    /api/tickets/{id}/served                       - Mark served
```

### Reports (6 endpoints) - Admin Only
```
GET    /api/reports/global-session/{id}               - JSON report
GET    /api/reports/cashier/{id}?startDate=...        - JSON report
GET    /api/reports/user/{id}?startDate=...           - JSON report
GET    /api/reports/global-session/{id}/pdf           - PDF download
GET    /api/reports/cashier/{id}/pdf?startDate=...    - PDF download
GET    /api/reports/user/{id}/pdf?startDate=...       - PDF download
```

---

## Technology Stack

### Backend
- **Framework**: Spring Boot 3.x
- **Language**: Java 17+
- **Database**: PostgreSQL
- **Security**: JWT, bcrypt, Spring Security
- **PDF**: iText7
- **ORM**: JPA/Hibernate
- **Build**: Maven

### Frontend
- **Framework**: Angular 19
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **HTTP**: HttpClient
- **State**: BehaviorSubject (reactive)
- **Build**: Angular CLI

---

## Key Workflows

### 1. Daily Opening (Admin)
```
1. Login as ADMIN
2. POST /api/global-sessions/open (initialAmount: 5000)
3. Session OPEN - cashiers can now open sessions
4. Admin creates cashiers if needed: POST /api/cashiers
5. Admin assigns users to cashiers: POST /api/cashiers/{id}/assign-user
```

### 2. Cashier Login (Caissier/Staff)
```
1. User logs in to system
2. System checks GlobalSession is OPEN (guard)
3. POST /api/cashier-sessions/open (cashierId, PIN)
4. PIN validated against bcrypt hash
5. Session OPEN - user can create orders
6. Activity tracked every 30 seconds
```

### 3. Order Creation (POS)
```
1. Caissier selects items (MenuItems, not Products)
2. POST /api/orders with menuItemPublicIds
3. System auto-links to active CashierSession
4. WorkStation assigned from Product.workStation
5. Order status: EN_ATTENTE
```

### 4. Ticket Generation (Two Modes)
```
MODE A - SEPARATED (for busy bar/kitchen):
1. POST /api/tickets/session/{id}/generate/separated
2. Creates 2 tickets:
   - BAR ticket (priority 1) - printed first
   - KITCHEN ticket (priority 2) - waits for BAR ready
3. Each station prints and manages their own ticket

MODE B - UNIFIED (for simple caisse):
1. POST /api/tickets/session/{id}/generate/unified
2. Creates 1 ticket with all items
3. Grouped by WorkStation:
   - [BAR] Coca, Bière, Tiramisu
   - [KITCHEN] Pizza
4. Single receipt printed at checkout
```

### 5. Bar Workflow (Separated Tickets)
```
1. Bar personnel uses Bar Tickets Screen
2. GET /api/tickets/station/BAR/active
3. Sees BAR tickets only:
   - Coca, Bière, Tiramisu (qty + notes)
4. Prepares items
5. PUT /api/tickets/{id}/ready
6. Kitchen can now start their ticket
```

### 6. Caisse Workflow (Unified Ticket)
```
1. Caissier uses Caisse Tickets Screen
2. GET /api/tickets/session/{id}/unified
3. Sees complete receipt:
   - [BAR] 2x Coca, 1x Bière...
   - [KITCHEN] 2x Pizza...
4. Print complete receipt: window.print()
5. Mark served: PUT /api/tickets/{id}/served
```

### 7. Daily Reporting (Admin)
```
1. Login as ADMIN
2. Access Reports section
3. Select report type:
   - Global Session (entire day)
   - By Cashier (filter by cashier)
   - By User (filter by staff member)
4. Filter by date range (max 30 days)
5. View JSON or download PDF
6. PDF includes:
   - Summary with totals
   - Item breakdown
   - User performance
   - Top products
```

### 8. Daily Closing (Admin)
```
1. All cashiers close their sessions
2. Admin views daily reports
3. Admin reconciles amounts (expected vs actual)
4. POST /api/global-sessions/{id}/close
   - finalAmount: 5650
   - reconciliationNotes: "All matched"
5. Session CLOSED - no more orders/sessions allowed
```

---

## Security Measures

### Authentication
- JWT token with 15-minute expiry
- Refresh token mechanism (5 days)
- Logout clears tokens

### PIN Protection
- 4-digit PIN only
- bcrypt hashing (cost 10)
- 3 failed attempts = 15-minute lock
- Auto-unlock by correct PIN

### Session Security
- GlobalSession must be OPEN
- Auto-logout after 15 minutes inactivity
- Activity tracked every 30 seconds
- One cashier session per user/cashier combo

### Role-Based Access
- ADMIN: Global session, cashier management, reports
- CAISSIER: Order creation, own cashier session, own reports
- CUISINIER: Kitchen queue view only

### Input Validation
- PIN format (4 digits)
- Quantity (positive integers)
- Discount (≤ total amount)
- Date ranges (≤ 30 days)
- Injection prevention (XSS, SQL, CSV)

### Data Protection
- Soft delete (logical deletion)
- Audit trail for all operations
- Encrypted passwords
- No sensitive data in logs

---

## Testing Checklist

See `docs/TESTING-GUIDE.md` for complete curl examples

```
Authentication:
  ✅ Valid credentials
  ✅ Invalid credentials
  ✅ Expired token
  ✅ Missing token
  ✅ Invalid role access

Global Session:
  ✅ Open session
  ✅ Close session
  ✅ Prevent duplicate open
  ✅ Block cashier if not open

Cashier:
  ✅ Valid PIN (4 digits)
  ✅ Invalid PIN format
  ✅ Brute-force lock (3 attempts)
  ✅ Auto-lock (15 min inactivity)
  ✅ PIN unlock

Orders:
  ✅ Create with MenuItems
  ✅ Invalid MenuItem (404)
  ✅ Discount validation
  ✅ Auto-link to CashierSession

Tickets:
  ✅ Separated tickets (2 per order type)
  ✅ Unified ticket (1 complete)
  ✅ Status updates
  ✅ Station-specific view

Reports:
  ✅ JSON reports
  ✅ PDF generation
  ✅ Date filtering
  ✅ Authorization checks

Security:
  ✅ SQL injection
  ✅ XSS attacks
  ✅ CSRF validation
  ✅ Privilege escalation
  ✅ Session fixation
```

---

## Deployment Steps

### 1. Database Setup
```bash
createdb sellia_db
createuser sellia_user -P  # Enter password
psql sellia_db < db/init.sql
```

### 2. Backend Start
```bash
cd sellia-backend
mvn clean install
java -jar target/sellia-api.jar
# Runs on http://localhost:8080
```

### 3. Frontend Start
```bash
cd sellia-app
npm install
npm start
# Runs on http://localhost:4200
```

### 4. Verify All Services
```bash
curl http://localhost:8080/api/health
curl http://localhost:4200
```

---

## Commit History (Complete)

```
cb97bde - Add comprehensive testing suite
bfbe0c7 - Add frontend interfaces for dual-mode ticket system
2d82851 - Add dual-mode ticket system: separated and unified tickets
bac0005 - Implement ticket system with WorkStation-based routing
387ab2f - Restructure order system: sell MenuItems instead of Products
522d002 - Remove manual Flyway migration - let Hibernate auto-generate
20a867d - Add admin dashboard integration for multi-cashier system
7243a57 - Fix duplicate downloadFile function in ApiService
d2ce9f0 - Fix JPQL query syntax errors in repositories
ed8a5dd - Add PDF report generation with date filtering
1603018 - Add comprehensive reporting system for sessions and cashiers
d4dd53e - Implement frontend Angular cashier and global session management
0b75496 - Integrate CashierSession with Order creation workflow
ccc6578 - Implement multi-cashier management system
```

---

## Quick Start

```bash
# Backend
cd sellia-backend
mvn clean compile
mvn spring-boot:run

# Frontend (new terminal)
cd sellia-app
npm install
npm start

# Tests
mvn test                # Backend
npm test                # Frontend
```

---

**System Status:** ✅ PRODUCTION READY
