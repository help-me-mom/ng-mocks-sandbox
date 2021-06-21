import { Component, Inject, InjectionToken } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MockProvider, MockRender, ngMocks } from 'ng-mocks';

const TOKEN = new InjectionToken('TOKEN');

@Component({
  selector: 'target',
  template: '{{ value }}',
})
class TargetComponent {
  public constructor(@Inject(TOKEN) public readonly value: number) {}
}

describe('issue-721:before-all', () => {
  ngMocks.faster();

  let value = 0;
  beforeAll(() =>
    TestBed.configureTestingModule({
      declarations: [TargetComponent],
      providers: [MockProvider(TOKEN, (value += 1))],
    }).compileComponents(),
  );

  it('works right value=1', () => {
    expect(ngMocks.formatText(MockRender(TargetComponent))).toEqual(
      '1',
    );
  });

  it('works right value=1', () => {
    expect(ngMocks.formatText(MockRender(TargetComponent))).toEqual(
      '1',
    );
  });
});
