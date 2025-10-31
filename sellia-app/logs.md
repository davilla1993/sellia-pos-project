
X [ERROR] TS7006: Parameter 'err' implicitly has an 'any' type. [plugin angular-compiler]

    src/app/features/admin/users/user-form/user-form.component.ts:128:16:
      128 │         error: (err) => this.handleError(err)
          ╵                 ~~~


X [ERROR] TS2307: Cannot find module '../../../core/services/api.service' or its corresponding type declarations. [plugin angular-compiler]

    src/app/features/admin/users/user-list/users-list.component.ts:4:27:
      4 │ import { ApiService } from '../../../core/services/api.service';
        ╵                            ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


X [ERROR] TS2571: Object is of type 'unknown'. [plugin angular-compiler]

    src/app/features/admin/users/user-list/users-list.component.ts:30:4:
      30 │     this.apiService.getUsers(0, 50).subscribe({
         ╵     ~~~~~~~~~~~~~~~


X [ERROR] TS7006: Parameter 'data' implicitly has an 'any' type. [plugin angular-compiler]

    src/app/features/admin/users/user-list/users-list.component.ts:31:13:
      31 │       next: (data) => {
         ╵              ~~~~


X [ERROR] TS7006: Parameter 'err' implicitly has an 'any' type. [plugin angular-compiler]

    src/app/features/admin/users/user-list/users-list.component.ts:35:14:
      35 │       error: (err) => {
         ╵               ~~~


X [ERROR] TS2571: Object is of type 'unknown'. [plugin angular-compiler]

    src/app/features/admin/users/user-list/users-list.component.ts:44:6:
      44 │       this.apiService.deactivateUser(publicId).subscribe({
         ╵       ~~~~~~~~~~~~~~~


X [ERROR] TS2571: Object is of type 'unknown'. [plugin angular-compiler]

    src/app/features/admin/users/user-list/users-list.component.ts:53:6:
      53 │       this.apiService.activateUser(publicId).subscribe({
         ╵       ~~~~~~~~~~~~~~~


X [ERROR] TS2307: Cannot find module '../../core/services/auth.service' or its corresponding type declarations. [plugin angular-compiler]

    src/app/features/auth/login/login.component.ts:5:28:
      5 │ import { AuthService } from '../../core/services/auth.service';
        ╵                             ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


X [ERROR] NG2003: No suitable injection token for parameter 'authService' of class 'LoginComponent'.
  Consider using the @Inject decorator to specify an injection token. [plugin angular-compiler]

    src/app/features/auth/login/login.component.ts:22:12:
      22 │     private authService: AuthService,
         ╵             ~~~~~~~~~~~

  This type does not have a value, so it cannot be used as injection token.

    src/app/features/auth/login/login.component.ts:22:25:
      22 │     private authService: AuthService,
         ╵                          ~~~~~~~~~~~


X [ERROR] TS7006: Parameter 'response' implicitly has an 'any' type. [plugin angular-compiler]

    src/app/features/auth/login/login.component.ts:45:13:
      45 │       next: (response) => {
         ╵              ~~~~~~~~


X [ERROR] TS7006: Parameter 'err' implicitly has an 'any' type. [plugin angular-compiler]

    src/app/features/auth/login/login.component.ts:57:14:
      57 │       error: (err) => {
         ╵               ~~~


X [ERROR] TS2307: Cannot find module '../../core/services/api.service' or its corresponding type declarations. [plugin angular-compiler]

    src/app/features/customer/checkout/checkout.component.ts:5:27:
      5 │ import { ApiService } from '../../core/services/api.service';
        ╵                            ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


X [ERROR] TS2307: Cannot find module '../../shared/models/types' or its corresponding type declarations. [plugin angular-compiler]

    src/app/features/customer/checkout/checkout.component.ts:6:22:
      6 │ import { Order } from '../../shared/models/types';
        ╵                       ~~~~~~~~~~~~~~~~~~~~~~~~~~~


X [ERROR] NG2003: No suitable injection token for parameter 'apiService' of class 'CheckoutComponent'.
  Consider using the @Inject decorator to specify an injection token. [plugin angular-compiler]

    src/app/features/customer/checkout/checkout.component.ts:27:12:
      27 │     private apiService: ApiService,
         ╵             ~~~~~~~~~~

  This type does not have a value, so it cannot be used as injection token.

    src/app/features/customer/checkout/checkout.component.ts:27:24:
      27 │     private apiService: ApiService,
         ╵                         ~~~~~~~~~~


X [ERROR] TS7006: Parameter 'createdOrder' implicitly has an 'any' type. [plugin angular-compiler]

    src/app/features/customer/checkout/checkout.component.ts:61:13:
      61 │       next: (createdOrder) => {
         ╵              ~~~~~~~~~~~~


X [ERROR] TS7006: Parameter 'err' implicitly has an 'any' type. [plugin angular-compiler]

    src/app/features/customer/checkout/checkout.component.ts:65:14:
      65 │       error: (err) => {
         ╵               ~~~


X [ERROR] TS2307: Cannot find module '../../shared/components/audio-notification-control.component' or its corresponding type declarations. [plugin angular-compiler]

    src/app/features/pos/cashier-layout/cashier-layout.component.ts:4:50:
      4 │ ...ent } from '../../shared/components/audio-notification-control.c...
        ╵               ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


X [ERROR] TS2307: Cannot find module '../../core/services/order-notification.service' or its corresponding type declarations. [plugin angular-compiler]

    src/app/features/pos/cashier-layout/cashier-layout.component.ts:5:41:
      5 │ ...ionService } from '../../core/services/order-notification.service';
        ╵                      ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


X [ERROR] NG1010: 'imports' must be an array of components, directives, pipes, or NgModules.
  Value could not be determined statically. [plugin angular-compiler]

    src/app/features/pos/cashier-layout/cashier-layout.component.ts:10:40:
      10 │ ...: [CommonModule, RouterOutlet, AudioNotificationControlComponent],
         ╵                                   ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  Unknown reference.

    src/app/features/pos/cashier-layout/cashier-layout.component.ts:10:40:
      10 │ ...: [CommonModule, RouterOutlet, AudioNotificationControlComponent],
         ╵                                   ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


X [ERROR] TS2571: Object is of type 'unknown'. [plugin angular-compiler]

    src/app/features/pos/cashier-layout/cashier-layout.component.ts:19:4:
      19 │     this.orderNotificationService.startMonitoring();
         ╵     ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


X [ERROR] TS2571: Object is of type 'unknown'. [plugin angular-compiler]

    src/app/features/pos/cashier-layout/cashier-layout.component.ts:23:4:
      23 │     this.orderNotificationService.stopMonitoring();
         ╵     ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


X [ERROR] TS2571: Object is of type 'unknown'. [plugin angular-compiler]

    src/app/features/pos/checkout/checkout.component.html:108:41:
      108 │ ...  <span>{{ currencyService.formatPrice(item.totalPrice) }}</span>
          ╵                               ~~~~~~~~~~~

  Error occurs in the template of component CheckoutComponent.

    src/app/features/pos/checkout/checkout.component.ts:11:15:
      11 │   templateUrl: './checkout.component.html',
         ╵                ~~~~~~~~~~~~~~~~~~~~~~~~~~~


X [ERROR] TS2571: Object is of type 'unknown'. [plugin angular-compiler]

    src/app/features/pos/checkout/checkout.component.html:112:62:
      112 │ ...imary">{{ currencyService.formatPrice(order.totalAmount) }}</s...
          ╵                              ~~~~~~~~~~~

  Error occurs in the template of component CheckoutComponent.

    src/app/features/pos/checkout/checkout.component.ts:11:15:
      11 │   templateUrl: './checkout.component.html',
         ╵                ~~~~~~~~~~~~~~~~~~~~~~~~~~~


X [ERROR] TS2571: Object is of type 'unknown'. [plugin angular-compiler]

    src/app/features/pos/checkout/checkout.component.html:132:39:
      132 │ ...   <span>{{ currencyService.formatPrice(sessionTotal()) }}</span>
          ╵                                ~~~~~~~~~~~

  Error occurs in the template of component CheckoutComponent.

    src/app/features/pos/checkout/checkout.component.ts:11:15:
      11 │   templateUrl: './checkout.component.html',
         ╵                ~~~~~~~~~~~~~~~~~~~~~~~~~~~


X [ERROR] TS2571: Object is of type 'unknown'. [plugin angular-compiler]

    src/app/features/pos/checkout/checkout.component.html:136:64:
      136 │ ...-400">-{{ currencyService.formatPrice(discountAmount()) }}</span>
          ╵                              ~~~~~~~~~~~

  Error occurs in the template of component CheckoutComponent.

    src/app/features/pos/checkout/checkout.component.ts:11:15:
      11 │   templateUrl: './checkout.component.html',
         ╵                ~~~~~~~~~~~~~~~~~~~~~~~~~~~


X [ERROR] TS2571: Object is of type 'unknown'. [plugin angular-compiler]

    src/app/features/pos/checkout/checkout.component.html:140:79:
      140 │ ...t-primary">{{ currencyService.formatPrice(finalTotal()) }}</span>
          ╵                                  ~~~~~~~~~~~

  Error occurs in the template of component CheckoutComponent.

    src/app/features/pos/checkout/checkout.component.ts:11:15:
      11 │   templateUrl: './checkout.component.html',
         ╵                ~~~~~~~~~~~~~~~~~~~~~~~~~~~


X [ERROR] TS2571: Object is of type 'unknown'. [plugin angular-compiler]

    src/app/features/pos/checkout/checkout.component.html:153:37:
      153 │                   {{ currencyService.formatPrice(changeAmount()) }}
          ╵                                      ~~~~~~~~~~~

  Error occurs in the template of component CheckoutComponent.

    src/app/features/pos/checkout/checkout.component.ts:11:15:
      11 │   templateUrl: './checkout.component.html',
         ╵                ~~~~~~~~~~~~~~~~~~~~~~~~~~~


X [ERROR] TS2571: Object is of type 'unknown'. [plugin angular-compiler]

    src/app/features/pos/checkout/checkout.component.html:157:63:
      157 │ ...manque {{ currencyService.formatPrice(finalTotal() - amountPai...
          ╵                              ~~~~~~~~~~~

  Error occurs in the template of component CheckoutComponent.

    src/app/features/pos/checkout/checkout.component.ts:11:15:
      11 │   templateUrl: './checkout.component.html',
         ╵                ~~~~~~~~~~~~~~~~~~~~~~~~~~~


X [ERROR] TS2571: Object is of type 'unknown'. [plugin angular-compiler]

    src/app/features/pos/checkout/checkout.component.html:206:41:
      206 │ ...  <span>{{ currencyService.formatPrice(item.totalPrice) }}</span>
          ╵                               ~~~~~~~~~~~

  Error occurs in the template of component CheckoutComponent.

    src/app/features/pos/checkout/checkout.component.ts:11:15:
      11 │   templateUrl: './checkout.component.html',
         ╵                ~~~~~~~~~~~~~~~~~~~~~~~~~~~


X [ERROR] TS2571: Object is of type 'unknown'. [plugin angular-compiler]

    src/app/features/pos/checkout/checkout.component.html:214:39:
      214 │ ...   <span>{{ currencyService.formatPrice(sessionTotal()) }}</span>
          ╵                                ~~~~~~~~~~~

  Error occurs in the template of component CheckoutComponent.

    src/app/features/pos/checkout/checkout.component.ts:11:15:
      11 │   templateUrl: './checkout.component.html',
         ╵                ~~~~~~~~~~~~~~~~~~~~~~~~~~~


X [ERROR] TS2571: Object is of type 'unknown'. [plugin angular-compiler]

    src/app/features/pos/checkout/checkout.component.html:218:40:
      218 │ ...<span>-{{ currencyService.formatPrice(discountAmount()) }}</span>
          ╵                              ~~~~~~~~~~~

  Error occurs in the template of component CheckoutComponent.

    src/app/features/pos/checkout/checkout.component.ts:11:15:
      11 │   templateUrl: './checkout.component.html',
         ╵                ~~~~~~~~~~~~~~~~~~~~~~~~~~~


X [ERROR] TS2571: Object is of type 'unknown'. [plugin angular-compiler]

    src/app/features/pos/checkout/checkout.component.html:222:39:
      222 │ ...     <span>{{ currencyService.formatPrice(finalTotal()) }}</span>
          ╵                                  ~~~~~~~~~~~

  Error occurs in the template of component CheckoutComponent.

    src/app/features/pos/checkout/checkout.component.ts:11:15:
      11 │   templateUrl: './checkout.component.html',
         ╵                ~~~~~~~~~~~~~~~~~~~~~~~~~~~


X [ERROR] TS2571: Object is of type 'unknown'. [plugin angular-compiler]

    src/app/features/pos/checkout/checkout.component.html:227:49:
      227 │ ...ontant remis: {{ currencyService.formatPrice(amountPaid()) }}</p>
          ╵                                     ~~~~~~~~~~~

  Error occurs in the template of component CheckoutComponent.

    src/app/features/pos/checkout/checkout.component.ts:11:15:
      11 │   templateUrl: './checkout.component.html',
         ╵                ~~~~~~~~~~~~~~~~~~~~~~~~~~~


X [ERROR] TS2571: Object is of type 'unknown'. [plugin angular-compiler]

    src/app/features/pos/checkout/checkout.component.html:228:41:
      228 │ ...  <p>Rendu: {{ currencyService.formatPrice(changeAmount()) }}</p>
          ╵                                   ~~~~~~~~~~~

  Error occurs in the template of component CheckoutComponent.

    src/app/features/pos/checkout/checkout.component.ts:11:15:
      11 │   templateUrl: './checkout.component.html',
         ╵                ~~~~~~~~~~~~~~~~~~~~~~~~~~~


X [ERROR] TS2307: Cannot find module '../../core/services/api.service' or its corresponding type declarations. [plugin angular-compiler]

    src/app/features/pos/checkout/checkout.component.ts:4:27:
      4 │ import { ApiService } from '../../core/services/api.service';
        ╵                            ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


X [ERROR] TS2307: Cannot find module '../../shared/services/currency.service' or its corresponding type declarations. [plugin angular-compiler]

    src/app/features/pos/checkout/checkout.component.ts:5:32:
      5 │ ... { CurrencyService } from '../../shared/services/currency.service';
        ╵                              ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


X [ERROR] TS2571: Object is of type 'unknown'. [plugin angular-compiler]

    src/app/features/pos/checkout/checkout.component.ts:58:4:
      58 │     this.apiService.getRestaurant().subscribe({
         ╵     ~~~~~~~~~~~~~~~


X [ERROR] TS7006: Parameter 'err' implicitly has an 'any' type. [plugin angular-compiler]

    src/app/features/pos/checkout/checkout.component.ts:68:14:
      68 │       error: (err) => {
         ╵               ~~~


X [ERROR] TS2571: Object is of type 'unknown'. [plugin angular-compiler]

    src/app/features/pos/checkout/checkout.component.ts:84:4:
      84 │     this.apiService.getTables().subscribe({
         ╵     ~~~~~~~~~~~~~~~


X [ERROR] TS7006: Parameter 'response' implicitly has an 'any' type. [plugin angular-compiler]

    src/app/features/pos/checkout/checkout.component.ts:85:13:
      85 │       next: (response) => {
         ╵              ~~~~~~~~


X [ERROR] TS2571: Object is of type 'unknown'. [plugin angular-compiler]

    src/app/features/pos/checkout/checkout.component.ts:95:10:
      95 │           this.apiService.getActiveSessionByTable(table.publicId)....
         ╵           ~~~~~~~~~~~~~~~


X [ERROR] TS7006: Parameter 'err' implicitly has an 'any' type. [plugin angular-compiler]

    src/app/features/pos/checkout/checkout.component.ts:116:14:
      116 │       error: (err) => {
          ╵               ~~~


X [ERROR] TS2571: Object is of type 'unknown'. [plugin angular-compiler]

    src/app/features/pos/checkout/checkout.component.ts:139:4:
      139 │     this.apiService.getActiveSessionByTable(tablePublicId).subscr...
          ╵     ~~~~~~~~~~~~~~~


X [ERROR] TS7006: Parameter 'session' implicitly has an 'any' type. [plugin angular-compiler]

    src/app/features/pos/checkout/checkout.component.ts:140:13:
      140 │       next: (session) => {
          ╵              ~~~~~~~


X [ERROR] TS7006: Parameter 'err' implicitly has an 'any' type. [plugin angular-compiler]

    src/app/features/pos/checkout/checkout.component.ts:144:14:
      144 │       error: (err) => {
          ╵               ~~~


X [ERROR] TS2571: Object is of type 'unknown'. [plugin angular-compiler]

    src/app/features/pos/checkout/checkout.component.ts:152:4:
      152 │     this.apiService.getSessionOrders(sessionPublicId).subscribe({
          ╵     ~~~~~~~~~~~~~~~


X [ERROR] TS2571: Object is of type 'unknown'. [plugin angular-compiler]

    src/app/features/pos/checkout/checkout.component.ts:205:4:
      205 │     this.apiService.checkoutSession(this.selectedSession().public...
          ╵     ~~~~~~~~~~~~~~~


X [ERROR] TS2571: Object is of type 'unknown'. [plugin angular-compiler]

    src/app/features/pos/checkout/checkout.component.ts:215:8:
      215 │         this.apiService.finalizeSession(this.selectedSession().pu...
          ╵         ~~~~~~~~~~~~~~~


X [ERROR] TS7006: Parameter 'error' implicitly has an 'any' type. [plugin angular-compiler]

    src/app/features/pos/checkout/checkout.component.ts:227:14:
      227 │       error: (error) => {
          ╵               ~~~~~


X [ERROR] TS2571: Object is of type 'unknown'. [plugin angular-compiler]

    src/app/features/pos/checkout/checkout.component.ts:286:28:
      286 │ ...             <span>${this.currencyService.formatPrice(item.tot...
          ╵                         ~~~~~~~~~~~~~~~~~~~~


X [ERROR] TS2571: Object is of type 'unknown'. [plugin angular-compiler]

    src/app/features/pos/checkout/checkout.component.ts:295:24:
      295 │                 <span>${this.currencyService.formatPrice(this.ses...
          ╵                         ~~~~~~~~~~~~~~~~~~~~


X [ERROR] TS2571: Object is of type 'unknown'. [plugin angular-compiler]

    src/app/features/pos/checkout/checkout.component.ts:300:27:
      300 │ ...            <span>-${this.currencyService.formatPrice(this.dis...
          ╵                         ~~~~~~~~~~~~~~~~~~~~


X [ERROR] TS2571: Object is of type 'unknown'. [plugin angular-compiler]

    src/app/features/pos/checkout/checkout.component.ts:305:24:
      305 │                 <span>${this.currencyService.formatPrice(this.fin...
          ╵                         ~~~~~~~~~~~~~~~~~~~~


X [ERROR] TS2571: Object is of type 'unknown'. [plugin angular-compiler]

    src/app/features/pos/checkout/checkout.component.ts:312:24:
      312 │                 <span>${this.currencyService.formatPrice(this.amo...
          ╵                         ~~~~~~~~~~~~~~~~~~~~


X [ERROR] TS2571: Object is of type 'unknown'. [plugin angular-compiler]

    src/app/features/pos/checkout/checkout.component.ts:316:24:
      316 │                 <span>${this.currencyService.formatPrice(this.cha...
          ╵                         ~~~~~~~~~~~~~~~~~~~~


X [ERROR] TS2571: Object is of type 'unknown'. [plugin angular-compiler]

    src/app/features/pos/checkout/checkout.component.ts:356:46:
      356 │ ...r et Imprimer Reçu - ${this.currencyService.formatPrice(this....
          ╵                        ~~~~~~~~~~~~~~~~~~~~


X [ERROR] TS2571: Object is of type 'unknown'. [plugin angular-compiler]

    src/app/features/pos/checkout/checkout.component.ts:395:4:
      395 │     this.apiService.generateTableQrCode(table.publicId).subscribe({
          ╵     ~~~~~~~~~~~~~~~


X [ERROR] TS7006: Parameter 'response' implicitly has an 'any' type. [plugin angular-compiler]

    src/app/features/pos/checkout/checkout.component.ts:396:13:
      396 │       next: (response) => {
          ╵              ~~~~~~~~


X [ERROR] TS7006: Parameter 'err' implicitly has an 'any' type. [plugin angular-compiler]

    src/app/features/pos/checkout/checkout.component.ts:405:14:
      405 │       error: (err) => {
          ╵               ~~~


X [ERROR] TS2307: Cannot find module '../../shared/components/audio-notification-control.component' or its corresponding type declarations. [plugin angular-compiler]

    src/app/features/pos/kitchen-layout/kitchen-layout.component.ts:4:50:
      4 │ ...ent } from '../../shared/components/audio-notification-control.c...
        ╵               ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


X [ERROR] TS2307: Cannot find module '../../core/services/order-notification.service' or its corresponding type declarations. [plugin angular-compiler]

    src/app/features/pos/kitchen-layout/kitchen-layout.component.ts:5:41:
      5 │ ...ionService } from '../../core/services/order-notification.service';
        ╵                      ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


X [ERROR] NG1010: 'imports' must be an array of components, directives, pipes, or NgModules.
  Value could not be determined statically. [plugin angular-compiler]

    src/app/features/pos/kitchen-layout/kitchen-layout.component.ts:10:40:
      10 │ ...: [CommonModule, RouterOutlet, AudioNotificationControlComponent],
         ╵                                   ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  Unknown reference.

    src/app/features/pos/kitchen-layout/kitchen-layout.component.ts:10:40:
      10 │ ...: [CommonModule, RouterOutlet, AudioNotificationControlComponent],
         ╵                                   ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


X [ERROR] TS2571: Object is of type 'unknown'. [plugin angular-compiler]

    src/app/features/pos/kitchen-layout/kitchen-layout.component.ts:19:4:
      19 │     this.orderNotificationService.startMonitoring();
         ╵     ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


X [ERROR] TS2571: Object is of type 'unknown'. [plugin angular-compiler]

    src/app/features/pos/kitchen-layout/kitchen-layout.component.ts:23:4:
      23 │     this.orderNotificationService.stopMonitoring();
         ╵     ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


X [ERROR] TS2571: Object is of type 'unknown'. [plugin angular-compiler]

    src/app/features/pos/my-orders/my-orders.component.html:70:64:
      70 │ ...ral-400">{{ currencyService.formatPrice(item.totalPrice) }}</span>
         ╵                                ~~~~~~~~~~~

  Error occurs in the template of component MyOrdersComponent.

    src/app/features/pos/my-orders/my-orders.component.ts:11:15:
      11 │   templateUrl: './my-orders.component.html',
         ╵                ~~~~~~~~~~~~~~~~~~~~~~~~~~~~


X [ERROR] TS2571: Object is of type 'unknown'. [plugin angular-compiler]

    src/app/features/pos/my-orders/my-orders.component.html:77:76:
      77 │ ...imary">{{ currencyService.formatPrice(order.totalAmount) }}</span>
         ╵                              ~~~~~~~~~~~

  Error occurs in the template of component MyOrdersComponent.

    src/app/features/pos/my-orders/my-orders.component.ts:11:15:
      11 │   templateUrl: './my-orders.component.html',
         ╵                ~~~~~~~~~~~~~~~~~~~~~~~~~~~~


X [ERROR] TS2307: Cannot find module '../../core/services/api.service' or its corresponding type declarations. [plugin angular-compiler]

    src/app/features/pos/my-orders/my-orders.component.ts:4:27:
      4 │ import { ApiService } from '../../core/services/api.service';
        ╵                            ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


X [ERROR] TS2307: Cannot find module '../../shared/services/currency.service' or its corresponding type declarations. [plugin angular-compiler]

    src/app/features/pos/my-orders/my-orders.component.ts:5:32:
      5 │ ... { CurrencyService } from '../../shared/services/currency.service';
        ╵                              ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


X [ERROR] TS2571: Object is of type 'unknown'. [plugin angular-compiler]

    src/app/features/pos/my-orders/my-orders.component.ts:97:6:
      97 │       this.apiService.getOrdersByStatus(status).subscribe({
         ╵       ~~~~~~~~~~~~~~~


X [ERROR] TS2571: Object is of type 'unknown'. [plugin angular-compiler]

    src/app/features/pos/my-orders/my-orders.component.ts:115:4:
      115 │     this.apiService.updateOrderStatus(publicId, newStatus).subscr...
          ╵     ~~~~~~~~~~~~~~~


X [ERROR] TS2571: Object is of type 'unknown'. [plugin angular-compiler]

    src/app/features/pos/my-orders/my-orders.component.ts:143:4:
      143 │     this.apiService.updateOrderStatus(publicId, 'ANNULEE').subscr...
          ╵     ~~~~~~~~~~~~~~~


X [ERROR] TS2307: Cannot find module '../../core/services/api.service' or its corresponding type declarations. [plugin angular-compiler]

    src/app/features/pos/order-entry/order-entry.component.ts:5:27:
      5 │ import { ApiService } from '../../core/services/api.service';
        ╵                            ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


X [ERROR] TS2307: Cannot find module '../../shared/services/toast.service' or its corresponding type declarations. [plugin angular-compiler]

    src/app/features/pos/order-entry/order-entry.component.ts:6:29:
      6 │ import { ToastService } from '../../shared/services/toast.service';
        ╵                              ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


X [ERROR] TS2571: Object is of type 'unknown'. [plugin angular-compiler]

    src/app/features/pos/order-entry/order-entry.component.ts:54:4:
      54 │     this.apiService.getAvailableTables().subscribe({
         ╵     ~~~~~~~~~~~~~~~


X [ERROR] TS7006: Parameter 'tables' implicitly has an 'any' type. [plugin angular-compiler]

    src/app/features/pos/order-entry/order-entry.component.ts:55:13:
      55 │       next: (tables) => {
         ╵              ~~~~~~


X [ERROR] TS2571: Object is of type 'unknown'. [plugin angular-compiler]

    src/app/features/pos/order-entry/order-entry.component.ts:60:10:
      60 │           this.toast.warning('Aucune table disponible');
         ╵           ~~~~~~~~~~


X [ERROR] TS7006: Parameter 'err' implicitly has an 'any' type. [plugin angular-compiler]

    src/app/features/pos/order-entry/order-entry.component.ts:63:14:
      63 │       error: (err) => {
         ╵               ~~~


X [ERROR] TS2571: Object is of type 'unknown'. [plugin angular-compiler]

    src/app/features/pos/order-entry/order-entry.component.ts:65:8:
      65 │         this.toast.error('Impossible de charger les tables');
         ╵         ~~~~~~~~~~


X [ERROR] TS2571: Object is of type 'unknown'. [plugin angular-compiler]

    src/app/features/pos/order-entry/order-entry.component.ts:76:4:
      76 │     this.apiService.getAllMenus(0, 100).subscribe({
         ╵     ~~~~~~~~~~~~~~~


X [ERROR] TS7006: Parameter 'menus' implicitly has an 'any' type. [plugin angular-compiler]

    src/app/features/pos/order-entry/order-entry.component.ts:77:13:
      77 │       next: (menus) => {
         ╵              ~~~~~


X [ERROR] TS2571: Object is of type 'unknown'. [plugin angular-compiler]

    src/app/features/pos/order-entry/order-entry.component.ts:100:10:
      100 │           this.toast.warning('Aucun menu disponible');
          ╵           ~~~~~~~~~~


X [ERROR] TS7006: Parameter 'err' implicitly has an 'any' type. [plugin angular-compiler]

    src/app/features/pos/order-entry/order-entry.component.ts:103:14:
      103 │       error: (err) => {
          ╵               ~~~


X [ERROR] TS2571: Object is of type 'unknown'. [plugin angular-compiler]

    src/app/features/pos/order-entry/order-entry.component.ts:105:8:
      105 │         this.toast.error('Impossible de charger les menus');
          ╵         ~~~~~~~~~~


X [ERROR] TS2571: Object is of type 'unknown'. [plugin angular-compiler]

    src/app/features/pos/order-entry/order-entry.component.ts:113:4:
      113 │     this.apiService.getProducts().subscribe({
          ╵     ~~~~~~~~~~~~~~~


X [ERROR] TS7006: Parameter 'products' implicitly has an 'any' type. [plugin angular-compiler]

    src/app/features/pos/order-entry/order-entry.component.ts:114:13:
      114 │       next: (products) => {
          ╵              ~~~~~~~~


X [ERROR] TS2571: Object is of type 'unknown'. [plugin angular-compiler]

    src/app/features/pos/order-entry/order-entry.component.ts:121:10:
      121 │           this.toast.warning('Aucun produit disponible');
          ╵           ~~~~~~~~~~


X [ERROR] TS7006: Parameter 'err' implicitly has an 'any' type. [plugin angular-compiler]

    src/app/features/pos/order-entry/order-entry.component.ts:124:14:
      124 │       error: (err) => {
          ╵               ~~~


X [ERROR] TS2571: Object is of type 'unknown'. [plugin angular-compiler]

    src/app/features/pos/order-entry/order-entry.component.ts:126:8:
      126 │         this.toast.error('Impossible de charger les produits');
          ╵         ~~~~~~~~~~


X [ERROR] TS2571: Object is of type 'unknown'. [plugin angular-compiler]

    src/app/features/pos/order-entry/order-entry.component.ts:136:8:
      136 │         this.apiService.getImageAsDataUrl(menu.imageUrl).subscribe({
          ╵         ~~~~~~~~~~~~~~~


X [ERROR] TS7006: Parameter 'url' implicitly has an 'any' type. [plugin angular-compiler]

    src/app/features/pos/order-entry/order-entry.component.ts:137:17:
      137 │           next: (url) => {
          ╵                  ~~~


X [ERROR] TS2571: Object is of type 'unknown'. [plugin angular-compiler]

    src/app/features/pos/order-entry/order-entry.component.ts:154:4:
      154 │     this.apiService.getCategories().subscribe({
          ╵     ~~~~~~~~~~~~~~~


X [ERROR] TS7006: Parameter 'categories' implicitly has an 'any' type. [plugin angular-compiler]

    src/app/features/pos/order-entry/order-entry.component.ts:155:13:
      155 │       next: (categories) => {
          ╵              ~~~~~~~~~~


X [ERROR] TS7006: Parameter 'err' implicitly has an 'any' type. [plugin angular-compiler]

    src/app/features/pos/order-entry/order-entry.component.ts:160:14:
      160 │       error: (err) => {
          ╵               ~~~


X [ERROR] TS2571: Object is of type 'unknown'. [plugin angular-compiler]

    src/app/features/pos/order-entry/order-entry.component.ts:162:8:
      162 │         this.toast.error('Impossible de charger les catégories');
          ╵         ~~~~~~~~~~


X [ERROR] TS2571: Object is of type 'unknown'. [plugin angular-compiler]

    src/app/features/pos/order-entry/order-entry.component.ts:209:4:
      209 │     this.toast.info(`${product.name} ajouté au panier`, 2000);
          ╵     ~~~~~~~~~~


X [ERROR] TS2571: Object is of type 'unknown'. [plugin angular-compiler]

    src/app/features/pos/order-entry/order-entry.component.ts:237:6:
      237 │       this.toast.warning('Veuillez remplir tous les champs requis');
          ╵       ~~~~~~~~~~


X [ERROR] TS2571: Object is of type 'unknown'. [plugin angular-compiler]

    src/app/features/pos/order-entry/order-entry.component.ts:254:4:
      254 │     this.apiService.createCustomerSession(sessionRequest).subscri...
          ╵     ~~~~~~~~~~~~~~~


X [ERROR] TS7006: Parameter 'session' implicitly has an 'any' type. [plugin angular-compiler]

    src/app/features/pos/order-entry/order-entry.component.ts:255:13:
      255 │       next: (session) => {
          ╵              ~~~~~~~


X [ERROR] TS2571: Object is of type 'unknown'. [plugin angular-compiler]

    src/app/features/pos/order-entry/order-entry.component.ts:287:8:
      287 │         this.apiService.createOrder(orderRequest).subscribe({
          ╵         ~~~~~~~~~~~~~~~


X [ERROR] TS2571: Object is of type 'unknown'. [plugin angular-compiler]

    src/app/features/pos/order-entry/order-entry.component.ts:290:12:
      290 │             this.toast.success('✓ Commande enregistrée avec su...
          ╵             ~~~~~~~~~~


X [ERROR] TS7006: Parameter 'err' implicitly has an 'any' type. [plugin angular-compiler]

    src/app/features/pos/order-entry/order-entry.component.ts:300:18:
      300 │           error: (err) => {
          ╵                   ~~~


X [ERROR] TS2571: Object is of type 'unknown'. [plugin angular-compiler]

    src/app/features/pos/order-entry/order-entry.component.ts:304:12:
      304 │             this.toast.error(errorMsg);
          ╵             ~~~~~~~~~~


X [ERROR] TS7006: Parameter 'err' implicitly has an 'any' type. [plugin angular-compiler]

    src/app/features/pos/order-entry/order-entry.component.ts:308:14:
      308 │       error: (err) => {
          ╵               ~~~


X [ERROR] TS2571: Object is of type 'unknown'. [plugin angular-compiler]

    src/app/features/pos/order-entry/order-entry.component.ts:312:8:
      312 │         this.toast.error(errorMsg);
          ╵         ~~~~~~~~~~


X [ERROR] TS2571: Object is of type 'unknown'. [plugin angular-compiler]

    src/app/features/pos/pending-orders/pending-orders.component.html:51:76:
      51 │ ...imary">{{ currencyService.formatPrice(order.totalAmount) }}</span>
         ╵                              ~~~~~~~~~~~

  Error occurs in the template of component PendingOrdersComponent.

    src/app/features/pos/pending-orders/pending-orders.component.ts:10:15:
      10 │   templateUrl: './pending-orders.component.html',
         ╵                ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


X [ERROR] TS2307: Cannot find module '../../core/services/api.service' or its corresponding type declarations. [plugin angular-compiler]

    src/app/features/pos/pending-orders/pending-orders.component.ts:3:27:
      3 │ import { ApiService } from '../../core/services/api.service';
        ╵                            ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


X [ERROR] TS2307: Cannot find module '../../shared/services/currency.service' or its corresponding type declarations. [plugin angular-compiler]

    src/app/features/pos/pending-orders/pending-orders.component.ts:4:32:
      4 │ ... { CurrencyService } from '../../shared/services/currency.service';
        ╵                              ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


X [ERROR] TS2571: Object is of type 'unknown'. [plugin angular-compiler]

    src/app/features/pos/pending-orders/pending-orders.component.ts:32:4:
      32 │     this.apiService.getOrdersByStatus('EN_ATTENTE').subscribe({
         ╵     ~~~~~~~~~~~~~~~


X [ERROR] TS7006: Parameter 'err' implicitly has an 'any' type. [plugin angular-compiler]

    src/app/features/pos/pending-orders/pending-orders.component.ts:39:14:
      39 │       error: (err) => {
         ╵               ~~~


X [ERROR] TS2571: Object is of type 'unknown'. [plugin angular-compiler]

    src/app/features/pos/pending-orders/pending-orders.component.ts:50:4:
      50 │     this.apiService.updateOrderStatus(publicId, 'ACCEPTEE').subscr...
         ╵     ~~~~~~~~~~~~~~~


X [ERROR] TS7006: Parameter 'err' implicitly has an 'any' type. [plugin angular-compiler]

    src/app/features/pos/pending-orders/pending-orders.component.ts:55:14:
      55 │       error: (err) => {
         ╵               ~~~


X [ERROR] TS2571: Object is of type 'unknown'. [plugin angular-compiler]

    src/app/shared/components/admin-header/admin-header.component.html:9:33:
      9 │         *ngIf="navigationService.isAdmin()"
        ╵                                  ~~~~~~~

  Error occurs in the template of component AdminHeaderComponent.

    src/app/shared/components/admin-header/admin-header.component.ts:10:15:
      10 │   templateUrl: './admin-header.component.html',
         ╵                ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


X [ERROR] TS2307: Cannot find module '../../core/services/navigation.service' or its corresponding type declarations. [plugin angular-compiler]

    src/app/shared/components/admin-header/admin-header.component.ts:4:34:
      4 │ ... NavigationService } from '../../core/services/navigation.service';
        ╵                              ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


X [ERROR] NG2008: Could not find stylesheet file './navbar-simple.component.css'. [plugin angular-compiler]

    src/app/shared/components/navbar-simple/navbar-simple.component.ts:10:14:
      10 │   styleUrls: ['./navbar-simple.component.css']
         ╵               ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


X [ERROR] Could not resolve "./features/auth/login.component"

    src/app/app.routes.ts:2:31:
      2 │ import { LoginComponent } from './features/auth/login.component';
        ╵                                ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


X [ERROR] Could not resolve "./features/pos/order-entry.component"

    src/app/app.routes.ts:13:36:
      13 │ ...OrderEntryComponent } from './features/pos/order-entry.component';
         ╵                               ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


X [ERROR] Could not resolve "./features/pos/pending-orders.component"

    src/app/app.routes.ts:16:39:
      16 │ ...gOrdersComponent } from './features/pos/pending-orders.component';
         ╵                            ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


X [ERROR] Could not resolve "./features/pos/my-orders.component"

    src/app/app.routes.ts:17:34:
      17 │ ...t { MyOrdersComponent } from './features/pos/my-orders.component';
         ╵                                 ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


X [ERROR] Could not resolve "./features/pos/checkout.component"

    src/app/app.routes.ts:18:34:
      18 │ ...rt { CheckoutComponent } from './features/pos/checkout.component';
         ╵                                  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


X [ERROR] Could not resolve "../../core/services/auth.service"

    src/app/features/admin/admin-navbar/admin-navbar.component.ts:4:28:
      4 │ import { AuthService } from '../../core/services/auth.service';
        ╵                             ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


X [ERROR] Could not resolve "../../core/services/theme.service"

    src/app/features/admin/admin-navbar/admin-navbar.component.ts:5:29:
      5 │ import { ThemeService } from '../../core/services/theme.service';
        ╵                              ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


X [ERROR] Could not resolve "../../../core/services/api.service"

    src/app/features/admin/cashiers/cashier-assignment/cashier-assignment.component.ts:4:27:
      4 │ import { ApiService } from '../../../core/services/api.service';
        ╵                            ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


X [ERROR] Could not resolve "../../../core/services/api.service"

    src/app/features/admin/users/user-form/user-form.component.ts:5:27:
      5 │ import { ApiService } from '../../../core/services/api.service';
        ╵                            ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


X [ERROR] Could not resolve "../../../core/validators/password.validator"

    src/app/features/admin/users/user-form/user-form.component.ts:6:34:
      6 │ ...wordValidator } from '../../../core/validators/password.validator';
        ╵                         ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


X [ERROR] Could not resolve "../../../core/validators/phone.validator"

    src/app/features/admin/users/user-form/user-form.component.ts:7:31:
      7 │ ...{ PhoneValidator } from '../../../core/validators/phone.validator';
        ╵                            ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


X [ERROR] Could not resolve "../../../core/utils/text-transform"

    src/app/features/admin/users/user-form/user-form.component.ts:8:30:
      8 │ import { TextTransform } from '../../../core/utils/text-transform';
        ╵                               ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


X [ERROR] Could not resolve "../../../core/services/api.service"

    src/app/features/admin/users/user-list/users-list.component.ts:4:27:
      4 │ import { ApiService } from '../../../core/services/api.service';
        ╵                            ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


