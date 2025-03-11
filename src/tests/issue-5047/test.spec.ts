import { NgIf } from '@angular/common';
import { Component, Input, NgModule } from '@angular/core';

import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

// @see https://github.com/help-me-mom/ng-mocks/issues/5047
// NgIf should be kept by default, even if CommonModule hasn't been imported.
// The fix is in test.ts
describe('issue-5047', () => {
  @Component({
    selector: 'dependency',
    standalone: false,
    template: '<ng-content></ng-content>',
  })
  class DependencyComponent {
    @Input() public readonly name: string | null = null;
  }

  // A standalone component we are going to test.
  @Component({
    selector: 'target-5047',
    standalone: false,
    template: `<dependency *ngIf="name !== null">target</dependency>`,
  })
  class TargetComponent {
    @Input() public readonly name: string | null = null;
  }

  @NgModule({
    imports: [NgIf],
    declarations: [TargetComponent, DependencyComponent],
  })
  class TargetModule {}

  beforeEach(() => MockBuilder(TargetComponent, TargetModule));

  it('renders dependencies', () => {
    const fixture = MockRender(TargetComponent, {
      name: 'test',
    });

    expect(ngMocks.formatText(fixture)).toEqual('target');
  });
});
