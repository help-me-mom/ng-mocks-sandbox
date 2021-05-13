import { Location } from '@angular/common';
import { Component, Injectable, NgModule } from '@angular/core';
import { fakeAsync, tick } from '@angular/core/testing';
import {
  ActivatedRoute,
  Resolve,
  Router,
  RouterModule,
  RouterOutlet,
} from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';
import { combineLatest, from, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

// A simple service simulating a data request.
@Injectable()
class DataService {
  protected flag = true;

  public data(): Observable<boolean> {
    return from([this.flag]);
  }
}

// A resolver we want to test.
@Injectable()
class DataResolver implements Resolve<{ flag: boolean }> {
  public constructor(protected service: DataService) {}

  public resolve() {
    return combineLatest([this.service.data()]).pipe(
      map(([flag]) => ({ flag })),
    );
  }
}

// A resolver we want to ignore.
@Injectable()
class MockResolver implements Resolve<{ mock: boolean }> {
  protected mock = true;

  public resolve() {
    return of({ mock: this.mock });
  }
}

// A dummy component.
// It will be replaced with a mock copy.
@Component({
  selector: 'target',
  template: 'target',
})
class TargetComponent {}

// Definition of the routing module.
@NgModule({
  declarations: [TargetComponent],
  exports: [RouterModule],
  imports: [
    RouterModule.forRoot([
      {
        component: TargetComponent,
        path: 'target',
        resolve: {
          data: DataResolver,
          mock: MockResolver,
        },
      },
    ]),
  ],
  providers: [DataService, DataResolver, MockResolver],
})
class TargetModule {}

describe('TestRoutingResolver', () => {
  // Because we want to test the resolver, it means that we want to
  // test its integration with RouterModule. Therefore, we pass
  // the resolver as the first parameter of MockBuilder. Then, to
  // correctly satisfy its initialization, we need to pass its module
  // as the second parameter. And, the last but not the least, we
  // need to keep RouterModule to have its routes, and to
  // add RouterTestingModule.withRoutes([]), yes yes, with empty
  // routes to have tools for testing.
  beforeEach(() => {
    return MockBuilder(DataResolver, TargetModule)
      .keep(RouterModule)
      .keep(RouterTestingModule.withRoutes([]));
  });

  // It is important to run routing tests in fakeAsync.
  it('provides data to on the route', fakeAsync(() => {
    const fixture = MockRender(RouterOutlet);
    const router: Router = fixture.point.injector.get(Router);
    const location: Location = fixture.point.injector.get(Location);
    const dataService: DataService =
      fixture.point.injector.get(DataService);

    // DataService has been replaced with a mock copy,
    // let's set a custom value we will assert later on.
    dataService.data = () => from([false]);

    // Let's switch to the route with the resolver.
    location.go('/target');

    // Now we can initialize navigation.
    if (fixture.ngZone) {
      fixture.ngZone.run(() => router.initialNavigation());
      tick(); // is needed for rendering of the current route.
    }

    // Checking that we are on the right page.
    expect(location.path()).toEqual('/target');

    // Let's extract ActivatedRoute of the current component.
    const el = ngMocks.find(TargetComponent);
    const route: ActivatedRoute = el.injector.get(ActivatedRoute);

    // Now we can assert that it has expected data.
    expect(route.snapshot.data).toEqual(
      jasmine.objectContaining({
        data: {
          flag: false,
        },
      }),
    );
  }));
});
