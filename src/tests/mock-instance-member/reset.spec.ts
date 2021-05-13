import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  MockComponent,
  MockInstance,
  MockRender,
  MockReset,
} from 'ng-mocks';

@Component({
  selector: 'target',
  template: '',
})
class TargetComponent {
  public global = '';
}

describe('mock-instance-member:reset', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      declarations: [MockComponent(TargetComponent)],
    }),
  );

  it('does not fail', () => {
    MockInstance(TargetComponent, 'global', 'mock');
    const component =
      MockRender(TargetComponent).point.componentInstance;
    expect(component.global).toEqual('mock');
    // Because of this call it resets all overloads
    // and would proper handling can cause failures in reporter.
    MockReset();
  });
});
