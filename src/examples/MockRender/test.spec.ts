import { CommonModule } from '@angular/common';
import { Component, ContentChild, EventEmitter, Input, NgModule, Output, TemplateRef } from '@angular/core';
import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

@Component({
  selector: 'app-child',
  template: `dependency`,
})
export class DependencyComponent {
  @ContentChild('something', { static: false } as any)
  injectedSomething: TemplateRef<{}>;

  @Input()
  someInput = '';

  @Output()
  someOutput = new EventEmitter();
}

@NgModule({
  declarations: [DependencyComponent],
  imports: [CommonModule],
})
export class DependencyModule {}

@Component({
  selector: 'tested',
  template: ` <app-child [someInput]="value" (someOutput)="trigger($event)"></app-child> `,
})
export class TestedComponent {
  @Output()
  trigger = new EventEmitter();

  @Input()
  value1 = '';

  @Input()
  value2 = '';
}

describe('MockRender', () => {
  beforeEach(() => MockBuilder(TestedComponent, DependencyModule));

  it('renders template', () => {
    const spy = jasmine.createSpy();
    // in case of jest
    // const spy = jest.fn();

    const fixture = MockRender(
      `
        <tested
          (trigger)="myListener1($event)"
          [value1]="myParam1"
          value2="check"
        >
          <ng-template #header>
            something as ng-template
          </ng-template>
          something as ng-content
        </tested>
      `,
      {
        myListener1: spy,
        myParam1: 'something1',
      }
    );

    // ngMocks.input helps to get the current value of an input on
    // a related debugElement without knowing its owner.
    expect(ngMocks.input(fixture.point, 'value1')).toEqual('something1');
    expect(ngMocks.input(fixture.point, 'value2')).toEqual('check');

    // ngMocks.output does the same with outputs.
    ngMocks.output(fixture.point, 'trigger').emit('foo1');
    expect(spy).toHaveBeenCalledWith('foo1');
  });

  it('renders inputs and outputs automatically', () => {
    const spy = jasmine.createSpy();
    // Generates a template like:
    // <tested [value1]="value1" [value2]="value2"
    // (trigger)="trigger"></tested>.
    const fixture = MockRender(TestedComponent, {
      trigger: spy,
      value1: 'something2',
    });

    // Checking the inputs.
    expect(ngMocks.input(fixture.point, 'value1')).toEqual('something2');
    expect(ngMocks.input(fixture.point, 'value2')).toBeUndefined();

    // Checking the outputs.
    ngMocks.output(fixture.point, 'trigger').emit('foo2');
    expect(spy).toHaveBeenCalledWith('foo2');

    // checking that an updated value has been passed into
    // the testing component.
    fixture.componentInstance.value1 = 'updated';
    fixture.detectChanges();
    expect(ngMocks.input(fixture.point, 'value1')).toEqual('updated');
  });
});
