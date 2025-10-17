

X [ERROR] NG1010: template must be a string
  Value could not be determined statically. [plugin angular-compiler]

    src/app/features/customer/checkout.component.ts:12:12:
      12 │   template: `
         ╵             ^

  Unable to evaluate this expression statically.

    src/app/features/customer/checkout.component.ts:32:58:
      32 │ ...d text-primary">${{ (item.price * item.quantity).toFixed(2) }}</p>
         ╵                      ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  Unable to evaluate an invalid expression.

    src/app/features/customer/checkout.component.ts:32:58:
      32 │ ..."font-semibold text-primary">${{ (item.price * item.quantity).t...
         ╵                                   ^


X [ERROR] TS2349: This expression is not callable.
  Type '{}' has no call signatures. [plugin angular-compiler]

    src/app/features/customer/checkout.component.ts:32:58:
      32 │ ..."font-semibold text-primary">${{ (item.price * item.quantity).t...
         ╵                                   ^


X [ERROR] TS1136: Property assignment expected. [plugin angular-compiler]

    src/app/features/customer/checkout.component.ts:32:60:
      32 │ ...ont-semibold text-primary">${{ (item.price * item.quantity).toF...
         ╵                                   ^


X [ERROR] TS2304: Cannot find name 'item'. [plugin angular-compiler]

    src/app/features/customer/checkout.component.ts:32:61:
      32 │ ...t-semibold text-primary">${{ (item.price * item.quantity).toFix...
         ╵                                  ~~~~


X [ERROR] TS2304: Cannot find name 'item'. [plugin angular-compiler]

    src/app/features/customer/checkout.component.ts:32:74:
      32 │ ...d text-primary">${{ (item.price * item.quantity).toFixed(2) }}</p>
         ╵                                      ~~~~


X [ERROR] TS1005: '{' expected. [plugin angular-compiler]

    src/app/features/customer/checkout.component.ts:58:36:
      58 │                 <span>${{ subtotal().toFixed(2) }}</span>
         ╵                                     ^


X [ERROR] TS1005: '{' expected. [plugin angular-compiler]

    src/app/features/customer/checkout.component.ts:62:31:
      62 │                 <span>${{ tax().toFixed(2) }}</span>
         ╵                                ^


X [ERROR] TS1005: '{' expected. [plugin angular-compiler]

    src/app/features/customer/checkout.component.ts:66:37:
      66 │                 <span>-${{ discount().toFixed(2) }}</span>
         ╵                                      ^


X [ERROR] TS1005: '{' expected. [plugin angular-compiler]

    src/app/features/customer/checkout.component.ts:72:52:
      72 │ ...       <span class="text-primary">${{ total().toFixed(2) }}</span>
         ╵                                                 ^


X [ERROR] NG1010: template must be a string
  Value could not be determined statically. [plugin angular-compiler]

    src/app/features/customer/order-tracking.component.ts:12:12:
      12 │   template: `
         ╵             ^

  Unable to evaluate this expression statically.

    src/app/features/customer/order-tracking.component.ts:77:55:
      77 │ ...ary font-bold">${{ (item.price * item.quantity).toFixed(2) }}</...
         ╵                     ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  Unable to evaluate an invalid expression.

    src/app/features/customer/order-tracking.component.ts:77:55:
      77 │ ...ass="text-primary font-bold">${{ (item.price * item.quantity).t...
         ╵                                   ^


X [ERROR] TS2349: This expression is not callable.
  Type '{}' has no call signatures. [plugin angular-compiler]

    src/app/features/customer/order-tracking.component.ts:77:55:
      77 │ ...ass="text-primary font-bold">${{ (item.price * item.quantity).t...
         ╵                                   ^


X [ERROR] TS1136: Property assignment expected. [plugin angular-compiler]

    src/app/features/customer/order-tracking.component.ts:77:57:
      77 │ ...s="text-primary font-bold">${{ (item.price * item.quantity).toF...
         ╵                                   ^


X [ERROR] TS2304: Cannot find name 'item'. [plugin angular-compiler]

    src/app/features/customer/order-tracking.component.ts:77:58:
      77 │ ..."text-primary font-bold">${{ (item.price * item.quantity).toFix...
         ╵                                  ~~~~


X [ERROR] TS2304: Cannot find name 'item'. [plugin angular-compiler]

    src/app/features/customer/order-tracking.component.ts:77:71:
      77 │ ...y font-bold">${{ (item.price * item.quantity).toFixed(2) }}</span>
         ╵                                   ~~~~


X [ERROR] TS1005: '{' expected. [plugin angular-compiler]

    src/app/features/customer/order-tracking.component.ts:115:52:
      115 │ ...lass="text-primary">${{ order()?.totalAmount.toFixed(2) }}</span>
          ╵                                   ~~


X [ERROR] TS18004: No value exists in scope for the shorthand property 'totalAmount'. Either declare one or provide an initializer. [plugin angular-compiler]

    src/app/features/customer/order-tracking.component.ts:115:54:
      115 │ ...lass="text-primary">${{ order()?.totalAmount.toFixed(2) }}</span>
          ╵                                     ~~~~~~~~~~~


X [ERROR] TS1005: ',' expected. [plugin angular-compiler]

    src/app/features/customer/order-tracking.component.ts:115:65:
      115 │ ...lass="text-primary">${{ order()?.totalAmount.toFixed(2) }}</span>
          ╵                                                ^


X [ERROR] TS2769: No overload matches this call.
  Overload 1 of 3, '(obj: Observable<unknown> | Subscribable<unknown> | PromiseLike<unknown>): unknown', gave the following error.
    Argument of type 'Signal<boolean>' is not assignable to parameter of type 'Observable<unknown> | Subscribable<unknown> | PromiseLike<unknown>'.
  Overload 2 of 3, '(obj: null | undefined): null', gave the following error.
    Argument of type 'Signal<boolean>' is not assignable to parameter of type 'null | undefined'.
  Overload 3 of 3, '(obj: Observable<unknown> | Subscribable<unknown> | PromiseLike<unknown> | null | undefined): unknown', gave the following error.
    Argument of type 'Signal<boolean>' is not assignable to parameter of type 'Observable<unknown> | Subscribable<unknown> | PromiseLike<unknown> | null | undefined'. [plugin angular-compiler]

    src/app/shared/components/layout.component.ts:13:26:
      13 │       <app-navbar *ngIf="(isAuthenticated$ | async)"></app-navbar>
         ╵                           ~~~~~~~~~~~~~~~~


X [ERROR] TS2729: Property 'authService' is used before its initialization. [plugin angular-compiler]

    src/app/shared/components/layout.component.ts:31:26:
      31 │   isAuthenticated$ = this.authService.isAuthenticated$;
         ╵                           ~~~~~~~~~~~

  'authService' is declared here.

    src/app/shared/components/layout.component.ts:29:14:
      29 │   constructor(private authService: AuthService) {}
         ╵               ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


X [ERROR] TS2729: Property 'authService' is used before its initialization. [plugin angular-compiler]

    src/app/shared/components/navbar.component.ts:53:31:
      53 │   @Input() currentUser$ = this.authService.currentUser$;
         ╵                                ~~~~~~~~~~~

  'authService' is declared here.

    src/app/shared/components/navbar.component.ts:55:14:
      55 │   constructor(private authService: AuthService) {}
         ╵               ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


X [ERROR] Expected identifier but found ":"

    src/app/features/customer/checkout.component.ts:111:42:
      111 │                 <span>${{ subtotal() { }, : .toFixed(2) }}</span>
          ╵                                           ^


X [ERROR] Expected identifier but found ":"

    src/app/features/customer/order-tracking.component.ts:180:71:
      180 │ ...xt-primary">${{ order() { }, totalAmount, : .toFixed(2) }}</span>
          ╵                                              ^


X [ERROR] You cannot `@apply` the `animate-fade-in` utility here because it creates a circular dependency. [plugin angular-sass]

    src/styles.scss:73:1:
      73 │   .animate-fade-in {
         ╵  ^

  The plugin "angular-sass" was triggered by this import

    angular:styles/global:styles:1:8:
      1 │ @import 'src/styles.scss';
        ╵         ~~~~~~~~~~~~~~~~~


Watch mode enabled. Watching for file changes...
Application bundle generation failed. [0.489 seconds] - 2025-10-17T14:14:50.605Z

▲ [WARNING] NG8113: RouterLink is not used within the template of MenuSimpleComponent [plugin angular-compiler]

    src/app/features/customer/menu-simple.component.ts:10:26:
      10 │   imports: [CommonModule, RouterLink],
         ╵                           ~~~~~~~~~~


X [ERROR] You cannot `@apply` the `animate-fade-in` utility here because it creates a circular dependency. [plugin angular-sass]

    src/styles.scss:73:1:
      73 │   .animate-fade-in {
         ╵  ^

  The plugin "angular-sass" was triggered by this import

    angular:styles/global:styles:1:8:
      1 │ @import 'src/styles.scss';
        ╵         ~~~~~~~~~~~~~~~~~


X [ERROR] TS2304: Cannot find name 'LayoutComponent'. [plugin angular-compiler]

    src/app/app.routes.ts:31:15:
      31 │     component: LayoutComponent,
         ╵                ~~~~~~~~~~~~~~~


X [ERROR] TS2304: Cannot find name 'MenuComponent'. [plugin angular-compiler]

    src/app/app.routes.ts:38:37:
      38 │           { path: 'menu', component: MenuComponent },
         ╵                                      ~~~~~~~~~~~~~


X [ERROR] TS2304: Cannot find name 'CheckoutComponent'. [plugin angular-compiler]

    src/app/app.routes.ts:39:41:
      39 │           { path: 'checkout', component: CheckoutComponent },
         ╵                                          ~~~~~~~~~~~~~~~~~


X [ERROR] TS2552: Cannot find name 'OrderTrackingComponent'. Did you mean 'OrderTrackingSimpleComponent'? [plugin angular-compiler]

    src/app/app.routes.ts:40:51:
      40 │ ... { path: 'order-tracking/:id', component: OrderTrackingComponent }
         ╵                                              ~~~~~~~~~~~~~~~~~~~~~~


X [ERROR] TS2304: Cannot find name 'MenuComponent'. [plugin angular-compiler]

    src/app/app.routes.ts:48:19:
      48 │         component: MenuComponent // Temporary - will be replaced w...
         ╵                    ~~~~~~~~~~~~~


X [ERROR] TS2304: Cannot find name 'MenuComponent'. [plugin angular-compiler]

    src/app/app.routes.ts:53:19:
      53 │         component: MenuComponent // Temporary - will be replaced
         ╵                    ~~~~~~~~~~~~~


X [ERROR] TS2304: Cannot find name 'MenuComponent'. [plugin angular-compiler]

    src/app/app.routes.ts:58:19:
      58 │         component: MenuComponent // Temporary - will be replaced
         ╵                    ~~~~~~~~~~~~~


X [ERROR] TS2304: Cannot find name 'MenuComponent'. [plugin angular-compiler]

    src/app/app.routes.ts:63:19:
      63 │         component: MenuComponent // Temporary - will be replaced
         ╵                    ~~~~~~~~~~~~~


X [ERROR] NG1010: template must be a string
  Value could not be determined statically. [plugin angular-compiler]

    src/app/features/customer/checkout.component.ts:12:12:
      12 │   template: `
         ╵             ^

  Unable to evaluate this expression statically.

    src/app/features/customer/checkout.component.ts:32:58:
      32 │ ...d text-primary">${{ (item.price * item.quantity).toFixed(2) }}</p>
         ╵                      ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  Unable to evaluate an invalid expression.

    src/app/features/customer/checkout.component.ts:32:58:
      32 │ ..."font-semibold text-primary">${{ (item.price * item.quantity).t...
         ╵                                   ^


X [ERROR] TS2349: This expression is not callable.
  Type '{}' has no call signatures. [plugin angular-compiler]

    src/app/features/customer/checkout.component.ts:32:58:
      32 │ ..."font-semibold text-primary">${{ (item.price * item.quantity).t...
         ╵                                   ^


X [ERROR] TS1136: Property assignment expected. [plugin angular-compiler]

    src/app/features/customer/checkout.component.ts:32:60:
      32 │ ...ont-semibold text-primary">${{ (item.price * item.quantity).toF...
         ╵                                   ^


X [ERROR] TS2304: Cannot find name 'item'. [plugin angular-compiler]

    src/app/features/customer/checkout.component.ts:32:61:
      32 │ ...t-semibold text-primary">${{ (item.price * item.quantity).toFix...
         ╵                                  ~~~~


X [ERROR] TS2304: Cannot find name 'item'. [plugin angular-compiler]

    src/app/features/customer/checkout.component.ts:32:74:
      32 │ ...d text-primary">${{ (item.price * item.quantity).toFixed(2) }}</p>
         ╵                                      ~~~~


X [ERROR] TS1005: '{' expected. [plugin angular-compiler]

    src/app/features/customer/checkout.component.ts:58:36:
      58 │                 <span>${{ subtotal().toFixed(2) }}</span>
         ╵                                     ^


X [ERROR] TS1005: '{' expected. [plugin angular-compiler]

    src/app/features/customer/checkout.component.ts:62:31:
      62 │                 <span>${{ tax().toFixed(2) }}</span>
         ╵                                ^


X [ERROR] TS1005: '{' expected. [plugin angular-compiler]

    src/app/features/customer/checkout.component.ts:66:37:
      66 │                 <span>-${{ discount().toFixed(2) }}</span>
         ╵                                      ^


X [ERROR] TS1005: '{' expected. [plugin angular-compiler]

    src/app/features/customer/checkout.component.ts:72:52:
      72 │ ...       <span class="text-primary">${{ total().toFixed(2) }}</span>
         ╵                                                 ^


X [ERROR] NG1010: template must be a string
  Value could not be determined statically. [plugin angular-compiler]

    src/app/features/customer/order-tracking.component.ts:12:12:
      12 │   template: `
         ╵             ^

  Unable to evaluate this expression statically.

    src/app/features/customer/order-tracking.component.ts:77:55:
      77 │ ...ary font-bold">${{ (item.price * item.quantity).toFixed(2) }}</...
         ╵                     ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  Unable to evaluate an invalid expression.

    src/app/features/customer/order-tracking.component.ts:77:55:
      77 │ ...ass="text-primary font-bold">${{ (item.price * item.quantity).t...
         ╵                                   ^


X [ERROR] TS2349: This expression is not callable.
  Type '{}' has no call signatures. [plugin angular-compiler]

    src/app/features/customer/order-tracking.component.ts:77:55:
      77 │ ...ass="text-primary font-bold">${{ (item.price * item.quantity).t...
         ╵                                   ^


X [ERROR] TS1136: Property assignment expected. [plugin angular-compiler]

    src/app/features/customer/order-tracking.component.ts:77:57:
      77 │ ...s="text-primary font-bold">${{ (item.price * item.quantity).toF...
         ╵                                   ^


X [ERROR] TS2304: Cannot find name 'item'. [plugin angular-compiler]

    src/app/features/customer/order-tracking.component.ts:77:58:
      77 │ ..."text-primary font-bold">${{ (item.price * item.quantity).toFix...
         ╵                                  ~~~~


X [ERROR] TS2304: Cannot find name 'item'. [plugin angular-compiler]

    src/app/features/customer/order-tracking.component.ts:77:71:
      77 │ ...y font-bold">${{ (item.price * item.quantity).toFixed(2) }}</span>
         ╵                                   ~~~~


X [ERROR] TS1005: '{' expected. [plugin angular-compiler]

    src/app/features/customer/order-tracking.component.ts:115:52:
      115 │ ...lass="text-primary">${{ order()?.totalAmount.toFixed(2) }}</span>
          ╵                                   ~~


X [ERROR] TS18004: No value exists in scope for the shorthand property 'totalAmount'. Either declare one or provide an initializer. [plugin angular-compiler]

    src/app/features/customer/order-tracking.component.ts:115:54:
      115 │ ...lass="text-primary">${{ order()?.totalAmount.toFixed(2) }}</span>
          ╵                                     ~~~~~~~~~~~


X [ERROR] TS1005: ',' expected. [plugin angular-compiler]

    src/app/features/customer/order-tracking.component.ts:115:65:
      115 │ ...lass="text-primary">${{ order()?.totalAmount.toFixed(2) }}</span>
          ╵                                                ^


X [ERROR] TS2769: No overload matches this call.
  Overload 1 of 3, '(obj: Observable<unknown> | Subscribable<unknown> | PromiseLike<unknown>): unknown', gave the following error.
    Argument of type 'Signal<boolean>' is not assignable to parameter of type 'Observable<unknown> | Subscribable<unknown> | PromiseLike<unknown>'.
  Overload 2 of 3, '(obj: null | undefined): null', gave the following error.
    Argument of type 'Signal<boolean>' is not assignable to parameter of type 'null | undefined'.
  Overload 3 of 3, '(obj: Observable<unknown> | Subscribable<unknown> | PromiseLike<unknown> | null | undefined): unknown', gave the following error.
    Argument of type 'Signal<boolean>' is not assignable to parameter of type 'Observable<unknown> | Subscribable<unknown> | PromiseLike<unknown> | null | undefined'. [plugin angular-compiler]

    src/app/shared/components/layout.component.ts:13:26:
      13 │       <app-navbar *ngIf="(isAuthenticated$ | async)"></app-navbar>
         ╵                           ~~~~~~~~~~~~~~~~


X [ERROR] TS2729: Property 'authService' is used before its initialization. [plugin angular-compiler]

    src/app/shared/components/layout.component.ts:31:26:
      31 │   isAuthenticated$ = this.authService.isAuthenticated$;
         ╵                           ~~~~~~~~~~~

  'authService' is declared here.

    src/app/shared/components/layout.component.ts:29:14:
      29 │   constructor(private authService: AuthService) {}
         ╵               ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


X [ERROR] TS2729: Property 'authService' is used before its initialization. [plugin angular-compiler]

    src/app/shared/components/navbar.component.ts:53:31:
      53 │   @Input() currentUser$ = this.authService.currentUser$;
         ╵                                ~~~~~~~~~~~

  'authService' is declared here.

    src/app/shared/components/navbar.component.ts:55:14:
      55 │   constructor(private authService: AuthService) {}
         ╵               ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


Application bundle generation failed. [0.124 seconds] - 2025-10-17T14:14:56.601Z

▲ [WARNING] NG8113: RouterLink is not used within the template of MenuSimpleComponent [plugin angular-compiler]

    src/app/features/customer/menu-simple.component.ts:10:26:
      10 │   imports: [CommonModule, RouterLink],
         ╵                           ~~~~~~~~~~


X [ERROR] You cannot `@apply` the `animate-fade-in` utility here because it creates a circular dependency. [plugin angular-sass]

    src/styles.scss:73:1:
      73 │   .animate-fade-in {
         ╵  ^

  The plugin "angular-sass" was triggered by this import

    angular:styles/global:styles:1:8:
      1 │ @import 'src/styles.scss';
        ╵         ~~~~~~~~~~~~~~~~~


X [ERROR] TS2304: Cannot find name 'MenuComponent'. [plugin angular-compiler]

    src/app/app.routes.ts:38:37:
      38 │           { path: 'menu', component: MenuComponent },
         ╵                                      ~~~~~~~~~~~~~


X [ERROR] TS2304: Cannot find name 'CheckoutComponent'. [plugin angular-compiler]

    src/app/app.routes.ts:39:41:
      39 │           { path: 'checkout', component: CheckoutComponent },
         ╵                                          ~~~~~~~~~~~~~~~~~


X [ERROR] TS2552: Cannot find name 'OrderTrackingComponent'. Did you mean 'OrderTrackingSimpleComponent'? [plugin angular-compiler]

    src/app/app.routes.ts:40:51:
      40 │ ... { path: 'order-tracking/:id', component: OrderTrackingComponent }
         ╵                                              ~~~~~~~~~~~~~~~~~~~~~~


X [ERROR] TS2304: Cannot find name 'MenuComponent'. [plugin angular-compiler]

    src/app/app.routes.ts:48:19:
      48 │         component: MenuComponent // Temporary - will be replaced w...
         ╵                    ~~~~~~~~~~~~~


X [ERROR] TS2304: Cannot find name 'MenuComponent'. [plugin angular-compiler]

    src/app/app.routes.ts:53:19:
      53 │         component: MenuComponent // Temporary - will be replaced
         ╵                    ~~~~~~~~~~~~~


X [ERROR] TS2304: Cannot find name 'MenuComponent'. [plugin angular-compiler]

    src/app/app.routes.ts:58:19:
      58 │         component: MenuComponent // Temporary - will be replaced
         ╵                    ~~~~~~~~~~~~~


X [ERROR] TS2304: Cannot find name 'MenuComponent'. [plugin angular-compiler]

    src/app/app.routes.ts:63:19:
      63 │         component: MenuComponent // Temporary - will be replaced
         ╵                    ~~~~~~~~~~~~~


X [ERROR] NG1010: template must be a string
  Value could not be determined statically. [plugin angular-compiler]

    src/app/features/customer/checkout.component.ts:12:12:
      12 │   template: `
         ╵             ^

  Unable to evaluate this expression statically.

    src/app/features/customer/checkout.component.ts:32:58:
      32 │ ...d text-primary">${{ (item.price * item.quantity).toFixed(2) }}</p>
         ╵                      ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  Unable to evaluate an invalid expression.

    src/app/features/customer/checkout.component.ts:32:58:
      32 │ ..."font-semibold text-primary">${{ (item.price * item.quantity).t...
         ╵                                   ^


X [ERROR] TS2349: This expression is not callable.
  Type '{}' has no call signatures. [plugin angular-compiler]

    src/app/features/customer/checkout.component.ts:32:58:
      32 │ ..."font-semibold text-primary">${{ (item.price * item.quantity).t...
         ╵                                   ^


X [ERROR] TS1136: Property assignment expected. [plugin angular-compiler]

    src/app/features/customer/checkout.component.ts:32:60:
      32 │ ...ont-semibold text-primary">${{ (item.price * item.quantity).toF...
         ╵                                   ^


X [ERROR] TS2304: Cannot find name 'item'. [plugin angular-compiler]

    src/app/features/customer/checkout.component.ts:32:61:
      32 │ ...t-semibold text-primary">${{ (item.price * item.quantity).toFix...
         ╵                                  ~~~~


X [ERROR] TS2304: Cannot find name 'item'. [plugin angular-compiler]

    src/app/features/customer/checkout.component.ts:32:74:
      32 │ ...d text-primary">${{ (item.price * item.quantity).toFixed(2) }}</p>
         ╵                                      ~~~~


X [ERROR] TS1005: '{' expected. [plugin angular-compiler]

    src/app/features/customer/checkout.component.ts:58:36:
      58 │                 <span>${{ subtotal().toFixed(2) }}</span>
         ╵                                     ^


X [ERROR] TS1005: '{' expected. [plugin angular-compiler]

    src/app/features/customer/checkout.component.ts:62:31:
      62 │                 <span>${{ tax().toFixed(2) }}</span>
         ╵                                ^


X [ERROR] TS1005: '{' expected. [plugin angular-compiler]

    src/app/features/customer/checkout.component.ts:66:37:
      66 │                 <span>-${{ discount().toFixed(2) }}</span>
         ╵                                      ^


X [ERROR] TS1005: '{' expected. [plugin angular-compiler]

    src/app/features/customer/checkout.component.ts:72:52:
      72 │ ...       <span class="text-primary">${{ total().toFixed(2) }}</span>
         ╵                                                 ^


X [ERROR] NG1010: template must be a string
  Value could not be determined statically. [plugin angular-compiler]

    src/app/features/customer/order-tracking.component.ts:12:12:
      12 │   template: `
         ╵             ^

  Unable to evaluate this expression statically.

    src/app/features/customer/order-tracking.component.ts:77:55:
      77 │ ...ary font-bold">${{ (item.price * item.quantity).toFixed(2) }}</...
         ╵                     ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  Unable to evaluate an invalid expression.

    src/app/features/customer/order-tracking.component.ts:77:55:
      77 │ ...ass="text-primary font-bold">${{ (item.price * item.quantity).t...
         ╵                                   ^


X [ERROR] TS2349: This expression is not callable.
  Type '{}' has no call signatures. [plugin angular-compiler]

    src/app/features/customer/order-tracking.component.ts:77:55:
      77 │ ...ass="text-primary font-bold">${{ (item.price * item.quantity).t...
         ╵                                   ^


X [ERROR] TS1136: Property assignment expected. [plugin angular-compiler]

    src/app/features/customer/order-tracking.component.ts:77:57:
      77 │ ...s="text-primary font-bold">${{ (item.price * item.quantity).toF...
         ╵                                   ^


X [ERROR] TS2304: Cannot find name 'item'. [plugin angular-compiler]

    src/app/features/customer/order-tracking.component.ts:77:58:
      77 │ ..."text-primary font-bold">${{ (item.price * item.quantity).toFix...
         ╵                                  ~~~~


X [ERROR] TS2304: Cannot find name 'item'. [plugin angular-compiler]

    src/app/features/customer/order-tracking.component.ts:77:71:
      77 │ ...y font-bold">${{ (item.price * item.quantity).toFixed(2) }}</span>
         ╵                                   ~~~~


X [ERROR] TS1005: '{' expected. [plugin angular-compiler]

    src/app/features/customer/order-tracking.component.ts:115:52:
      115 │ ...lass="text-primary">${{ order()?.totalAmount.toFixed(2) }}</span>
          ╵                                   ~~


X [ERROR] TS18004: No value exists in scope for the shorthand property 'totalAmount'. Either declare one or provide an initializer. [plugin angular-compiler]

    src/app/features/customer/order-tracking.component.ts:115:54:
      115 │ ...lass="text-primary">${{ order()?.totalAmount.toFixed(2) }}</span>
          ╵                                     ~~~~~~~~~~~


X [ERROR] TS1005: ',' expected. [plugin angular-compiler]

    src/app/features/customer/order-tracking.component.ts:115:65:
      115 │ ...lass="text-primary">${{ order()?.totalAmount.toFixed(2) }}</span>
          ╵                                                ^


X [ERROR] TS2769: No overload matches this call.
  Overload 1 of 3, '(obj: Observable<unknown> | Subscribable<unknown> | PromiseLike<unknown>): unknown', gave the following error.
    Argument of type 'Signal<boolean>' is not assignable to parameter of type 'Observable<unknown> | Subscribable<unknown> | PromiseLike<unknown>'.
  Overload 2 of 3, '(obj: null | undefined): null', gave the following error.
    Argument of type 'Signal<boolean>' is not assignable to parameter of type 'null | undefined'.
  Overload 3 of 3, '(obj: Observable<unknown> | Subscribable<unknown> | PromiseLike<unknown> | null | undefined): unknown', gave the following error.
    Argument of type 'Signal<boolean>' is not assignable to parameter of type 'Observable<unknown> | Subscribable<unknown> | PromiseLike<unknown> | null | undefined'. [plugin angular-compiler]

    src/app/shared/components/layout.component.ts:13:26:
      13 │       <app-navbar *ngIf="(isAuthenticated$ | async)"></app-navbar>
         ╵                           ~~~~~~~~~~~~~~~~


X [ERROR] TS2729: Property 'authService' is used before its initialization. [plugin angular-compiler]

    src/app/shared/components/layout.component.ts:31:26:
      31 │   isAuthenticated$ = this.authService.isAuthenticated$;
         ╵                           ~~~~~~~~~~~

  'authService' is declared here.

    src/app/shared/components/layout.component.ts:29:14:
      29 │   constructor(private authService: AuthService) {}
         ╵               ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


X [ERROR] TS2729: Property 'authService' is used before its initialization. [plugin angular-compiler]

    src/app/shared/components/navbar.component.ts:53:31:
      53 │   @Input() currentUser$ = this.authService.currentUser$;
         ╵                                ~~~~~~~~~~~

  'authService' is declared here.

    src/app/shared/components/navbar.component.ts:55:14:
      55 │   constructor(private authService: AuthService) {}
         ╵               ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


Application bundle generation failed. [0.062 seconds] - 2025-10-17T14:15:02.801Z

▲ [WARNING] NG8113: RouterLink is not used within the template of MenuSimpleComponent [plugin angular-compiler]

    src/app/features/customer/menu-simple.component.ts:10:26:
      10 │   imports: [CommonModule, RouterLink],
         ╵                           ~~~~~~~~~~


X [ERROR] You cannot `@apply` the `animate-fade-in` utility here because it creates a circular dependency. [plugin angular-sass]

    src/styles.scss:73:1:
      73 │   .animate-fade-in {
         ╵  ^

  The plugin "angular-sass" was triggered by this import

    angular:styles/global:styles:1:8:
      1 │ @import 'src/styles.scss';
        ╵         ~~~~~~~~~~~~~~~~~


X [ERROR] TS2304: Cannot find name 'MenuComponent'. [plugin angular-compiler]

    src/app/app.routes.ts:48:19:
      48 │         component: MenuComponent // Temporary - will be replaced w...
         ╵                    ~~~~~~~~~~~~~


X [ERROR] TS2304: Cannot find name 'MenuComponent'. [plugin angular-compiler]

    src/app/app.routes.ts:53:19:
      53 │         component: MenuComponent // Temporary - will be replaced
         ╵                    ~~~~~~~~~~~~~


X [ERROR] TS2304: Cannot find name 'MenuComponent'. [plugin angular-compiler]

    src/app/app.routes.ts:58:19:
      58 │         component: MenuComponent // Temporary - will be replaced
         ╵                    ~~~~~~~~~~~~~


X [ERROR] TS2304: Cannot find name 'MenuComponent'. [plugin angular-compiler]

    src/app/app.routes.ts:63:19:
      63 │         component: MenuComponent // Temporary - will be replaced
         ╵                    ~~~~~~~~~~~~~


X [ERROR] NG1010: template must be a string
  Value could not be determined statically. [plugin angular-compiler]

    src/app/features/customer/checkout.component.ts:12:12:
      12 │   template: `
         ╵             ^

  Unable to evaluate this expression statically.

    src/app/features/customer/checkout.component.ts:32:58:
      32 │ ...d text-primary">${{ (item.price * item.quantity).toFixed(2) }}</p>
         ╵                      ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  Unable to evaluate an invalid expression.

    src/app/features/customer/checkout.component.ts:32:58:
      32 │ ..."font-semibold text-primary">${{ (item.price * item.quantity).t...
         ╵                                   ^


X [ERROR] TS2349: This expression is not callable.
  Type '{}' has no call signatures. [plugin angular-compiler]

    src/app/features/customer/checkout.component.ts:32:58:
      32 │ ..."font-semibold text-primary">${{ (item.price * item.quantity).t...
         ╵                                   ^


X [ERROR] TS1136: Property assignment expected. [plugin angular-compiler]

    src/app/features/customer/checkout.component.ts:32:60:
      32 │ ...ont-semibold text-primary">${{ (item.price * item.quantity).toF...
         ╵                                   ^


X [ERROR] TS2304: Cannot find name 'item'. [plugin angular-compiler]

    src/app/features/customer/checkout.component.ts:32:61:
      32 │ ...t-semibold text-primary">${{ (item.price * item.quantity).toFix...
         ╵                                  ~~~~


X [ERROR] TS2304: Cannot find name 'item'. [plugin angular-compiler]

    src/app/features/customer/checkout.component.ts:32:74:
      32 │ ...d text-primary">${{ (item.price * item.quantity).toFixed(2) }}</p>
         ╵                                      ~~~~


X [ERROR] TS1005: '{' expected. [plugin angular-compiler]

    src/app/features/customer/checkout.component.ts:58:36:
      58 │                 <span>${{ subtotal().toFixed(2) }}</span>
         ╵                                     ^


X [ERROR] TS1005: '{' expected. [plugin angular-compiler]

    src/app/features/customer/checkout.component.ts:62:31:
      62 │                 <span>${{ tax().toFixed(2) }}</span>
         ╵                                ^


X [ERROR] TS1005: '{' expected. [plugin angular-compiler]

    src/app/features/customer/checkout.component.ts:66:37:
      66 │                 <span>-${{ discount().toFixed(2) }}</span>
         ╵                                      ^


X [ERROR] TS1005: '{' expected. [plugin angular-compiler]

    src/app/features/customer/checkout.component.ts:72:52:
      72 │ ...       <span class="text-primary">${{ total().toFixed(2) }}</span>
         ╵                                                 ^


X [ERROR] NG1010: template must be a string
  Value could not be determined statically. [plugin angular-compiler]

    src/app/features/customer/order-tracking.component.ts:12:12:
      12 │   template: `
         ╵             ^

  Unable to evaluate this expression statically.

    src/app/features/customer/order-tracking.component.ts:77:55:
      77 │ ...ary font-bold">${{ (item.price * item.quantity).toFixed(2) }}</...
         ╵                     ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  Unable to evaluate an invalid expression.

    src/app/features/customer/order-tracking.component.ts:77:55:
      77 │ ...ass="text-primary font-bold">${{ (item.price * item.quantity).t...
         ╵                                   ^


X [ERROR] TS2349: This expression is not callable.
  Type '{}' has no call signatures. [plugin angular-compiler]

    src/app/features/customer/order-tracking.component.ts:77:55:
      77 │ ...ass="text-primary font-bold">${{ (item.price * item.quantity).t...
         ╵                                   ^


X [ERROR] TS1136: Property assignment expected. [plugin angular-compiler]

    src/app/features/customer/order-tracking.component.ts:77:57:
      77 │ ...s="text-primary font-bold">${{ (item.price * item.quantity).toF...
         ╵                                   ^


X [ERROR] TS2304: Cannot find name 'item'. [plugin angular-compiler]

    src/app/features/customer/order-tracking.component.ts:77:58:
      77 │ ..."text-primary font-bold">${{ (item.price * item.quantity).toFix...
         ╵                                  ~~~~


X [ERROR] TS2304: Cannot find name 'item'. [plugin angular-compiler]

    src/app/features/customer/order-tracking.component.ts:77:71:
      77 │ ...y font-bold">${{ (item.price * item.quantity).toFixed(2) }}</span>
         ╵                                   ~~~~


X [ERROR] TS1005: '{' expected. [plugin angular-compiler]

    src/app/features/customer/order-tracking.component.ts:115:52:
      115 │ ...lass="text-primary">${{ order()?.totalAmount.toFixed(2) }}</span>
          ╵                                   ~~


X [ERROR] TS18004: No value exists in scope for the shorthand property 'totalAmount'. Either declare one or provide an initializer. [plugin angular-compiler]

    src/app/features/customer/order-tracking.component.ts:115:54:
      115 │ ...lass="text-primary">${{ order()?.totalAmount.toFixed(2) }}</span>
          ╵                                     ~~~~~~~~~~~


X [ERROR] TS1005: ',' expected. [plugin angular-compiler]

    src/app/features/customer/order-tracking.component.ts:115:65:
      115 │ ...lass="text-primary">${{ order()?.totalAmount.toFixed(2) }}</span>
          ╵                                                ^


X [ERROR] TS2769: No overload matches this call.
  Overload 1 of 3, '(obj: Observable<unknown> | Subscribable<unknown> | PromiseLike<unknown>): unknown', gave the following error.
    Argument of type 'Signal<boolean>' is not assignable to parameter of type 'Observable<unknown> | Subscribable<unknown> | PromiseLike<unknown>'.
  Overload 2 of 3, '(obj: null | undefined): null', gave the following error.
    Argument of type 'Signal<boolean>' is not assignable to parameter of type 'null | undefined'.
  Overload 3 of 3, '(obj: Observable<unknown> | Subscribable<unknown> | PromiseLike<unknown> | null | undefined): unknown', gave the following error.
    Argument of type 'Signal<boolean>' is not assignable to parameter of type 'Observable<unknown> | Subscribable<unknown> | PromiseLike<unknown> | null | undefined'. [plugin angular-compiler]

    src/app/shared/components/layout.component.ts:13:26:
      13 │       <app-navbar *ngIf="(isAuthenticated$ | async)"></app-navbar>
         ╵                           ~~~~~~~~~~~~~~~~


X [ERROR] TS2729: Property 'authService' is used before its initialization. [plugin angular-compiler]

    src/app/shared/components/layout.component.ts:31:26:
      31 │   isAuthenticated$ = this.authService.isAuthenticated$;
         ╵                           ~~~~~~~~~~~

  'authService' is declared here.

    src/app/shared/components/layout.component.ts:29:14:
      29 │   constructor(private authService: AuthService) {}
         ╵               ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


X [ERROR] TS2729: Property 'authService' is used before its initialization. [plugin angular-compiler]

    src/app/shared/components/navbar.component.ts:53:31:
      53 │   @Input() currentUser$ = this.authService.currentUser$;
         ╵                                ~~~~~~~~~~~

  'authService' is declared here.

    src/app/shared/components/navbar.component.ts:55:14:
      55 │   constructor(private authService: AuthService) {}
         ╵               ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


