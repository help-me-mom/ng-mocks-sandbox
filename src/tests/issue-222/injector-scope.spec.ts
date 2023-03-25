import {
  Component,
  Inject,
  Injectable,
  NgModule,
  PLATFORM_ID,
} from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { MockBuilder, MockRender } from 'ng-mocks';

@Injectable({
  providedIn: 'root',
})
class KeepService {
  public constructor(@Inject(PLATFORM_ID) public readonly id: any) {}

  public echo(): any {
    return this.id;
  }
}

@NgModule({})
class KeepModule {
  public constructor(service: KeepService) {
    service.echo();
  }
}

@Component({
  selector: 'target-222-injector-scope',
  template: 'target',
})
class TargetComponent {}

@NgModule({
  declarations: [TargetComponent],
  imports: [BrowserModule, KeepModule],
})
class TargetModule {}

// @see https://github.com/help-me-mom/ng-mocks/issues/222
describe('issue-222:INJECTOR_SCOPE', () => {
  beforeEach(() =>
    MockBuilder(TargetComponent, TargetModule).keep(KeepModule),
  );

  it('does not mock INJECTOR_SCOPE, fails on ivy only', () => {
    // No provider for KeepService
    expect(() => MockRender(TargetComponent)).not.toThrow();
  });
});
