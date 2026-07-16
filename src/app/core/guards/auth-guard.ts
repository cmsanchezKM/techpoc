import { CanActivateFn } from '@angular/router';

export const authGuard: CanActivateFn = () => {
  //const auth = inject(AuthService);
  //const router = inject(Router);

  return true;

  /* TODO: Implementar cuándo hagamos el login
  if (auth.isAuthenticated()) {
    return true;
  }
    */

  //return router.parseUrl('/login');
};
