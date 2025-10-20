# QR Code Ordering System - Documentation

## Overview

Clients can scan QR codes placed on restaurant tables to view the menu and place orders directly from their smartphones. The system automatically differentiates between VIP and Standard tables, showing only appropriate menu items.

## Architecture

```
┌─────────────────┐
│   Table QR      │
│   Code Scan     │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────┐
│ Browser Navigation: /qr/{qrToken}   │
│ (Public URL - No Authentication)    │
└────────┬────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│ PublicMenuComponent (Angular)       │
│ ✓ Load menu via API                 │
│ ✓ Display items                     │
│ ✓ Shopping cart                     │
│ ✓ Checkout                          │
└────────┬────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│ Backend Endpoints (Spring Boot)     │
│ GET  /api/public/menu/{qrToken}     │
│ POST /api/public/orders             │
└────────┬────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│ Database                            │
│ ✓ Order stored                      │
│ ✓ Links to table & session          │
│ ✓ Appears in POS system             │
└─────────────────────────────────────┘
```

## Database Setup

### RestaurantTable Entity
Each table has:
- `qrCodeToken` - Unique token for QR code (UUID format)
- `isVip` - Boolean flag (true = VIP table, false = Standard)
- `qrCodeUrl` - Generated QR code image URL

### CustomerSession
Automatically created when customer scans QR code:
- `qrCodeToken` - Links back to table
- `table` - Reference to RestaurantTable
- `active` - Currently active session

## API Endpoints

### 1. Get Public Menu
```http
GET /api/public/menu/{qrToken}
Content-Type: application/json

Response 200 OK:
{
  "tablePublicId": "tbl-abc123",
  "tableNumber": "5",
  "isVip": false,
  "customerSessionToken": "qr-token-xyz",
  "categories": [
    {
      "publicId": "menu-abc",
      "name": "Menu du Jour",
      "description": "Daily special menu",
      "itemCount": 8
    }
  ],
  "popularItems": [
    {
      "publicId": "item-pizza",
      "menuName": "Menu du Jour",
      "itemName": "Pizza Margherita",
      "price": 2500,
      "description": "Fresh mozzarella and tomato",
      "preparationTime": 15,
      "isSpecial": true,
      "specialDescription": "Chef's recommendation"
    }
  ]
}
```

### 2. Create Order from QR Code
```http
POST /api/public/orders
Content-Type: application/json

Request:
{
  "customerSessionToken": "qr-token-xyz",
  "items": [
    {
      "menuItemPublicId": "item-pizza",
      "quantity": 2,
      "notes": "Extra cheese on one"
    },
    {
      "menuItemPublicId": "item-coca",
      "quantity": 2
    }
  ],
  "customerName": "Jean Dupont",
  "customerPhone": "+237600123456",
  "notes": "No onions on pizza",
  "discountAmount": 0
}

Response 201 Created:
{
  "orderPublicId": "ord-abc123",
  "orderNumber": "20251020-1430-5234",
  "tableNumber": "5",
  "itemCount": 3,
  "totalAmount": 7000,
  "status": "EN_ATTENTE",
  "createdAt": "2025-10-20T14:30:00Z",
  "message": "Commande reçue! Merci de votre commande."
}
```

### 3. Health Check
```http
GET /api/public/health
Response: "Public API is running"
```

## Frontend UI Flow

### Step 1: Scan QR Code
- Customer scans QR code on table
- Browser opens: `https://app.sellia.com/qr/{qrToken}`

### Step 2: Load Menu
- PublicMenuComponent initializes
- Calls `GET /api/public/menu/{qrToken}`
- Shows table number and type (VIP/Standard)

### Step 3: Browse Menu
```
┌─────────────────────────────────────┐
│  Welcome!                           │
│  Table 5 [Standard]                 │
├─────────────────────────────────────┤
│  ✨ Spécialités du Jour             │
│  ├─ Pizza Margherita 2,500 XAF      │
│  ├─ Coca-Cola         500 XAF       │
│  └─ Tiramisu         1,500 XAF      │
├─────────────────────────────────────┤
│  Menu du Jour                       │
│  ├─ Steak Frites      4,000 XAF     │
│  └─ Salade Niçoise    2,000 XAF     │
└─────────────────────────────────────┘
```

