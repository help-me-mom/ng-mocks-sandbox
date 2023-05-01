import { NgForOf } from '@angular/common';
import { Component, NgModule } from '@angular/core';

import { MockBuilder, MockRender } from 'ng-mocks';

// @see https://github.com/help-me-mom/ng-mocks/issues/5465
// TypeError: Class constructor CommonModule cannot be invoked without 'new'
describe('issue-5465', () => {
  @Component({
    selector: 'app-ng-for',
    template: `
      <span *ngFor="let letter of this.test">{{ letter }}</span>
    `,
  })
  class AppNgForComponent {
    test = ['a', 'b'];

    appNgFor5465() {}
  }

  @NgModule({
    imports: [NgForOf],
    declarations: [AppNgForComponent],
    exports: [AppNgForComponent],
  })
  class AppNgForModule {}

  @Component({
    selector: 'app-root',
    template: ` <app-ng-for></app-ng-for> `,
  })
  class AppRootComponent {
    appRoot5465() {}
  }

  @NgModule({
    declarations: [AppRootComponent],
    imports: [AppNgForModule],
    providers: [],
    bootstrap: [AppRootComponent],
  })
  class AppModule {}

  beforeEach(() =>
    MockBuilder([AppRootComponent], [AppModule, NgForOf]),
  );

  it('renders AppRootComponent', () => {
    expect(() => MockRender(AppRootComponent)).not.toThrow();
  });
});
