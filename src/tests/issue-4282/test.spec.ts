import {
  Component,
  inject,
  Injectable,
  NgModule,
} from '@angular/core';

import { isMockOf, MockBuilder, MockRender, ngMocks } from 'ng-mocks';

@Injectable({
  providedIn: 'root',
})
class TargetService {
  name = 'real';
}

@Component({
  selector: 'target-4282',
  template: `{{ service.name }}`,
})
class TargetComponent {
  readonly service = inject(TargetService);
}

@NgModule({
  declarations: [TargetComponent],
  exports: [TargetComponent],
})
class TargetModule {}

// @see https://github.com/help-me-mom/ng-mocks/issues/4282
describe('issue-4282', () => {
  describe('default', () => {
    beforeEach(() => MockBuilder(TargetComponent, TargetModule));

    it('keeps the real service', () => {
      const fixture = MockRender(TargetComponent);
      expect(ngMocks.formatText(fixture)).toEqual('real');
      expect(
        isMockOf(
          fixture.point.componentInstance.service,
          TargetService,
        ),
      ).toEqual(false);
    });
  });

  describe('mock as chain', () => {
    beforeEach(() =>
      MockBuilder(TargetComponent, TargetModule).mock(TargetService),
    );

    it('mocks the service', () => {
      const fixture = MockRender(TargetComponent);
      expect(ngMocks.formatText(fixture)).toEqual('');
      expect(
        isMockOf(
          fixture.point.componentInstance.service,
          TargetService,
        ),
      ).toEqual(true);
    });
  });

  describe('mock as customized chain', () => {
    beforeEach(() =>
      MockBuilder(TargetComponent, TargetModule).mock(TargetService, {
        name: 'mock',
      }),
    );

    it('mocks the service', () => {
      const fixture = MockRender(TargetComponent);
      expect(ngMocks.formatText(fixture)).toEqual('mock');
      expect(
        isMockOf(
          fixture.point.componentInstance.service,
          TargetService,
        ),
      ).toEqual(true);
    });
  });

  describe('mock as main', () => {
    beforeEach(() =>
      MockBuilder(TargetComponent, [TargetModule, TargetService]),
    );

    it('mocks the service', () => {
      const fixture = MockRender(TargetComponent);
      expect(ngMocks.formatText(fixture)).toEqual('');
      expect(
        isMockOf(
          fixture.point.componentInstance.service,
          TargetService,
        ),
      ).toEqual(true);
    });
  });
});
