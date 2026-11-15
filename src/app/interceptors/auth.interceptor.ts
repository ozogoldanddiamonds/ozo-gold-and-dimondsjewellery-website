import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpErrorResponse,
  HttpEvent
} from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, catchError, throwError, switchMap, filter, take } from 'rxjs';
import { AuthService } from '../service/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  private isRefreshing = false;

  private refreshTokenSubject =
    new BehaviorSubject<string | null>(null);

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {

    // OTP and refresh API requests should not trigger refresh
    const excludedUrls = [
      '/send-otp',
      '/verify-otp',
      '/resend-otp',
      '/refresh-token'
    ];

    const isExcluded = excludedUrls.some(url =>
      req.url.includes(url)
    );

    const token = this.authService.getAccessToken();

    const authReq = token && !isExcluded
      ? this.addToken(req, token)
      : req;

    return next.handle(authReq).pipe(

      catchError((error: HttpErrorResponse) => {

        if (
          error.status !== 401 ||
          isExcluded
        ) {
          return throwError(() => error);
        }

        return this.handle401Error(req, next);

      })

    );

  }

  private addToken(
    request: HttpRequest<any>,
    token: string
  ): HttpRequest<any> {

    return request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });

  }

  private handle401Error(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {

    if (!this.isRefreshing) {

      this.isRefreshing = true;

      this.refreshTokenSubject.next(null);

      return this.authService.refreshSession().pipe(

        switchMap((newToken: string) => {

          this.isRefreshing = false;

          this.refreshTokenSubject.next(newToken);

          return next.handle(
            this.addToken(request, newToken)
          );

        }),

        catchError((error) => {

          this.isRefreshing = false;

          this.authService.clearAuth();

          this.router.navigateByUrl('/home');

          return throwError(() => error);

        })

      );

    }

    // Other simultaneous requests wait for refresh
    return this.refreshTokenSubject.pipe(

      filter((token): token is string => token !== null),

      take(1),

      switchMap((token) => {

        return next.handle(
          this.addToken(request, token)
        );

      })

    );

  }
}