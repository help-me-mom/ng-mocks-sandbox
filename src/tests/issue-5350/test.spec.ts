import {
  Component,
  Directive,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';

import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

// Angular 16 inputs can be objects which should be properly mocked.
describe('issue-5350', () => {
  @Directive()
  class TargetBase {
    @Input({
      alias: 'aInput1',
      required: true,
    })
    public input1: string | null = null;
    public targetBase5350() {}
  }

  @Component({
    selector: 'target',
    template: '{{ input1 }}{{ input2 }}',
  })
  class TargetComponent extends TargetBase {
    @Input({
      alias: 'aInput1',
      required: true,
    })
    public input1: string | null = null;
    @Input({
      alias: 'aInput2',
      required: true,
    })
    public input2: string | null = null;
    @Output('aOutput1')
    public output1 = new EventEmitter<void>();
    @Output('aOutput2')
    public output2 = new EventEmitter<void>();
    public target5350() {}
  }

  describe('real', () => {
    beforeEach(() => MockBuilder(TargetComponent, null));

    it('throws error', () => {
      const fixture = MockRender(TargetComponent, {
        aInput1: 'test',
      });
      expect(ngMocks.input(fixture.point, 'aInput1')).toEqual('test');
      expect(ngMocks.reveal(['aInput1', 'test'])).toBeDefined();
    });
  });

  describe('mock', () => {
    beforeEach(() => MockBuilder(null, TargetComponent));

    it('throws error', () => {
      const fixture = MockRender(TargetComponent, {
        aInput1: 'test',
      });
      expect(ngMocks.input(fixture.point, 'aInput1')).toEqual('test');
      expect(ngMocks.reveal(['aInput1', 'test'])).toBeDefined();
    });
  });
});