### Step 4: Add to Cart
- Click "Ajouter" button on item
- Item appears in shopping cart
- Cart total updates in real-time

### Step 5: Manage Cart
```
┌──────────────────────┐
│  Votre Panier        │
├──────────────────────┤
│ Pizza Margherita x2  │
│ 2,500 XAF × 2        │
│ [- 2 +] [🗑]         │
│ Total: 5,000 XAF     │
├──────────────────────┤
│ Coca-Cola x2         │
│ 500 XAF × 2          │
│ [- 2 +] [🗑]         │
│ Total: 1,000 XAF     │
├──────────────────────┤
│ Sous-total: 6,000 XAF│
└──────────────────────┘
```

### Step 6: Enter Customer Info (Optional)
- Name
- Phone number
- Special notes (allergies, preferences)

### Step 7: Submit Order
- Click "Commander (6,000 XAF)"
- POST to `/api/public/orders`
- Show confirmation

### Step 8: Order Confirmation
```
┌──────────────────────────────────────┐
│ ✓ Commande Reçue!                    │
│                                      │
│ Numéro de commande: 20251020-1430... │
│                                      │
│ Votre commande a été enregistrée.    │
│ Merci de votre visite!               │
└──────────────────────────────────────┘
```

## VIP vs Standard Table Behavior

### Standard Table
- URL: `/qr/{qrToken}`
- Scans table marked `isVip: false`
- Receives menus:
  - STANDARD (regular menu)
  - MENU_DU_JOUR (daily menu)
- Cannot access VIP items

### VIP Table
- URL: `/qr/{qrToken}`
- Scans table marked `isVip: true`
- Receives menus:
  - VIP (exclusive menu)
  - MENU_DU_JOUR (daily menu for VIP)
- Cannot access standard items

### Server-Side Validation
```java
// Validate menu item access
if (isTableVip == false && menuItem.getMenu().getMenuType() == MenuType.VIP) {
    throw new ValidationException("VIP items not available for standard tables");
}
```

## Error Handling

### Invalid QR Code
```
❌ QR code invalide ou table non trouvée
[Redirecting to home in 3 seconds...]
```

### Menu Item Not Available
```
"MenuItem is not available: item-xyz"
```

### Discount Exceeds Total
```
"Discount cannot exceed total amount"
```

### Session No Longer Active
```
"Session is no longer active"
```

## Integration with POS System

### Order Flow
1. Customer submits order via QR code
2. Order created in database
3. Linked to CustomerSession
4. Order appears in:
   - Kitchen screen (if has kitchen items)
   - Bar screen (if has bar items)
   - Caisse screen (unified ticket)

### Order Status
- `EN_ATTENTE` - Received, waiting to start
- Tracks through same system as regular orders
- Can be marked ready/served by staff
- Included in end-of-day reports

## QR Code Generation

### URL Format
```
https://app.sellia.com/qr/{qrCodeToken}

Example:
https://app.sellia.com/qr/a7f3d2e1-4c6b-9f2e-1a3b-5c7d9e0f2a4b
```

### QR Code Creation (For Admin)
In Table Management UI (future feature):
1. Create/Edit Table
2. Generate QR Code button
3. Download QR code image
4. Print and place on table

### Print Format
- Size: 5cm × 5cm (standard table QR)
- Include table number below QR
- Include restaurant name/logo
- Durable lamination recommended

## Security Considerations

### Authentication
- Public endpoints do NOT require JWT
- All validation done server-side
- QR token is one-time use per session
- Table assignment validated via token lookup

### Input Validation
- MenuItem must exist and be available
- Quantity must be positive integer
- Customer info optional but validated
- Discount cannot exceed total

### Rate Limiting
- No rate limiting on public endpoints (by design for UX)
- Can be added if needed
- Consider IP-based throttling for future

### Data Privacy
- No sensitive data in QR token
- Session only contains table reference
- Customer info stored with order
- No personal data exposed in URLs

