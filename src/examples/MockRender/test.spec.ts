// tslint:disable strict-type-predicates

import { CommonModule } from '@angular/common';
import {
  Component,
  ContentChild,
  EventEmitter,
  Input,
  NgModule,
  Output,
  TemplateRef,
} from '@angular/core';
import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

import { staticFalse } from '../../tests';

@Component({
  selector: 'app-child',
  template: `dependency`,
})
class DependencyComponent {
  @ContentChild('something', staticFalse)
  public injectedSomething?: TemplateRef<{}>;
  @Input() public someInput = '';
  @Output() public readonly someOutput = new EventEmitter();
}

@NgModule({
  declarations: [DependencyComponent],
  imports: [CommonModule],
})
class DependencyModule {}

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
  @Output() public readonly trigger = new EventEmitter();
  @Input() public value1 = '';
  @Input() public value2 = '';
}

describe('MockRender', () => {
  // Do not forget to return the promise of MockBuilder.
  beforeEach(() => MockBuilder(TestedComponent, DependencyModule));

  it('renders template', () => {
    const spy =
      typeof jest === 'undefined' ? jasmine.createSpy() : jest.fn();
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
      },
    );

    // ngMocks.input helps to get the current value of an input on
    // a related debugElement without knowing its owner.
    expect(ngMocks.input(fixture.point, 'value1')).toEqual(
      'something1',
    );
    expect(ngMocks.input(fixture.point, 'value2')).toEqual('check');

    // ngMocks.output does the same with outputs.
    ngMocks.output(fixture.point, 'trigger').emit('foo1');
    expect(spy).toHaveBeenCalledWith('foo1');
  });

  it('renders inputs and outputs automatically', () => {
    const spy =
      typeof jest === 'undefined' ? jasmine.createSpy() : jest.fn();
    // in case of jest
    // const logoClickSpy = jest.fn();

    // Generates a template like:
    // <tested [value1]="value1" [value2]="value2"
    // (trigger)="trigger"></tested>.
    const fixture = MockRender(TestedComponent, {
      trigger: spy,
      value1: 'something2',
    });

    // Checking the inputs.
    expect(ngMocks.input(fixture.point, 'value1')).toEqual(
      'something2',
    );
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
