import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/auth';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private firebaseAuth: AngularFireAuth, 
              private router: Router) { }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    return this.firebaseAuth.authState.pipe(
      take(1),
      map((auth) => {
        if (!auth) {
          this.router.navigate(['/']);
          console.log("In guard: not logged in");
          return false;
        }
        console.log("In guard: logged in");
        return true;
      })
    );
  }
}
