import { CommonModule } from '@angular/common';
import { Component, NgModule } from '@angular/core';

import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

// @see https://github.com/help-me-mom/ng-mocks/issues/7216
describe('issue-7216', () => {
  @Component({
    selector: 'target',
    standalone: false,
    template: `
      @if (hasChild) {
        <child></child>
      }
    `,
  })
  class TargetComponent {
    public readonly hasChild = true;
  }

  @Component({
    selector: 'child',
    standalone: false,
    template: '',
  })
  class ChildComponent {}

  @NgModule({
    imports: [CommonModule],
    declarations: [TargetComponent, ChildComponent],
  })
  class TargetModule {}

  beforeEach(() => MockBuilder(TargetComponent, TargetModule));

  it('finds child-element', () => {
    MockRender(TargetComponent);

    expect(ngMocks.findInstance(ChildComponent)).toBeTruthy();
  });
});
