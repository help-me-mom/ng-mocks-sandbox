import {
  HttpClient,
  HttpClientModule,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HTTP_INTERCEPTORS,
} from '@angular/common/http';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { Injectable, NgModule } from '@angular/core';
import {
  MockBuilder,
  MockRender,
  NG_MOCKS_INTERCEPTORS,
} from 'ng-mocks';
import { Observable } from 'rxjs';

// An interceptor we want to test.
@Injectable()
class TargetInterceptor implements HttpInterceptor {
  protected value = 'HttpInterceptor';

  public intercept(
    request: HttpRequest<void>,
    next: HttpHandler,
  ): Observable<HttpEvent<void>> {
    return next.handle(
      request.clone({
        setHeaders: {
          'My-Custom': this.value,
        },
      }),
    );
  }
}

// An interceptor we want to ignore.
@Injectable()
class MockInterceptor implements HttpInterceptor {
  protected value = 'Ignore';

  public intercept(
    request: HttpRequest<void>,
    next: HttpHandler,
  ): Observable<HttpEvent<void>> {
    return next.handle(
      request.clone({
        setHeaders: {
          'My-Mock': this.value,
        },
      }),
    );
  }
}

// A module with its definition.
@NgModule({
  imports: [HttpClientModule],
  providers: [
    TargetInterceptor,
    MockInterceptor,
    {
      multi: true,
      provide: HTTP_INTERCEPTORS,
      useExisting: TargetInterceptor,
    },
    {
      multi: true,
      provide: HTTP_INTERCEPTORS,
      useClass: MockInterceptor,
    },
  ],
})
class TargetModule {}

describe('TestHttpInterceptor', () => {
  // Because we want to test the interceptor, we pass it as the first
  // parameter of MockBuilder. To correctly satisfy its dependencies
  // we need to pass its module as the second parameter. Also we
  // should to pass HTTP_INTERCEPTORS into `.mock` and replace
  // HttpClientModule with HttpClientTestingModule.
  beforeEach(() => {
    return MockBuilder(TargetInterceptor, TargetModule)
      .exclude(NG_MOCKS_INTERCEPTORS)
      .keep(HTTP_INTERCEPTORS)
      .replace(HttpClientModule, HttpClientTestingModule);
  });

  it('triggers interceptor', () => {
    const fixture = MockRender('');
    const client: HttpClient =
      fixture.debugElement.injector.get(HttpClient);
    const httpMock: HttpTestingController =
      fixture.debugElement.injector.get(HttpTestingController);

    // Let's do a simply request.
    client.get('/target').subscribe();

    // Now we can assert that a header has been added to the request.
    const req = httpMock.expectOne('/target');
    req.flush('');
    httpMock.verify();

    expect(req.request.headers.get('My-Custom')).toEqual(
      'HttpInterceptor',
    );
  });
});
