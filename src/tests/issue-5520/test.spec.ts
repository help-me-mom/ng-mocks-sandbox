import { Component, NgModule } from '@angular/core';

import { MockBuilder, MockRender } from 'ng-mocks';

// @see https://github.com/help-me-mom/ng-mocks/issues/5520
describe('issue-5520', () => {
  @Component({
    selector: 'dependency',
    standalone: false,
    template: '',
  })
  class DependencyComponent {
    dependency5520() {}
  }

  @NgModule({
    declarations: [DependencyComponent],
    exports: [DependencyComponent],
  })
  class DependencyModule {}

  @Component({
    selector: 'standalone',
    template: '<dependency></dependency>',
    imports: [DependencyModule],
  })
  class StandaloneComponent {
    standalone5520() {}
  }

  beforeEach(() =>
    MockBuilder(StandaloneComponent, null)
      .keep(DependencyModule)
      .mock(DependencyComponent),
  );
  // Error: MockBuilder has found a missing dependency: DependencyModule. It means no module provides it.
  // Please, use the "export" flag if you want to add it explicitly. https://ng-mocks.sudo.eu/api/MockBuilder#export-flag

  it('creates StandaloneComponent', () => {
    expect(() => MockRender(StandaloneComponent)).not.toThrow();
  });
});
