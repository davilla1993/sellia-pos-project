import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { GlobalSessionService } from '@core/services/global-session.service';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GlobalSessionGuard implements CanActivate {
  constructor(
    private globalSessionService: GlobalSessionService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    return this.globalSessionService.getCurrentSession().pipe(
      map((session) => {
        if (session && session.status === 'OPEN') {
          return true;
        } else {
          this.router.navigate(['/pos/cashier-selection']);
          return false;
        }
      }),
      catchError(() => {
        this.router.navigate(['/pos/cashier-selection']);
        return of(false);
      })
    );
  }
}
