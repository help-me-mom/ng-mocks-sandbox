import {
  Component,
  ContentChild,
  EventEmitter,
  Input,
  Output,
  TemplateRef,
} from '@angular/core';
import { isMockOf, MockBuilder, MockRender, ngMocks } from 'ng-mocks';

import { staticFalse } from '../../tests';

@Component({
  selector: 'app-child',
  template: `child`,
})
class DependencyComponent {
  @ContentChild('something', staticFalse) public injectedSomething:
    | TemplateRef<{}>
    | undefined;

  @Input()
  public someInput = '';

  @Output()
  public someOutput = new EventEmitter();
}

@Component({
  selector: 'tested',
  template: `
    <app-child
      [someInput]="value"
      (someOutput)="trigger($event)"
    ></app-child>
  `,
})
class TestedComponent {
  public value = '';
  public trigger = (obj: any) => obj;
}

describe('MockComponent', () => {
  beforeEach(() => {
    return MockBuilder(TestedComponent).mock(DependencyComponent);
  });

  it('sends the correct value to the child input', () => {
    const fixture = MockRender(TestedComponent);
    const component = fixture.point.componentInstance;

    // The same as
    // fixture.debugElement.query(
    //   By.css('app-child')
    // ).componentInstance
    // but properly typed.
    const mockComponent = ngMocks.find<DependencyComponent>(
      'app-child',
    ).componentInstance;

    // Let's pretend that DependencyComponent has 'someInput' as
    // an input. TestedComponent sets its value via
    // `[someInput]="value"`. The input's value will be passed into
    // the mock component so you can assert on it.
    component.value = 'foo';
    fixture.detectChanges();

    // Thanks to ng-mocks, this is type safe.
    expect(mockComponent.someInput).toEqual('foo');
  });

  it('does something on an emit of the child component', () => {
    const fixture = MockRender(TestedComponent);
    const component = fixture.point.componentInstance;

    // The same as
    // fixture.debugElement.query(
    //   By.directive(DependencyComponent)
    // ).componentInstance
    // but properly typed.
    const mockComponent = ngMocks.find(DependencyComponent)
      .componentInstance;

    // Again, let's pretend DependencyComponent has an output
    // called 'someOutput'. TestedComponent listens on the output via
    // `(someOutput)="trigger($event)"`.
    // Let's install a spy and trigger the output.
    spyOn(component, 'trigger');
    mockComponent.someOutput.emit({
      payload: 'foo',
    });

    // Assert on the effect.
    expect(component.trigger).toHaveBeenCalledWith({
      payload: 'foo',
    });
  });

  it('renders something inside of the child component', () => {
    const localFixture = MockRender<DependencyComponent>(`
      <app-child>
        <p>inside content</p>
      </app-child>
    `);

    // We can access html directly asserting on some side effect.
    const mockNgContent = localFixture.point.nativeElement.innerHTML;
    expect(mockNgContent).toContain('<p>inside content</p>');
  });

  it('renders ContentChild of the child component', () => {
    const fixture = MockRender<DependencyComponent>(`
      <app-child>
        <ng-template #something>
          <p>inside template</p>
        </ng-template>
        <p>inside content</p>
      </app-child>
    `);

    // Injected ng-content rendered everything except templates.
    const mockNgContent = fixture.point.nativeElement.innerHTML;
    expect(mockNgContent).toContain('<p>inside content</p>');
    expect(mockNgContent).not.toContain('<p>inside template</p>');

    // Let's render the template. First, we need to assert that
    // componentInstance is a MockedComponent<T> to access
    // its `__render` method. `isMockOf` function helps here.
    const mockComponent = fixture.point.componentInstance;
    if (isMockOf(mockComponent, DependencyComponent, 'c')) {
      mockComponent.__render('something');
      fixture.detectChanges();
    }

    // The rendered template is wrapped by <div data-key="something">.
    // We can use this selector to assert exactly its content.
    const mockNgTemplate = ngMocks.find('[data-key="something"]')
      .nativeElement.innerHTML;
    expect(mockNgTemplate).toContain('<p>inside template</p>');
  });
});
