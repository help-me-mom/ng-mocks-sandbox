import {
  Component,
  Directive,
  HostBinding,
  Input,
} from '@angular/core';

import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

@Directive({
  selector: 'host',
})
class HostDirective {
  @HostBinding('attr.name') @Input() input?: string;

  public hostTestHostDirective() {}
}

@Component({
  selector: 'target',
  hostDirectives: [
    {
      directive: HostDirective,
      inputs: ['input'],
    },
  ],
  standalone: false,
  template: 'target',
})
class TargetComponent {
  public targetTestHostDirective() {}
}

describe('TestHostDirective', () => {
  beforeEach(() => MockBuilder(HostDirective, TargetComponent));

  it('keeps host directives', () => {
    const fixture = MockRender(TargetComponent, { input: 'test' });

    const directive = ngMocks.findInstance(HostDirective);
    expect(directive.input).toEqual('test');
    expect(ngMocks.formatHtml(fixture)).toContain(' name="test"');
  });
});
