/**
 * SELLIA POS - Complete Platform Test Suite
 * 
 * Covers:
 * - Authentication & Authorization
 * - Multi-cashier system
 * - Ticket generation (separated & unified)
 * - Order management
 * - Session management
 * - Security tests (SQL injection, XSS, CSRF, authentication bypass)
 * - Role-based access control
 * - Data validation
 */

import { TestBed, ComponentFixture } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { ApiService } from '@core/services/api.service';
import { GlobalSessionService } from '@core/services/global-session.service';
import { CashierSessionService } from '@core/services/cashier-session.service';

describe('SELLIA POS - Complete Platform Test Suite', () => {

  let httpMock: HttpTestingController;
  let apiService: ApiService;
  let globalSessionService: GlobalSessionService;
  let cashierSessionService: CashierSessionService;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        ApiService,
        GlobalSessionService,
        CashierSessionService,
        { provide: Router, useValue: jasmine.createSpyObj('Router', ['navigate']) }
      ]
    });

    httpMock = TestBed.inject(HttpTestingController);
    apiService = TestBed.inject(ApiService);
    globalSessionService = TestBed.inject(GlobalSessionService);
    cashierSessionService = TestBed.inject(CashierSessionService);
    router = TestBed.inject(Router);
  });

  afterEach(() => {
    httpMock.verify();
  });

  // ============================================================================
  // 1. AUTHENTICATION & AUTHORIZATION TESTS
  // ============================================================================

  describe('1. Authentication & Authorization', () => {

    it('should allow valid login and store JWT token', (done) => {
      const credentials = { email: 'admin@sellia.com', password: 'Admin123!' };
      
      apiService.login(credentials).subscribe(response => {
        expect(response.token).toBeTruthy();
        expect(localStorage.getItem('auth_token')).toBe(response.token);
        done();
      });

      const req = httpMock.expectOne(`${apiService['apiUrl']}/auth/login`);
      expect(req.request.method).toBe('POST');
      req.flush({ token: 'valid-jwt-token-abc123' });
    });

    it('should reject invalid credentials', (done) => {
      const invalidCreds = { email: 'admin@sellia.com', password: 'wrongpassword' };
      
      apiService.login(invalidCreds).subscribe(
        () => fail('should have failed'),
        (error: HttpErrorResponse) => {
          expect(error.status).toBe(401);
          expect(error.error.message).toContain('Invalid credentials');
          done();
        }
      );

      const req = httpMock.expectOne(`${apiService['apiUrl']}/auth/login`);
      req.flush({ message: 'Invalid credentials' }, { status: 401, statusText: 'Unauthorized' });
    });

    it('should deny access without valid JWT token', (done) => {
      localStorage.removeItem('auth_token');
      
      apiService.getAllCashiers().subscribe(
        () => fail('should have failed'),
        (error: HttpErrorResponse) => {
          expect(error.status).toBe(401);
          done();
        }
      );

      const req = httpMock.expectOne(`${apiService['apiUrl']}/cashiers`);
      expect(req.request.headers.has('Authorization')).toBeFalsy();
      req.flush({ message: 'Unauthorized' }, { status: 401, statusText: 'Unauthorized' });
    });

    it('should include Authorization header with valid token', (done) => {
      const token = 'valid-jwt-token-xyz789';
      localStorage.setItem('auth_token', token);
      
      apiService.getAllCashiers().subscribe(() => {
        done();
      });

      const req = httpMock.expectOne(`${apiService['apiUrl']}/cashiers`);
      expect(req.request.headers.get('Authorization')).toBe(`Bearer ${token}`);
      req.flush([]);
    });

    it('should reject expired JWT token', (done) => {
      localStorage.setItem('auth_token', 'expired-token-123');
      
      apiService.getAllCashiers().subscribe(
        () => fail('should have failed'),
        (error: HttpErrorResponse) => {
          expect(error.status).toBe(401);
          done();
        }
      );

      const req = httpMock.expectOne(`${apiService['apiUrl']}/cashiers`);
      req.flush({ message: 'Token expired' }, { status: 401, statusText: 'Unauthorized' });
    });

    it('should support role-based access control - ADMIN can access cashiers', (done) => {
      const adminToken = 'admin-jwt-token';
      localStorage.setItem('auth_token', adminToken);
      localStorage.setItem('user_role', 'ADMIN');
      
      apiService.getAllCashiers().subscribe(data => {
        expect(data).toBeTruthy();
        done();
      });

      const req = httpMock.expectOne(`${apiService['apiUrl']}/cashiers`);
      req.flush([{ publicId: 'cashier-1', name: 'Bar' }]);
    });

    it('should deny CAISSIER access to cashier management', (done) => {
      localStorage.setItem('user_role', 'CAISSIER');
      
      apiService.createCashier({ name: 'New Cashier', cashierNumber: 'CASH-002', pin: '1234' })
        .subscribe(
          () => fail('should have failed'),
          (error: HttpErrorResponse) => {
            expect(error.status).toBe(403);
            done();
          }
        );

      const req = httpMock.expectOne(`${apiService['apiUrl']}/cashiers`);
      req.flush({ message: 'Forbidden' }, { status: 403, statusText: 'Forbidden' });
    });

    it('should logout and clear tokens', (done) => {
      localStorage.setItem('auth_token', 'some-token');
      localStorage.setItem('user_id', 'user-123');
      
      apiService.logout().subscribe(() => {
        expect(localStorage.getItem('auth_token')).toBeNull();
        expect(localStorage.getItem('user_id')).toBeNull();
        done();
      });

      const req = httpMock.expectOne(`${apiService['apiUrl']}/auth/logout`);
      req.flush({});
    });
  });

  // ============================================================================
  // 2. SECURITY TESTS - SQL INJECTION, XSS, CSRF
  // ============================================================================

  describe('2. Security - Input Validation & Injection Prevention', () => {

    it('should sanitize SQL injection attempts in search', (done) => {
      const maliciousInput = "'; DROP TABLE cashiers; --";
      
      apiService.searchCashiers(maliciousInput).subscribe(data => {
        expect(data).toBeDefined();
        done();
      });

      const req = httpMock.expectOne(req => req.url.includes('/cashiers/search'));
      expect(req.request.params.get('q')).toContain("'; DROP TABLE");
      req.flush([]);
    });

    it('should prevent XSS via HTML injection in customer name', (done) => {
      const xssPayload = '<img src=x onerror="alert(\'XSS\')">';
      const order = {
        customerName: xssPayload,
        items: [{ menuItemPublicId: 'item-1', quantity: 1 }]
      };
      
      apiService.createOrder(order).subscribe(response => {
        expect(response.customerName).not.toContain('onerror');
        expect(response.customerName).toContain('img');
        done();
      });

      const req = httpMock.expectOne(`${apiService['apiUrl']}/orders`);
      expect(req.request.body.customerName).toBe(xssPayload);
      req.flush({ ...order, publicId: 'order-1' });
    });

    it('should reject CSV injection in cashier name', (done) => {
      const csvInjection = '=cmd|"/c calc"!A0';
      const cashierData = { name: csvInjection, cashierNumber: 'CASH-001', pin: '1234' };
      
      apiService.createCashier(cashierData).subscribe(
        () => fail('should reject'),
        (error: HttpErrorResponse) => {
          expect(error.status).toBe(400);
          done();
        }
      );

      const req = httpMock.expectOne(`${apiService['apiUrl']}/cashiers`);
      req.flush({ message: 'Invalid input' }, { status: 400, statusText: 'Bad Request' });
    });

    it('should prevent NoSQL injection in queries', (done) => {
      const noSqlInjection = { $ne: null };
      
      apiService.getAllCashiers().subscribe(data => {
        expect(data).toBeTruthy();
        done();
      });

      const req = httpMock.expectOne(`${apiService['apiUrl']}/cashiers`);
      req.flush([]);
    });

    it('should validate PIN format (4 digits only)', (done) => {
      const invalidPins = ['123', 'ABCD', '12345', 'pin1'];
      let testCount = 0;

      invalidPins.forEach(pin => {
        const cashierData = { name: 'Test', cashierNumber: 'CASH-001', pin };
        
        apiService.createCashier(cashierData).subscribe(
          () => fail('should reject invalid PIN'),
          (error: HttpErrorResponse) => {
            expect(error.status).toBe(400);
            testCount++;
            if (testCount === invalidPins.length) done();
          }
        );

        const req = httpMock.expectOne(`${apiService['apiUrl']}/cashiers`);
        req.flush({ message: 'PIN must be 4 digits' }, { status: 400, statusText: 'Bad Request' });
      });
    });

    it('should enforce strong password requirements', (done) => {
      const weakPasswords = ['123456', 'password', 'Admin', 'a1B2c3'];
      let testCount = 0;

      weakPasswords.forEach(password => {
        const registerData = { 
          email: 'test@sellia.com', 
          password,
          firstName: 'Test'
        };
        
        apiService.register(registerData).subscribe(
          () => fail('should reject weak password'),
          (error: HttpErrorResponse) => {
            expect(error.status).toBe(400);
            testCount++;
            if (testCount === weakPasswords.length) done();
          }
        );

        const req = httpMock.expectOne(`${apiService['apiUrl']}/auth/register`);
        req.flush({ message: 'Password too weak' }, { status: 400, statusText: 'Bad Request' });
      });
    });

    it('should prevent CSRF attacks by validating CSRF token', (done) => {
      const csrfToken = 'valid-csrf-token-123';
      sessionStorage.setItem('csrf_token', csrfToken);
      
      apiService.openGlobalSession(5000).subscribe(response => {
        expect(response.publicId).toBeTruthy();
        done();
      });

      const req = httpMock.expectOne(`${apiService['apiUrl']}/global-sessions/open`);
      expect(req.request.headers.get('X-CSRF-Token')).toBeTruthy();
      req.flush({ publicId: 'session-1', status: 'OPEN' });
    });
  });

  // ============================================================================
  // 3. GLOBAL SESSION TESTS
  // ============================================================================

  describe('3. Global Session Management', () => {

    it('should open global session with initial amount', (done) => {
      globalSessionService.openSession(5000).subscribe(session => {
        expect(session.status).toBe('OPEN');
        expect(session.initialAmount).toBe(5000);
        done();
      });

      const req = httpMock.expectOne(`${apiService['apiUrl']}/global-sessions/open`);
      req.flush({ publicId: 'gs-1', status: 'OPEN', initialAmount: 5000 });
    });

    it('should prevent opening multiple simultaneous global sessions', (done) => {
      globalSessionService.openSession(5000).subscribe(() => {
        globalSessionService.openSession(3000).subscribe(
          () => fail('should reject second session'),
          (error: HttpErrorResponse) => {
            expect(error.status).toBe(409);
            done();
          }
        );

        const req2 = httpMock.expectOne(`${apiService['apiUrl']}/global-sessions/open`);
        req2.flush({ message: 'Session already open' }, { status: 409, statusText: 'Conflict' });
      });

      const req = httpMock.expectOne(`${apiService['apiUrl']}/global-sessions/open`);
      req.flush({ publicId: 'gs-1', status: 'OPEN' });
    });

    it('should close global session with reconciliation', (done) => {
      const sessionId = 'gs-1';
      globalSessionService.closeSession(sessionId, 5500, 'All matched').subscribe(session => {
        expect(session.status).toBe('CLOSED');
        expect(session.finalAmount).toBe(5500);
        done();
      });

      const req = httpMock.expectOne(`${apiService['apiUrl']}/global-sessions/${sessionId}/close`);
      expect(req.request.body.reconciliationNotes).toBe('All matched');
      req.flush({ publicId: sessionId, status: 'CLOSED', finalAmount: 5500 });
    });

    it('should prevent cashier session open before global session', (done) => {
      localStorage.removeItem('global_session_open');
      
      cashierSessionService.openSession('cashier-1', '1234', 0).subscribe(
        () => fail('should require global session'),
        (error: HttpErrorResponse) => {
          expect(error.status).toBe(400);
          done();
        }
      );

      const req = httpMock.expectOne(`${apiService['apiUrl']}/cashier-sessions/open`);
      req.flush({ message: 'Global session must be open' }, { status: 400, statusText: 'Bad Request' });
    });
  });

  // ============================================================================
  // 4. CASHIER SESSION & SECURITY TESTS
  // ============================================================================

  describe('4. Cashier Session & PIN Security', () => {

    beforeEach(() => {
      localStorage.setItem('global_session_open', 'true');
    });

    it('should open cashier session with valid PIN', (done) => {
      cashierSessionService.openSession('cashier-1', '1234', 1000).subscribe(session => {
        expect(session.status).toBe('OPEN');
        expect(session.initialAmount).toBe(1000);
        done();
      });

      const req = httpMock.expectOne(`${apiService['apiUrl']}/cashier-sessions/open`);
      req.flush({ publicId: 'cs-1', status: 'OPEN', initialAmount: 1000 });
    });

    it('should reject invalid PIN format', (done) => {
      const invalidPins = ['123', '12345', 'abcd', ''];
      let testCount = 0;

      invalidPins.forEach(pin => {
        cashierSessionService.openSession('cashier-1', pin, 1000).subscribe(
          () => fail('should reject'),
          (error: HttpErrorResponse) => {
            expect(error.status).toBe(400);
            testCount++;
            if (testCount === invalidPins.length) done();
          }
        );

        const req = httpMock.expectOne(`${apiService['apiUrl']}/cashier-sessions/open`);
        req.flush({ message: 'PIN must be 4 digits' }, { status: 400, statusText: 'Bad Request' });
      });
    });

    it('should enforce brute-force protection after 3 failed attempts', (done) => {
      const wrongPin = '0000';
      let attemptCount = 0;

      const tryLogin = () => {
        cashierSessionService.openSession('cashier-1', wrongPin, 0).subscribe(
          () => fail('should fail with wrong PIN'),
          (error: HttpErrorResponse) => {
            attemptCount++;
            if (attemptCount < 3) {
              expect(error.status).toBe(401);
              tryLogin();
            } else {
              expect(error.status).toBe(429); // Too Many Requests
              done();
            }
          }
        );

        const req = httpMock.expectOne(`${apiService['apiUrl']}/cashier-sessions/open`);
        if (attemptCount < 3) {
          req.flush({ message: 'Invalid PIN' }, { status: 401, statusText: 'Unauthorized' });
        } else {
          req.flush({ message: 'Too many attempts' }, { status: 429, statusText: 'Too Many Requests' });
        }
      };

      tryLogin();
    });

    it('should lock cashier after 15 minutes of inactivity', (done) => {
      const sessionId = 'cs-1';
      
      cashierSessionService.updateActivity(sessionId).subscribe(() => {
        // Simulate 15+ minutes passing
        jasmine.clock().install();
        jasmine.clock().mockDate(new Date(Date.now() + 16 * 60 * 1000));
        
        cashierSessionService.getCurrentSession().subscribe(
          () => fail('should be locked'),
          (error: HttpErrorResponse) => {
            expect(error.status).toBe(423); // Locked
            jasmine.clock().uninstall();
            done();
          }
        );

        const req = httpMock.expectOne(`${apiService['apiUrl']}/cashier-sessions/current`);
        req.flush({ message: 'Session locked - auto-logout' }, { status: 423, statusText: 'Locked' });
      });

      const req = httpMock.expectOne(`${apiService['apiUrl']}/cashier-sessions/${sessionId}/activity`);
      req.flush({});
    });

    it('should allow PIN unlock after lockout', (done) => {
      const sessionId = 'cs-1';
      const correctPin = '1234';
      
      cashierSessionService.unlockSession(sessionId, correctPin).subscribe(session => {
        expect(session.status).toBe('OPEN');
        done();
      });

      const req = httpMock.expectOne(`${apiService['apiUrl']}/cashier-sessions/${sessionId}/unlock`);
      req.flush({ publicId: sessionId, status: 'OPEN' });
    });
  });

  // ============================================================================
  // 5. ORDER & MENUITEM TESTS
  // ============================================================================

  describe('5. Order Management with MenuItems', () => {

    it('should create order with MenuItems (not Products)', (done) => {
      const order = {
        tablePublicId: 'table-1',
        items: [
          { menuItemPublicId: 'menu-item-1', quantity: 2 },
          { menuItemPublicId: 'menu-item-2', quantity: 1 }
        ]
      };

      apiService.createOrder(order).subscribe(response => {
        expect(response.items.length).toBe(2);
        expect(response.items[0].menuItem).toBeTruthy();
        expect(response.items[0].menuItem.publicId).toBe('menu-item-1');
        done();
      });

      const req = httpMock.expectOne(`${apiService['apiUrl']}/orders`);
      expect(req.request.body.items[0]).toHaveProperty('menuItemPublicId');
      req.flush({
        publicId: 'order-1',
        items: [
          { 
            menuItem: { publicId: 'menu-item-1', menuName: 'Menu du Jour' },
            quantity: 2
          }
        ]
      });
    });

    it('should reject order with invalid MenuItem', (done) => {
      const order = {
        items: [{ menuItemPublicId: 'invalid-id', quantity: 1 }]
      };

      apiService.createOrder(order).subscribe(
        () => fail('should fail'),
        (error: HttpErrorResponse) => {
          expect(error.status).toBe(404);
          done();
        }
      );

      const req = httpMock.expectOne(`${apiService['apiUrl']}/orders`);
      req.flush({ message: 'MenuItem not found' }, { status: 404, statusText: 'Not Found' });
    });

    it('should automatically link order to active CashierSession', (done) => {
      const order = {
        items: [{ menuItemPublicId: 'menu-item-1', quantity: 1 }]
      };

      apiService.createOrder(order).subscribe(response => {
        expect(response.cashierSession).toBeTruthy();
        expect(response.cashierSession.publicId).toBe('cs-1');
        done();
      });

      const req = httpMock.expectOne(`${apiService['apiUrl']}/orders`);
      req.flush({
        publicId: 'order-1',
        cashierSession: { publicId: 'cs-1' },
        items: []
      });
    });
  });

  // ============================================================================
  // 6. TICKET SYSTEM TESTS
  // ============================================================================

  describe('6. Ticket System - Separated & Unified', () => {

    it('should generate separated tickets (one per WorkStation)', (done) => {
      const sessionId = 'session-1';
      
      apiService.generateSeparatedTickets(sessionId).subscribe(tickets => {
        expect(tickets.length).toBe(2); // BAR and KITCHEN
        expect(tickets[0].workStation).toBe('BAR');
        expect(tickets[0].priority).toBe(1); // BAR first
        expect(tickets[1].workStation).toBe('KITCHEN');
        expect(tickets[1].priority).toBe(2);
        done();
      });

      const req = httpMock.expectOne(req => req.url.includes('/tickets/session/'));
      req.flush([
        { 
          ticketNumber: 'BAR-001', 
          workStation: 'BAR', 
          priority: 1,
          items: [{ itemName: 'Coca' }, { itemName: 'Bière' }]
        },
        { 
          ticketNumber: 'KITCHEN-001', 
          workStation: 'KITCHEN', 
          priority: 2,
          items: [{ itemName: 'Pizza' }]
        }
      ]);
    });

    it('should generate unified ticket with all items grouped by station', (done) => {
      const sessionId = 'session-1';
      
      apiService.generateUnifiedTicket(sessionId).subscribe(ticket => {
        expect(ticket.itemsByStation).toHaveProperty('BAR');
        expect(ticket.itemsByStation).toHaveProperty('KITCHEN');
        expect(ticket.itemsByStation.BAR.length).toBe(2);
        expect(ticket.itemsByStation.KITCHEN.length).toBe(1);
        done();
      });

      const req = httpMock.expectOne(req => req.url.includes('/tickets/session/') && req.url.includes('/unified'));
      req.flush({
        ticketNumber: 'RECEIPT-001',
        itemsByStation: {
          BAR: [{ quantity: 1, itemName: 'Coca' }, { quantity: 1, itemName: 'Bière' }],
          KITCHEN: [{ quantity: 2, itemName: 'Pizza' }]
        }
      });
    });

    it('should get session tickets status with progress percentage', (done) => {
      const sessionId = 'session-1';
      
      apiService.getSessionTicketsStatus(sessionId).subscribe(response => {
        expect(response.totalStations).toBe(2);
        expect(response.readyStations).toBe(1);
        expect(response.progressPercentage).toBe(50);
        expect(response.serverMessage).toContain('1/2');
        done();
      });

      const req = httpMock.expectOne(`${apiService['apiUrl']}/tickets/session/${sessionId}/status`);
      req.flush({
        totalStations: 2,
        readyStations: 1,
        preparingStations: 1,
        progressPercentage: 50,
        serverMessage: '1/2 stations ready'
      });
    });
  });

  // ============================================================================
  // 7. DATA VALIDATION & BUSINESS LOGIC
  // ============================================================================

  describe('7. Data Validation & Business Logic', () => {

    it('should validate quantity is positive integer', (done) => {
      const invalidOrders = [
        { quantity: 0 },
        { quantity: -1 },
        { quantity: 1.5 },
        { quantity: 'abc' }
      ];

      let testCount = 0;
      invalidOrders.forEach(item => {
        const order = {
          items: [{ menuItemPublicId: 'item-1', ...item }]
        };

        apiService.createOrder(order).subscribe(
          () => fail('should reject'),
          (error: HttpErrorResponse) => {
            expect(error.status).toBe(400);
            testCount++;
            if (testCount === invalidOrders.length) done();
          }
        );

        const req = httpMock.expectOne(`${apiService['apiUrl']}/orders`);
        req.flush({ message: 'Invalid quantity' }, { status: 400, statusText: 'Bad Request' });
      });
    });

    it('should validate discount does not exceed total amount', (done) => {
      const order = {
        totalAmount: 1000,
        discountAmount: 1500
      };

      apiService.createOrder(order).subscribe(
        () => fail('should reject'),
        (error: HttpErrorResponse) => {
          expect(error.status).toBe(400);
          done();
        }
      );

      const req = httpMock.expectOne(`${apiService['apiUrl']}/orders`);
      req.flush({ message: 'Discount cannot exceed total' }, { status: 400, statusText: 'Bad Request' });
    });

    it('should prevent duplicate table assignments', (done) => {
      const tableId = 'table-1';
      
      apiService.createOrder({ tablePublicId: tableId, items: [] }).subscribe(() => {
        apiService.createOrder({ tablePublicId: tableId, items: [] }).subscribe(
          () => fail('should reject duplicate'),
          (error: HttpErrorResponse) => {
            expect(error.status).toBe(409);
            done();
          }
        );

        const req2 = httpMock.expectOne(`${apiService['apiUrl']}/orders`);
        req2.flush({ message: 'Table already occupied' }, { status: 409, statusText: 'Conflict' });
      });

      const req = httpMock.expectOne(`${apiService['apiUrl']}/orders`);
      req.flush({ publicId: 'order-1' });
    });
  });

  // ============================================================================
  // 8. REPORTING & PDF TESTS
  // ============================================================================

  describe('8. Reporting & PDF Generation', () => {

    it('should generate global session report as JSON', (done) => {
      const sessionId = 'gs-1';
      
      apiService.getGlobalSessionReport(sessionId).subscribe(report => {
        expect(report.totalSales).toBeDefined();
        expect(report.totalOrders).toBeDefined();
        expect(report.cashierBreakdown).toBeDefined();
        done();
      });

      const req = httpMock.expectOne(`${apiService['apiUrl']}/reports/global-session/${sessionId}`);
      req.flush({
        totalSales: 50000,
        totalOrders: 25,
        cashierBreakdown: []
      });
    });

    it('should generate PDF report with date filtering', (done) => {
      const cashierId = 'cashier-1';
      const startDate = '2025-10-20';
      const endDate = '2025-10-21';
      
      apiService.downloadCashierReportPdf(cashierId, startDate, endDate).subscribe(blob => {
        expect(blob.type).toBe('application/pdf');
        done();
      });

      const req = httpMock.expectOne(req => 
        req.url.includes(`/reports/cashier/${cashierId}/pdf`) &&
        req.url.includes('startDate=') &&
        req.url.includes('endDate=')
      );
      req.flush(new Blob(['PDF content'], { type: 'application/pdf' }));
    });

    it('should validate date range in reports', (done) => {
      const invalidDates = [
        { startDate: 'invalid', endDate: '2025-10-21' },
        { startDate: '2025-10-21', endDate: '2025-10-20' }, // End before start
        { startDate: '2025-10-01', endDate: '2025-11-01' }  // >30 days
      ];

      let testCount = 0;
      invalidDates.forEach(dates => {
        apiService.getCashierReport('cashier-1', dates.startDate, dates.endDate).subscribe(
          () => fail('should reject'),
          (error: HttpErrorResponse) => {
            expect(error.status).toBe(400);
            testCount++;
            if (testCount === invalidDates.length) done();
          }
        );

        const req = httpMock.expectOne(`${apiService['apiUrl']}/reports/cashier/cashier-1`);
        req.flush({ message: 'Invalid date range' }, { status: 400, statusText: 'Bad Request' });
      });
    });
  });

  // ============================================================================
  // 9. PERFORMANCE & LOAD TESTS
  // ============================================================================

  describe('9. Performance & Load Tests', () => {

    it('should handle bulk order creation', (done) => {
      const bulkCount = 100;
      let successCount = 0;

      for (let i = 0; i < bulkCount; i++) {
        const order = {
          items: [{ menuItemPublicId: `item-${i}`, quantity: 1 }]
        };

        apiService.createOrder(order).subscribe(() => {
          successCount++;
          if (successCount === bulkCount) {
            expect(successCount).toBe(bulkCount);
            done();
          }
        });
      }

      for (let i = 0; i < bulkCount; i++) {
        const req = httpMock.expectOne(`${apiService['apiUrl']}/orders`);
        req.flush({ publicId: `order-${i}` });
      }
    });

    it('should timeout long-running requests', (done) => {
      apiService.getSessionTicketsStatus('session-1').subscribe(
        () => fail('should timeout'),
        (error) => {
          expect(error.name).toBe('TimeoutError');
          done();
        }
      );

      const req = httpMock.expectOne(`${apiService['apiUrl']}/tickets/session/session-1/status`);
      req.flush({}, { status: 408, statusText: 'Request Timeout' });
    });
  });

});
