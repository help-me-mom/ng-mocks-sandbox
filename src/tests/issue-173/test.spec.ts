import { Directive, NgModule } from '@angular/core';
import { MockBuilder, MockRender } from 'ng-mocks';

@Directive({
  selector: 'child',
})
class ChildDirective {}

@Directive({
  // this def of an existing directive breaks ng-mocks.
  providers: [
    {
      provide: ChildDirective,
      useValue: undefined,
    },
  ],
  selector: 'parent',
})
class ParentDirective {}

@NgModule({
  declarations: [ParentDirective, ChildDirective],
  exports: [ParentDirective, ChildDirective],
})
class TargetModule {}

// Declarations and providers should be cached in different buckets.
// Because when we mock a declaration we get a mock class, but
// when we mock a provider we get a mock instance.
// @see https://github.com/ike18t/ng-mocks/issues/173
describe('issue-173', () => {
  beforeEach(() => MockBuilder().mock(TargetModule));

  it('should render w/o an error', () => {
    expect(() => MockRender('ng-mocks')).not.toThrow();
  });
});
