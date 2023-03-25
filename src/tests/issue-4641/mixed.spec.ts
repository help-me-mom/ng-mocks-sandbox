import { Component, NgModule } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { MockModule, MockRender, ngMocks } from 'ng-mocks';

@Component({
  selector: 'target-4641-mixed',
  template: ` replace:<replace-4641-mixed></replace-4641-mixed> `,
})
class TargetComponent {}

@Component({
  selector: 'replace-4641-mixed',
  template: 'replace-real',
})
class ReplaceComponent {
  public replace() {
    return true;
  }
}

@NgModule({
  declarations: [ReplaceComponent],
  exports: [ReplaceComponent],
})
class ReplaceModule {}

@Component({
  selector: 'replace-4641-mixed',
  template: 'replace-mock',
})
class ReplaceMockComponent {
  public replaceMock() {
    return true;
  }
}

@Component({
  selector: 'dep1-4641-mixed',
  template: '<replace-4641-mixed></replace-4641-mixed>',
})
class Dep1Component {}

@Component({
  selector: 'dep2-4641-mixed',
  template: '<replace-4641-mixed></replace-4641-mixed>',
})
class Dep2Component {}

@NgModule({
  declarations: [Dep1Component, TargetComponent],
  exports: [Dep1Component],
  imports: [ReplaceModule],
})
class Dep1Module {}

@NgModule({
  declarations: [Dep2Component],
  exports: [Dep2Component],
  imports: [ReplaceModule],
})
class Dep2Module {}

// @see https://github.com/help-me-mom/ng-mocks/issues/4641
// MockBuilder under TestBed.configureTestingModule doesn't respect `.overrideModule`.
describe('issue-4641:mixed', () => {
  beforeEach(() => ngMocks.flushTestBed());

  beforeEach(() =>
    TestBed.configureTestingModule({
      declarations: [TargetComponent],
      imports: [MockModule(Dep1Module), Dep2Module, ReplaceModule],
    })
      .overrideModule(ReplaceModule, {
        remove: {
          declarations: [ReplaceComponent],
          exports: [ReplaceComponent],
        },
        add: {
          declarations: [ReplaceMockComponent],
          exports: [ReplaceMockComponent],
        },
      })
      .compileComponents(),
  );

  it('replaces declarations', () => {
    const fixture = MockRender(TargetComponent);

    // replace was replaced, therefore, it should rely on the replaced declaration.
    expect(ngMocks.formatText(fixture)).toContain(
      'replace:replace-mock',
    );
  });
});
