import { CommonModule, NgIf } from '@angular/common';
import {
  ApplicationModule,
  ChangeDetectionStrategy,
  Component,
} from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';

import { MockBuilder } from 'ng-mocks';

@Component({
  imports: [CommonModule, RouterModule],
  template: ` <a [routerLink]="['link']">Link</a> `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class MyComponent {
  constructor(public activatedRoute: ActivatedRoute) {}
}

// @see https://github.com/help-me-mom/ng-mocks/issues/3635
// MockBuilder doesn't detect always keep modules such as CommonModule.
describe('issue-3635', () => {
  it('does not throw because CommonModule is an import in MyComponent', () => {
    expect(() =>
      MockBuilder(MyComponent, ActivatedRoute).build(),
    ).not.toThrow();
  });

  it('throws because ApplicationModule is not imported anywhere', () => {
    expect(() =>
      MockBuilder(MyComponent, ActivatedRoute)
        .mock(ApplicationModule)
        .build(),
    ).toThrowError(/MockBuilder has found a missing dependency/);
  });

  it('does not throw because NgIf is a part of CommonModule from MyComponent', () => {
    expect(() =>
      MockBuilder(MyComponent, ActivatedRoute).mock(NgIf).build(),
    ).not.toThrow();
  });
});
