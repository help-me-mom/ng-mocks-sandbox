import {
  Component,
  Inject,
  InjectionToken,
  OnInit,
} from '@angular/core';

import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

interface ComponentResolver {
  resolveComponentFactory(component: unknown): unknown;
}

const COMPONENT_RESOLVER = new InjectionToken<ComponentResolver>(
  'ComponentFactoryResolver',
);

@Component({
  selector: 'modal',
  standalone: false,
  template: 'modal',
})
class ModalComponent {}

@Component({
  selector: 'target-736',
  standalone: false,
  template: 'target',
})
class TargetComponent implements OnInit {
  public constructor(
    @Inject(COMPONENT_RESOLVER)
    public readonly componentResolver: ComponentResolver,
  ) {}

  public ngOnInit(): void {
    this.componentResolver.resolveComponentFactory(ModalComponent);
  }
}

// @see https://github.com/help-me-mom/ng-mocks/issues/736
describe('issue-736', () => {
  beforeEach(() =>
    MockBuilder(TargetComponent)
      .mock(ModalComponent)
      .provide({
        provide: COMPONENT_RESOLVER,
        useValue: {
          resolveComponentFactory: jasmine.createSpy(
            'ComponentFactoryResolver.resolveComponentFactory',
          ),
          // in case of jest
          // resolveComponentFactory: jest.fn().mockName(
          //   'ComponentFactoryResolver.resolveComponentFactory',
          // ),
        },
      }),
  );

  it('allows to mock resolveComponentFactory', () => {
    // creating fixture without a render
    const fixture = MockRender(TargetComponent, undefined, false);

    // getting current instance of mock ComponentFactoryResolver
    const componentFactoryResolver = ngMocks.findInstance(
      COMPONENT_RESOLVER,
    );

    // its spied resolveComponentFactory shouldn't be called
    // the bug was that it is not a spy anymore.
    expect(
      componentFactoryResolver.resolveComponentFactory,
    ).not.toHaveBeenCalled();

    // triggering ngOnInit
    fixture.detectChanges();

    // resolveComponentFactory should have been called with the requested
    // component. The replacement token is not Angular's legacy resolver, so
    // ng-mocks does not rewrite the argument to the mocked definition.
    expect(
      componentFactoryResolver.resolveComponentFactory,
    ).toHaveBeenCalledWith(ModalComponent);
  });
});
