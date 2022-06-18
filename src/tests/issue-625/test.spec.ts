import {
  Component,
  Injectable,
  NgModule,
  OnInit,
} from '@angular/core';

import {
  MockBuilder,
  MockInstance,
  MockRender,
  ngMocks,
} from 'ng-mocks';

/*
 * As you can see, SomeService provided in forRoot() function.
 * I did so to reproduce the situation with NgxsModule and Store provider.
 */
@NgModule({})
export class SomeRootModule {}

@Injectable()
export class SomeService {
  public readonly name = 'some';

  public method(): string {
    return this.name;
  }
}

@Injectable()
export class AnotherService {
  public readonly name = 'another';

  public method(): string {
    return this.name;
  }
}

@NgModule({
  imports: [],
})
export class SomeModule {
  public static forRoot() {
    return {
      ngModule: SomeRootModule,
      providers: [SomeService, AnotherService],
    };
  }
}

/*
 * SomeModule.forRoot() imported only in AppModule, not in MyModule or any it's dependencies.
 * So it seems SomeService doesn't provided in test environment.
 * That's why I do call keep(SomeModule.forRoot([])).
 * The issue is: in v11.10 somehow it's provide MyService and tests passing,
 * in v12.0.2 test fails with "Expected spy unknown to have been called but it was never called"
 */
@Component({
  selector: 'my-component',
  template: '',
})
export class MyComponent implements OnInit {
  public constructor(private readonly someService: SomeService) {}

  public ngOnInit(): void {
    this.someService.method();
  }
}

@NgModule({
  declarations: [MyComponent],
  imports: [SomeModule],
})
export class MyModule {}

// @see https://github.com/ike18t/ng-mocks/issues/625
describe('issue-625', () => {
  let spy: any;

  beforeEach(() => {
    return MockBuilder(
      [MyComponent, SomeModule.forRoot()],
      MyModule,
    ).mock(SomeService);
  });

  beforeEach(() => {
    spy = MockInstance(
      SomeService,
      'method',
      jasmine.createSpy(), // or jest.fn(),
    );
  });
  afterEach(() => MockInstance(SomeService));

  it('should call the spy', () => {
    MockRender(MyComponent);
    expect(spy).toHaveBeenCalled();
    // mocks the service
    expect(ngMocks.findInstance(SomeService).name).toEqual(
      undefined as any,
    );
    // keeps another one
    expect(ngMocks.findInstance(AnotherService).name).toEqual(
      'another',
    );
  });
});
