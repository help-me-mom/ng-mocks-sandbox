// tslint:disable no-duplicate-imports

import * as core from '@angular/core';
import {
  Component,
  ComponentFactoryResolver,
  Injectable,
  NgModule,
} from '@angular/core';
import { MockBuilder, MockRender } from 'ng-mocks';

@Injectable()
export class ModalService {
  public constructor(
    private readonly componentFactoryResolver: ComponentFactoryResolver,
  ) {}

  public open(component: any) {
    this.componentFactoryResolver.resolveComponentFactory(component);
  }
}

@Component({
  selector: 'modal',
  template: 'modal',
})
class ModalComponent {}

@Component({
  selector: 'target',
  template: 'target',
})
class TargetComponent {
  public constructor(modalService: ModalService) {
    modalService.open(ModalComponent);
  }
}

@NgModule({
  declarations: [TargetComponent, ModalComponent],
  entryComponents: [ModalComponent],
  providers: [ModalService],
})
class TargetModule {}

describe('issue-296:without-entry', () => {
  beforeEach(() =>
    MockBuilder(TargetComponent)
      .keep(ModalService)
      .keep(ModalComponent),
  );

  it('behaves correctly with and without ivy', () => {
    const render = () => MockRender(TargetComponent);
    if ((core as any).ɵivyEnabled) {
      // ivy does not fail
      expect(render).not.toThrow();
    }
    if (!(core as any).ɵivyEnabled) {
      // no-ivy fails with @NgModule.entryComponents
      expect(render).toThrowError(
        /No component factory found for ModalComponent/,
      );
    }
  });
});

describe('issue-296:with-entry', () => {
  beforeEach(() => MockBuilder(TargetComponent).keep(TargetModule));

  it('behaves correctly with and without ivy', () => {
    const render = () => MockRender(TargetComponent);
    // it should never throw
    expect(render).not.toThrow();
  });
});
