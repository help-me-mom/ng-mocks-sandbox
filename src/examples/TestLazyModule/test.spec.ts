import { Component, NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

import { LazyComponent, LazyModule } from './lazy-module';

@Component({
  selector: 'target',
  template: '<router-outlet></router-outlet>',
})
class AppComponent {}

@NgModule({
  exports: [RouterModule],
  imports: [
    RouterModule.forRoot([
      {
        loadChildren: () => LazyModule,
        path: '',
      },
    ]),
  ],
})
class AppModuleRouting {}

@NgModule({
  bootstrap: [AppComponent],
  declarations: [AppComponent],
  imports: [AppModuleRouting],
})
class AppModule {}

describe('TestLazyModule', () => {
  beforeEach(() =>
    MockBuilder(LazyComponent, [AppModule, LazyModule]),
  );

  it('renders lazy component', () => {
    const fixture = MockRender(LazyComponent);
    expect(ngMocks.formatText(fixture)).toEqual('lazy-component');
  });
});
