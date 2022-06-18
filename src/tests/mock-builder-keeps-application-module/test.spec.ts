import { APP_ID, APP_INITIALIZER } from '@angular/core';

import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

import {
  TARGET_TOKEN,
  TargetComponent,
  TargetModule,
} from './fixtures';

describe('MockBuilderKeepsApplicationModule:real', () => {
  beforeEach(() => MockBuilder(TargetModule));

  it('should render', () => {
    const fixture = MockRender(TargetComponent);
    const element = ngMocks.find(
      fixture.debugElement,
      TargetComponent,
    );
    expect(element).toBeDefined();
    expect(ngMocks.findInstance(TARGET_TOKEN)).toBeDefined();
    expect(ngMocks.findInstance(APP_INITIALIZER)).toBeDefined();
    expect(ngMocks.findInstance(APP_ID)).toBeDefined();
  });
});

describe('MockBuilderKeepsApplicationModule:mock', () => {
  beforeEach(() => MockBuilder(TargetComponent, TargetModule));

  it('should render', () => {
    const fixture = MockRender(TargetComponent);
    const element = ngMocks.find(
      fixture.debugElement,
      TargetComponent,
    );
    expect(element).toBeDefined();
    expect(ngMocks.findInstance(TARGET_TOKEN)).toEqual('');
    expect(ngMocks.findInstance(APP_ID)).toBeDefined();
  });
});
