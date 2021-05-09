import { Component, EventEmitter, Output } from '@angular/core';
import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

@Component({
  selector: 'target',
  template: 'target',
})
class TargetComponent {
  @Output() public readonly update = new EventEmitter<void>();
}

describe('ng-mocks-output:317', () => {
  beforeEach(() => MockBuilder(TargetComponent));

  it('finds by css selector', () => {
    const spy = jasmine.createSpy('update');
    MockRender(
      `<div data-label="div">1</div><target data-target="target" (update)="spy($event)"></target>`,
      { spy },
    );

    expect(spy).not.toHaveBeenCalled();
    ngMocks.output('target', 'update').emit();
    expect(spy).toHaveBeenCalledTimes(1);

    ngMocks.output(['data-target'], 'update').emit();
    expect(spy).toHaveBeenCalledTimes(2);

    ngMocks.output(['data-target', 'target'], 'update').emit();
    expect(spy).toHaveBeenCalledTimes(3);
  });
});