## Testing

### Manual QR Code Test
```bash
# 1. Generate QR token (simulate table creation)
# Token format: UUID (e.g., a7f3d2e1-4c6b-9f2e-1a3b-5c7d9e0f2a4b)

# 2. Test menu endpoint
curl http://localhost:8080/api/public/menu/a7f3d2e1-4c6b-9f2e-1a3b-5c7d9e0f2a4b

# 3. Test order endpoint
curl -X POST http://localhost:8080/api/public/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customerSessionToken": "a7f3d2e1-4c6b-9f2e-1a3b-5c7d9e0f2a4b",
    "items": [{
      "menuItemPublicId": "item-123",
      "quantity": 1
    }]
  }'
```

### Component Test
```bash
# 1. Start frontend
cd sellia-app
npm start

# 2. Navigate to public menu
http://localhost:4200/qr/a7f3d2e1-4c6b-9f2e-1a3b-5c7d9e0f2a4b

# 3. Test interactions
- Add items to cart
- Change quantities
- Submit order
- Verify success message
```

### VIP Access Test
```bash
# 1. Create Standard table with items
curl http://localhost:8080/api/public/menu/standard-table-token
# Should see: STANDARD, MENU_DU_JOUR items

# 2. Create VIP table with items
curl http://localhost:8080/api/public/menu/vip-table-token
# Should see: VIP, MENU_DU_JOUR items

# 3. Try to access VIP item from standard table
curl -X POST http://localhost:8080/api/public/orders \
  -d '{
    "customerSessionToken": "standard-table-token",
    "items": [{"menuItemPublicId": "vip-item", "quantity": 1}]
  }'
# Should return: 400 "VIP items not available for standard tables"
```

## Deployment Checklist

- [ ] Database migrations applied
- [ ] RestaurantTable schema updated (qrCodeToken field)
- [ ] MenuType enum includes MENU_DU_JOUR
- [ ] Backend compiled and deployed
- [ ] Frontend compiled and deployed
- [ ] QR code token generation configured
- [ ] Test QR code created for table
- [ ] Menu items created and marked available
- [ ] VIP/Standard table flags set correctly
- [ ] Test order submitted and appears in kitchen
- [ ] Verify order links to correct table in reports

## Production Monitoring

### Metrics to Track
- QR scans per day
- Orders via QR vs traditional
- Average order value from QR
- Completion rate (scan → order)
- Error rate on public endpoints

### Logs to Monitor
```
[PUBLIC API] GET /api/public/menu/{token} - 200 OK
[PUBLIC API] POST /api/public/orders - 201 Created
[ERROR] Invalid QR token: xyz
[ERROR] VIP access denied for standard table
```

## Future Enhancements

- [ ] Real-time order status updates (WebSocket)
- [ ] QR code expiry management
- [ ] Multi-language support (FR/EN/ES)
- [ ] Restaurant logo/branding on menu
- [ ] Loyalty points display
- [ ] Dietary restrictions filter
- [ ] Allergen warnings
- [ ] Table-specific discounts
- [ ] Upsell recommendations
- [ ] Payment via QR code (cash on delivery)
- [ ] Order modifications after submission
- [ ] Table-sharing (split bill) functionality

## Troubleshooting

### QR Code Not Working
1. Check token format (should be UUID)
2. Verify table exists with that token
3. Check table `isVip` flag is set correctly
4. Verify menu items exist and are marked active

### Menu Not Displaying
1. Check network tab for API response
2. Verify `/api/public/menu/{token}` returns data
3. Check menu items are marked `available: true`
4. Verify menu type matches table type

### Order Submission Failing
1. Check cart has valid items
2. Verify all items are still available
3. Check customer session token is correct
4. Review server logs for validation errors

### Wrong Menu Showing
1. Check table `isVip` flag
2. Verify menu items are assigned correct MenuType
3. Check server-side validation in PublicMenuService
4. Restart backend if needed

## Support

For issues or questions about QR code ordering:
1. Check logs in `/var/log/sellia/` on server
2. Review server response in browser DevTools
3. Contact development team with error details
