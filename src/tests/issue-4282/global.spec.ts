import {
  Component,
  inject,
  Injectable,
  NgModule,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { isMockOf, MockRender, ngMocks } from 'ng-mocks';

@Injectable({
  providedIn: 'root',
})
class TargetService {
  name = 'real';
}

@Component({
  selector: 'target-4282-global',
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

ngMocks.globalMock(TargetService);
ngMocks.defaultMock(TargetService, () => ({
  name: 'mock',
}));

// @see https://github.com/help-me-mom/ng-mocks/issues/4282
describe('issue-4282:global', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [TargetModule],
    }).compileComponents(),
  );

  it('mocks the injected service', () => {
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
