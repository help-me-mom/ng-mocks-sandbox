import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  Injector,
  NgModule,
  ViewChild,
} from '@angular/core';
import { Observable, Subject } from 'rxjs';

import { MockBuilder, MockInstance, MockRender } from 'ng-mocks';

// A copy of EMPTY, which does not exist in A5.
const EMPTY = new Subject<any>();
EMPTY.complete();

// A child component that contains update$ the parent component wants to listen to.
@Component({
  selector: 'target',
  template: '{{ update$ | async }}',
})
class ChildComponent {
  public readonly update$: Observable<void> = EMPTY;

  public constructor(public readonly injector: Injector) {}
}

// A parent component that uses @ViewChild to listen to update$ of its child component.
@Component({
  selector: 'real',
  template: '<target></target>',
})
class RealComponent implements AfterViewInit {
  @ViewChild(ChildComponent)
  protected child?: ChildComponent;

  public ngAfterViewInit() {
    if (this.child) {
      this.child.update$.subscribe();
    }
  }
}

@NgModule({
  imports: [CommonModule],
  declarations: [RealComponent, ChildComponent],
})
class ItsModule {}

describe('MockInstance', () => {
  // A normal setup of the TestBed, TargetComponent will be replaced
  // with its mock object.
  // Do not forget to return the promise of MockBuilder.
  beforeEach(() => MockBuilder(RealComponent, ItsModule));

  beforeEach(() => {
    // Because TargetComponent is replaced with its mock object,
    // its update$ is undefined and ngAfterViewInit of the parent
    // component will fail on .subscribe().
    // Let's fix it via defining customization for the mock object.
    MockInstance(ChildComponent, () => ({
      // comment the next line to check the failure.
      update$: EMPTY,
    }));
  });

  afterEach(() => {
    // Resets customizations
    MockInstance(ChildComponent);
  });

  it('should render', () => {
    // Without the custom initialization rendering would fail here
    // with "Cannot read property 'subscribe' of undefined".
    expect(() => MockRender(RealComponent)).not.toThrow();
  });
});
