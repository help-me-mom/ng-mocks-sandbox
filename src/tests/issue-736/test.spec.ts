// tslint:disable strict-type-predicates

import {
  Component,
  ComponentFactoryResolver,
  OnInit,
} from '@angular/core';
import { getMockedNgDefOf, MockBuilder, MockRender } from 'ng-mocks';

@Component({
  selector: 'modal',
  template: 'modal',
})
class ModalComponent {}

@Component({
  selector: 'target',
  template: 'target',
})
class TargetComponent implements OnInit {
  public constructor(
    public readonly componentFactoryResolver: ComponentFactoryResolver,
  ) {}

  public ngOnInit(): void {
    this.componentFactoryResolver.resolveComponentFactory(
      ModalComponent,
    );
  }
}

describe('issue-736', () => {
  beforeEach(() =>
    MockBuilder(TargetComponent)
      .mock(ModalComponent)
      .provide({
        provide: ComponentFactoryResolver,
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
    const componentFactoryResolver =
      fixture.debugElement.injector.get(ComponentFactoryResolver);

    // its spied resolveComponentFactory shouldn't be called
    // the bug was that it is not a spy anymore.
    expect(
      componentFactoryResolver.resolveComponentFactory,
    ).not.toHaveBeenCalled();

    // triggering ngOnInit
    fixture.detectChanges();

    // resolveComponentFactory should have been called
    expect(
      componentFactoryResolver.resolveComponentFactory,
    ).toHaveBeenCalledWith(getMockedNgDefOf(ModalComponent));
  });
});
