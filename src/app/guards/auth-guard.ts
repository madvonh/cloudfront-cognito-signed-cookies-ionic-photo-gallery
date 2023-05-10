import { inject } from '@angular/core';
import { CanActivateFn, Router }from '@angular/router';
import { AuthService } from '../services/auth.service';

export function authenticationGuard(): CanActivateFn {
  return async () => {
    const oauthService: AuthService = inject(AuthService);
    const router: Router = inject(Router);

    if (await oauthService.isAuthenticated()) {
      return true;
    }
    
    router.navigate(['login'])
    return false;
  };
}
