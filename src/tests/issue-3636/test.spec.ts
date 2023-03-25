import { Component } from '@angular/core';

import { MockBuilder, MockRender } from 'ng-mocks';

@Component({
  standalone: true,
  template: ``,
})
class MyComponent {}

// @see https://github.com/help-me-mom/ng-mocks/issues/3636
// The problem was that a standalone component caused MockRender
// to create the middleware component as standalone too.
// The fix ensures that the middleware component is always a normal declaration.
describe('issue-3636', () => {
  beforeEach(() => MockBuilder(MyComponent));

  it('detects the standalone component correctly in MockRender', () => {
    const fixture = MockRender(MyComponent);
    expect(fixture.point.componentInstance).toBeDefined();
  });
});
