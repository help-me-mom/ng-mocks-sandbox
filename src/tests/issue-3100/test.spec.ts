import {
  AfterViewInit,
  Component,
  Directive,
  ElementRef,
  Input,
} from '@angular/core';

import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

@Directive({
  selector: '[testDirective]',
})
class TestDirective implements AfterViewInit {
  @Input() color = 'red';

  constructor(private el: ElementRef) {}

  ngAfterViewInit(): void {
    this.el.nativeElement.style.backgroundColor = this.color;
  }
}

@Component({
  selector: 'app-target',
  template: `<a testDirective>name: {{ name }}</a>`,
  imports: [TestDirective],
})
class TargetComponent {
  @Input() public readonly name: string = '';
}

// @see https://github.com/help-me-mom/ng-mocks/issues/3100
describe('issue-3100', () => {
  beforeEach(() => MockBuilder(TargetComponent));

  it('should do something', () => {
    MockRender(TargetComponent, {
      name: 'sandbox',
    });

    expect(() => ngMocks.findInstance(TargetComponent)).not.toThrow();
    expect(() => ngMocks.findInstance(TestDirective)).not.toThrow();
  });
});
