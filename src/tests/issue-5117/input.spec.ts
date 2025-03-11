import { Component, Directive, Input } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { isMockOf, MockBuilder, MockRender, ngMocks } from 'ng-mocks';

@Directive({
  selector: 'input',
})
class InputDirective {
  @Input() public readonly input: string | undefined = undefined;

  public input5117input() {}
}

@Component({
  selector: 'target',
  standalone: false,
  template: '',
  hostDirectives: [
    {
      directive: InputDirective,
      inputs: ['input: customInput'],
    },
  ],
})
class TargetComponent {
  @Input() public readonly input: string | undefined = undefined;

  public target5117input() {}
}

describe('issue-5117:input', () => {
  describe('real', () => {
    beforeEach(() =>
      TestBed.configureTestingModule({
        declarations: [TargetComponent],
      }).compileComponents(),
    );

    it('binds host directives correctly', () => {
      const input = 'input';
      const customInput = 'customInput';

      MockRender(TargetComponent, {
        input,
        customInput,
      });

      // inputs are exposed
      const inputDirective = ngMocks.findInstance(InputDirective);
      expect(isMockOf(inputDirective, InputDirective)).toEqual(false); // real
      expect(inputDirective.input).toEqual(customInput); // a bug in angular? nested input
    });
  });

  describe('mock', () => {
    beforeEach(() =>
      MockBuilder([TargetComponent], [InputDirective]),
    );

    it('binds host directives correctly', () => {
      const input = 'input';
      const customInput = 'customInput';

      MockRender(TargetComponent, {
        input,
        customInput,
      });

      // inputs are exposed
      const inputDirective = ngMocks.findInstance(InputDirective);
      expect(isMockOf(inputDirective, InputDirective)).toEqual(true); // mock
      expect(inputDirective.input).toEqual(customInput); // a bug in angular? nested input
    });
  });
});
