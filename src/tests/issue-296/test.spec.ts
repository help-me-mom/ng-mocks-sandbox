import {
  Component,
  Inject,
  Injectable,
  InjectionToken,
  NgModule,
  Type,
} from '@angular/core';

import { MockBuilder, MockRender } from 'ng-mocks';

interface ComponentResolver {
  resolveComponentFactory(component: Type<unknown>): void;
}

const COMPONENT_RESOLVER = new InjectionToken<ComponentResolver>(
  'ComponentFactoryResolver',
  {
    factory: () => ({
      resolveComponentFactory: () => undefined,
    }),
  },
);

@Injectable()
class ModalService {
  public constructor(
    @Inject(COMPONENT_RESOLVER)
    private readonly componentResolver: ComponentResolver,
  ) {}

  public open(component: Type<unknown>): void {
    this.componentResolver.resolveComponentFactory(component);
  }
}

@Component({
  selector: 'modal',
  standalone: false,
  template: 'modal',
})
class ModalComponent {}

@Component({
  selector: 'target-296',
  standalone: false,
  template: 'target',
})
class TargetComponent {
  public constructor(modalService: ModalService) {
    modalService.open(ModalComponent);
  }
}

@NgModule({
  declarations: [TargetComponent, ModalComponent],
  providers: [ModalService],
})
class TargetModule {}

// @see https://github.com/help-me-mom/ng-mocks/issues/296
describe('issue-296:without-entry', () => {
  beforeEach(() =>
    MockBuilder(TargetComponent)
      .keep(ModalService)
      .keep(ModalComponent)
      .keep(COMPONENT_RESOLVER),
  );

  it('behaves correctly with and without ivy', () => {
    expect(() => MockRender(TargetComponent)).not.toThrow();
  });
});

// @see https://github.com/help-me-mom/ng-mocks/issues/296
describe('issue-296:with-entry', () => {
  beforeEach(() => MockBuilder(TargetComponent).keep(TargetModule));

  it('behaves correctly with and without ivy', () => {
    // it should never throw
    expect(() => MockRender(TargetComponent)).not.toThrow();
  });
});
