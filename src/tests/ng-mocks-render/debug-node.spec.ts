import { CommonModule } from '@angular/common';
import {
  Component,
  ContentChild,
  Directive,
  Input,
  NgModule,
  TemplateRef,
} from '@angular/core';

import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

@Directive({
  selector: '[tpl]',
  standalone: false,
})
class TplDirective {
  @Input('tpl') public readonly name: string | null = null;

  public constructor(public readonly tpl: TemplateRef<any>) {}
}

@Directive({
  providers: [
    {
      provide: TplDirective,
      useExisting: MockDirective,
    },
  ],
  selector: '[mock]',
  standalone: false,
})
class MockDirective {
  public constructor(public readonly tpl: TemplateRef<any>) {}
}

@Component({
  selector: 'target-ng-mocks-render-debug-node',
  standalone: false,
  template: `<mock-ng-mocks-render-debug-node
    ><ng-template mock
      >rendered-mock</ng-template
    ></mock-ng-mocks-render-debug-node
  >`,
})
class TargetComponent {}

@Component({
  selector: 'mock-ng-mocks-render-debug-node',
  standalone: false,
  template: '',
})
class MockComponent {
  @ContentChild(TplDirective)
  public readonly directive?: TplDirective;
}

@NgModule({
  declarations: [
    TargetComponent,
    MockComponent,
    MockDirective,
    TplDirective,
  ],
  imports: [CommonModule],
})
class TargetModule {}

describe('ng-mocks-render:debug-node', () => {
  beforeEach(() => MockBuilder(TargetComponent, TargetModule));

  it('renders and hides debugNode', () => {
    const fixture = MockRender(TargetComponent);
    const component = ngMocks.findInstance(MockComponent);
    expect(ngMocks.formatHtml(fixture)).toEqual(
      '<target-ng-mocks-render-debug-node><mock-ng-mocks-render-debug-node></mock-ng-mocks-render-debug-node></target-ng-mocks-render-debug-node>',
    );

    const mockEl = ngMocks.reveal(['mock']);
    ngMocks.render(component, mockEl);
    expect(ngMocks.formatHtml(fixture)).toEqual(
      '<target-ng-mocks-render-debug-node><mock-ng-mocks-render-debug-node>rendered-mock</mock-ng-mocks-render-debug-node></target-ng-mocks-render-debug-node>',
    );

    ngMocks.hide(component, mockEl);
    expect(ngMocks.formatHtml(fixture)).toEqual(
      '<target-ng-mocks-render-debug-node><mock-ng-mocks-render-debug-node></mock-ng-mocks-render-debug-node></target-ng-mocks-render-debug-node>',
    );

    expect(() =>
      ngMocks.render(component, fixture.debugElement),
    ).toThrowError(
      'Unknown template has been passed, only TemplateRef or a mock structural directive are supported',
    );
    expect(() =>
      ngMocks.hide(component, fixture.debugElement),
    ).toThrowError(
      'Unknown template has been passed, only TemplateRef or a mock structural directive are supported',
    );
  });
});
