# SELLIA POS - Complete Testing Guide

## Table of Contents
1. [Authentication & Security](#authentication--security)
2. [Global Session Management](#global-session-management)
3. [Cashier Management](#cashier-management)
4. [Cashier Sessions & PIN](#cashier-sessions--pin)
5. [Orders & MenuItems](#orders--menuitems)
6. [Tickets System](#tickets-system)
7. [Reporting & PDFs](#reporting--pdfs)
8. [Security Tests](#security-tests)

---

## Authentication & Security

### 1.1 Login Test
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@sellia.com",
    "password": "Admin123!"
  }'

# Expected Response:
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "userId": "user-abc123",
  "role": "ADMIN"
}
```

### 1.2 Test Invalid Credentials (Should Fail)
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@sellia.com",
    "password": "WrongPassword"
  }'

# Expected: 401 Unauthorized
```

### 1.3 Test Missing Authorization Header (Should Fail)
```bash
curl -X GET http://localhost:8080/api/cashiers

# Expected: 401 Unauthorized
```

### 1.4 Test with Valid Token
```bash
curl -X GET http://localhost:8080/api/cashiers \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Expected: 200 OK with cashiers list
```

### 1.5 Test Expired Token (Should Fail)
```bash
curl -X GET http://localhost:8080/api/cashiers \
  -H "Authorization: Bearer expired-token-12345"

# Expected: 401 Unauthorized
```

### 1.6 Test Role-Based Access Control - ADMIN Can Access
```bash
curl -X GET http://localhost:8080/api/cashiers \
  -H "Authorization: Bearer ADMIN_TOKEN"

# Expected: 200 OK
```

### 1.7 Test Role-Based Access Control - CAISSIER Cannot Create Cashier (Should Fail)
```bash
curl -X POST http://localhost:8080/api/cashiers \
  -H "Authorization: Bearer CAISSIER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "New Cashier",
    "cashierNumber": "CASH-003",
    "pin": "5678"
  }'

# Expected: 403 Forbidden
```

---

## Global Session Management

### 2.1 Open Global Session (Admin Only)
```bash
curl -X POST http://localhost:8080/api/global-sessions/open \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "initialAmount": 5000
  }'

# Expected: 201 Created
{
  "publicId": "gs-20251020-001",
  "status": "OPEN",
  "initialAmount": 5000,
  "openedBy": { "firstName": "Admin", "lastName": "User" },
  "openedAt": "2025-10-20T14:00:00Z"
}
```

### 2.2 Get Current Global Session
```bash
curl -X GET http://localhost:8080/api/global-sessions/current \
  -H "Authorization: Bearer TOKEN"

# Expected: 200 OK
```

### 2.3 Try Opening Second Session (Should Fail)
```bash
curl -X POST http://localhost:8080/api/global-sessions/open \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"initialAmount": 3000}'

# Expected: 409 Conflict - "Session already open"
```

### 2.4 Close Global Session
```bash
curl -X POST http://localhost:8080/api/global-sessions/gs-20251020-001/close \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "finalAmount": 5500,
    "reconciliationNotes": "All amounts matched"
  }'

# Expected: 200 OK
{
  "publicId": "gs-20251020-001",
  "status": "CLOSED",
  "finalAmount": 5500,
  "closedAt": "2025-10-20T23:00:00Z"
}
```

---

## Cashier Management

### 3.1 Create Cashier (Admin Only)
```bash
curl -X POST http://localhost:8080/api/cashiers \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Bar Counter",
    "cashierNumber": "CAISSE-001",
    "pin": "1234",
    "description": "Main bar counter"
  }'

# Expected: 201 Created
{
  "publicId": "cashier-abc123",
  "name": "Bar Counter",
  "cashierNumber": "CAISSE-001",
  "status": "ACTIVE"
}
```

### 3.2 Get All Cashiers
```bash
curl -X GET http://localhost:8080/api/cashiers \
  -H "Authorization: Bearer TOKEN"

# Expected: 200 OK with list
```

### 3.3 Update Cashier
```bash
curl -X PUT http://localhost:8080/api/cashiers/cashier-abc123 \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Bar Counter Updated",
    "description": "Updated description"
  }'

# Expected: 200 OK
```

### 3.4 Change Cashier PIN (Admin Only)
```bash
curl -X POST http://localhost:8080/api/cashiers/cashier-abc123/change-pin \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"pin": "5678"}'

# Expected: 200 OK
```

---

## Cashier Sessions & PIN

### 4.1 Open Cashier Session (Requires Global Session Open)
```bash
# First, ensure GlobalSession is OPEN
curl -X POST http://localhost:8080/api/cashier-sessions/open \
  -H "Authorization: Bearer CAISSIER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "cashierId": "cashier-abc123",
    "pin": "1234",
    "initialAmount": 1000
  }'

# Expected: 201 Created
{
  "publicId": "cs-xyz789",
  "status": "OPEN",
  "initialAmount": 1000,
  "openedAt": "2025-10-20T14:15:00Z"
}
```

### 4.2 Test: Deny Cashier Session if Global Session Closed (Should Fail)
```bash
# Close GlobalSession first, then try:
curl -X POST http://localhost:8080/api/cashier-sessions/open \
  -H "Authorization: Bearer CAISSIER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"cashierId": "cashier-abc123", "pin": "1234"}'

# Expected: 400 Bad Request - "Global session must be open"
```

### 4.3 Test Invalid PIN (Should Fail)
```bash
curl -X POST http://localhost:8080/api/cashier-sessions/open \
  -H "Authorization: Bearer CAISSIER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"cashierId": "cashier-abc123", "pin": "0000"}'

# Expected: 401 Unauthorized - "Invalid PIN"
```

### 4.4 Test PIN Format Validation (Should Fail - Not 4 Digits)
```bash
curl -X POST http://localhost:8080/api/cashier-sessions/open \
  -H "Authorization: Bearer CAISSIER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"cashierId": "cashier-abc123", "pin": "123"}'

# Expected: 400 Bad Request - "PIN must be 4 digits"
```

### 4.5 Test Brute-Force Protection (3 Failed Attempts)
```bash
# Try 3 times with wrong PIN
for i in {1..3}; do
  curl -X POST http://localhost:8080/api/cashier-sessions/open \
    -H "Authorization: Bearer CAISSIER_TOKEN" \
    -d '{"cashierId": "cashier-abc123", "pin": "0000"}'
done

# After 3rd attempt: Expected 429 Too Many Requests - "Cashier locked for 15 minutes"
```

### 4.6 Update Activity (Keep Session Active)
```bash
curl -X POST http://localhost:8080/api/cashier-sessions/cs-xyz789/activity \
  -H "Authorization: Bearer CAISSIER_TOKEN"

# Expected: 200 OK
```

### 4.7 Lock Session Manually
```bash
curl -X POST http://localhost:8080/api/cashier-sessions/cs-xyz789/lock \
  -H "Authorization: Bearer CAISSIER_TOKEN"

# Expected: 200 OK
{
  "status": "LOCKED"
}
```

### 4.8 Unlock Session with PIN
```bash
curl -X POST http://localhost:8080/api/cashier-sessions/cs-xyz789/unlock \
  -H "Authorization: Bearer CAISSIER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"pin": "1234"}'

# Expected: 200 OK
{
  "status": "OPEN"
}
```

### 4.9 Close Cashier Session
```bash
curl -X POST http://localhost:8080/api/cashier-sessions/cs-xyz789/close \
  -H "Authorization: Bearer CAISSIER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "finalAmount": 1500,
    "notes": "Good shift"
  }'

# Expected: 200 OK
{
  "status": "CLOSED",
  "finalAmount": 1500
}
```

---

## Orders & MenuItems

### 5.1 Create Order with MenuItems
```bash
curl -X POST http://localhost:8080/api/orders \
  -H "Authorization: Bearer CAISSIER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "tablePublicId": "table-1",
    "orderType": "TABLE",
    "items": [
      {
        "menuItemPublicId": "menu-item-pizza-margherita",
        "quantity": 2,
        "notes": "Sans oignons"
      },
      {
        "menuItemPublicId": "menu-item-coca",
        "quantity": 2
      }
    ]
  }'

# Expected: 201 Created
{
  "publicId": "order-abc123",
  "orderNumber": "20251020-12345",
  "status": "EN_ATTENTE",
  "items": [
    {
      "menuItem": {
        "publicId": "menu-item-pizza-margherita",
        "menuName": "Menu du Jour"
      },
      "quantity": 2,
      "totalPrice": 2900
    }
  ],
  "cashierSession": {
    "publicId": "cs-xyz789"
  },
  "totalAmount": 3900
}
```

### 5.2 Test Invalid MenuItem (Should Fail)
```bash
curl -X POST http://localhost:8080/api/orders \
  -H "Authorization: Bearer CAISSIER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "items": [{"menuItemPublicId": "invalid-id", "quantity": 1}]
  }'

# Expected: 404 Not Found - "MenuItem not found"
```

### 5.3 Test Invalid Quantity (Should Fail)
```bash
curl -X POST http://localhost:8080/api/orders \
  -H "Authorization: Bearer CAISSIER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "items": [{"menuItemPublicId": "menu-item-pizza", "quantity": 0}]
  }'

# Expected: 400 Bad Request - "Quantity must be positive"
```

### 5.4 Test Discount Validation (Should Fail - Exceeds Total)
```bash
curl -X POST http://localhost:8080/api/orders \
  -H "Authorization: Bearer CAISSIER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "items": [{"menuItemPublicId": "menu-item-pizza", "quantity": 1}],
    "discountAmount": 999999
  }'

# Expected: 400 Bad Request - "Discount cannot exceed total amount"
```

### 5.5 Verify Order Links to Active CashierSession
```bash
# After creating order, verify:
curl -X GET http://localhost:8080/api/orders/order-abc123 \
  -H "Authorization: Bearer TOKEN"

# Should see in response:
{
  "cashierSession": {
    "publicId": "cs-xyz789",
    "cashier": { "name": "Bar Counter" },
    "user": { "firstName": "Jean", "lastName": "Dupont" }
  }
}
```

---

## Tickets System

### 6.1 Generate Separated Tickets (One per Station)
```bash
curl -X POST http://localhost:8080/api/tickets/session/session-abc123/generate/separated \
  -H "Authorization: Bearer CAISSIER_TOKEN"

# Expected: 201 Created
[
  {
    "publicId": "ticket-bar-001",
    "ticketNumber": "BAR-001",
    "workStation": "BAR",
    "status": "PENDING",
    "priority": 1,
    "message": "⚠️ SERVIR EN PREMIER",
    "items": [
      { "quantity": 2, "itemName": "Coca-Cola" },
      { "quantity": 1, "itemName": "Tiramisu" }
    ]
  },
  {
    "publicId": "ticket-kitchen-001",
    "ticketNumber": "KITCHEN-001",
    "workStation": "KITCHEN",
    "status": "PENDING",
    "priority": 2,
    "message": "Attendre que le Bar soit prêt",
    "items": [
      { "quantity": 2, "itemName": "Pizza Margherita" }
    ]
  }
]
```

### 6.2 Generate Unified Ticket (Single Receipt)
```bash
curl -X POST http://localhost:8080/api/tickets/session/session-abc123/generate/unified \
  -H "Authorization: Bearer CAISSIER_TOKEN"

# Expected: 201 Created
{
  "publicId": "ticket-unified-001",
  "ticketNumber": "RECEIPT-001",
  "workStation": "CHECKOUT",
  "status": "PENDING",
  "itemsByStation": {
    "BAR": [
      { "quantity": 2, "itemName": "Coca-Cola" },
      { "quantity": 1, "itemName": "Tiramisu" }
    ],
    "KITCHEN": [
      { "quantity": 2, "itemName": "Pizza Margherita" }
    ]
  },
  "totalItems": 5,
  "totalStations": 2
}
```

### 6.3 Get Session Tickets Status (Overview)
```bash
curl -X GET http://localhost:8080/api/tickets/session/session-abc123/status \
  -H "Authorization: Bearer TOKEN"

# Expected: 200 OK
{
  "sessionPublicId": "session-abc123",
  "tableNumber": "5",
  "customerName": "Table 5",
  "totalStations": 2,
  "readyStations": 1,
  "preparingStations": 1,
  "progressPercentage": 50,
  "sessionStatus": "PARTIALLY_READY",
  "serverMessage": "1/2 stations ready - 1 station(s) in progress",
  "ticketsByStation": {
    "BAR": {
      "status": "READY",
      "itemCount": 3
    },
    "KITCHEN": {
      "status": "PREPARING",
      "itemCount": 2
    }
  }
}
```

### 6.4 Get Active Tickets for BAR Station
```bash
curl -X GET http://localhost:8080/api/tickets/station/BAR/active \
  -H "Authorization: Bearer TOKEN"

# Expected: 200 OK - only BAR tickets
```

### 6.5 Mark Ticket as Ready
```bash
curl -X PUT http://localhost:8080/api/tickets/ticket-bar-001/ready \
  -H "Authorization: Bearer TOKEN"

# Expected: 204 No Content
```

### 6.6 Mark Ticket as Printed
```bash
curl -X PUT http://localhost:8080/api/tickets/ticket-kitchen-001/print \
  -H "Authorization: Bearer TOKEN"

# Expected: 204 No Content
```

### 6.7 Mark Ticket as Served
```bash
curl -X PUT http://localhost:8080/api/tickets/ticket-unified-001/served \
  -H "Authorization: Bearer TOKEN"

# Expected: 204 No Content
```

---

## Reporting & PDFs

### 7.1 Get Global Session Report (JSON)
```bash
curl -X GET http://localhost:8080/api/reports/global-session/gs-20251020-001 \
  -H "Authorization: Bearer ADMIN_TOKEN"

# Expected: 200 OK
{
  "publicId": "gs-20251020-001",
  "status": "CLOSED",
  "totalSales": 157500,
  "totalOrders": 45,
  "totalCashiers": 3,
  "cashierBreakdown": [
    {
      "cashierName": "Bar",
      "totalSales": 52500,
      "orderCount": 15
    }
  ],
  "topProducts": [
    { "name": "Pizza Margherita", "count": 28 },
    { "name": "Coca-Cola", "count": 42 }
  ]
}
```

### 7.2 Get Cashier Report (JSON) with Date Range
```bash
curl -X GET "http://localhost:8080/api/reports/cashier/cashier-abc123?startDate=2025-10-20&endDate=2025-10-21" \
  -H "Authorization: Bearer ADMIN_TOKEN"

# Expected: 200 OK
{
  "cashierName": "Bar",
  "startDate": "2025-10-20",
  "endDate": "2025-10-21",
  "totalSales": 52500,
  "orderCount": 15,
  "userBreakdown": [...]
}
```

### 7.3 Get User Report (JSON)
```bash
curl -X GET "http://localhost:8080/api/reports/user/user-xyz?startDate=2025-10-20&endDate=2025-10-21" \
  -H "Authorization: Bearer ADMIN_TOKEN"

# Expected: 200 OK
```

### 7.4 Download Global Session PDF
```bash
curl -X GET http://localhost:8080/api/reports/global-session/gs-20251020-001/pdf \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  --output report_global_session.pdf

# Expected: 200 OK - PDF file
```

### 7.5 Download Cashier Report PDF with Filtering
```bash
curl -X GET "http://localhost:8080/api/reports/cashier/cashier-abc123/pdf?startDate=2025-10-20&endDate=2025-10-21" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  --output report_cashier_oct20-21.pdf

# Expected: 200 OK - PDF file
```

### 7.6 Download User Report PDF
```bash
curl -X GET "http://localhost:8080/api/reports/user/user-xyz/pdf?startDate=2025-10-20&endDate=2025-10-21" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  --output report_user_oct20-21.pdf

# Expected: 200 OK - PDF file
```

### 7.7 Test Invalid Date Range (Should Fail)
```bash
curl -X GET "http://localhost:8080/api/reports/cashier/cashier-abc123?startDate=invalid&endDate=2025-10-21" \
  -H "Authorization: Bearer ADMIN_TOKEN"

# Expected: 400 Bad Request - "Invalid date format"
```

### 7.8 Test Date Range > 30 Days (Should Fail)
```bash
curl -X GET "http://localhost:8080/api/reports/cashier/cashier-abc123?startDate=2025-09-20&endDate=2025-10-21" \
  -H "Authorization: Bearer ADMIN_TOKEN"

# Expected: 400 Bad Request - "Date range cannot exceed 30 days"
```

---

## Security Tests

### 8.1 SQL Injection Test (Should Be Sanitized)
```bash
curl -X POST http://localhost:8080/api/cashiers/search \
  -H "Content-Type: application/json" \
  -d '{
    "query": "'; DROP TABLE cashiers; --"
  }'

# Expected: 400 Bad Request or sanitized results (no table dropped)
```

### 8.2 XSS Attack Test in Customer Name (Should Be Escaped)
```bash
curl -X POST http://localhost:8080/api/orders \
  -H "Authorization: Bearer CAISSIER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "customerName": "<img src=x onerror=\"alert(XSS)\">",
    "items": [{"menuItemPublicId": "item-1", "quantity": 1}]
  }'

# Expected: 201 Created with escaped HTML (onerror removed/escaped)
```

### 8.3 CSRF Token Validation
```bash
# Request without CSRF token
curl -X POST http://localhost:8080/api/global-sessions/open \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"initialAmount": 5000}'

# Expected: 403 Forbidden - "CSRF token missing or invalid"
```

### 8.4 Test Privilege Escalation (CAISSIER trying ADMIN action)
```bash
curl -X POST http://localhost:8080/api/cashiers \
  -H "Authorization: Bearer CAISSIER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "New Cashier", "cashierNumber": "CASH-099", "pin": "1234"}'

# Expected: 403 Forbidden - "Insufficient permissions"
```

### 8.5 Test Session Fixation (Using Another User's Token)
```bash
# Create session with User A's token
curl -X POST http://localhost:8080/api/cashier-sessions/open \
  -H "Authorization: Bearer USER_A_TOKEN" \
  -d '{"cashierId": "cashier-1", "pin": "1234"}'

# Try to use it with User B's token
curl -X POST http://localhost:8080/api/cashier-sessions/cs-abc/close \
  -H "Authorization: Bearer USER_B_TOKEN"

# Expected: 403 Forbidden - "Session belongs to different user"
```

### 8.6 Test Rate Limiting (Brute Force PIN Attempts)
```bash
# Send 5 rapid wrong PIN attempts
for i in {1..5}; do
  curl -X POST http://localhost:8080/api/cashier-sessions/open \
    -H "Authorization: Bearer TOKEN" \
    -d '{"cashierId": "cashier-1", "pin": "0000"}'
done

# Expected: After 3, return 429 Too Many Requests
```

### 8.7 Test Input Length Validation
```bash
curl -X POST http://localhost:8080/api/cashiers \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "'$(python3 -c 'print("A" * 1000)')'"
  }'

# Expected: 400 Bad Request - "Input exceeds maximum length"
```

---

## Test Execution Summary

**All tests should verify:**
- ✅ Correct HTTP status codes
- ✅ Valid JWT token handling
- ✅ Role-based access control
- ✅ Input validation
- ✅ Security constraints
- ✅ Business logic rules
- ✅ Proper error messages

**Run complete test suite:**
```bash
# Frontend (Jasmine/Angular)
cd sellia-app
npm run test

# Backend (Maven/JUnit)
cd sellia-backend
mvn clean test

# End-to-End (if Cypress/Protractor configured)
npm run e2e
```
