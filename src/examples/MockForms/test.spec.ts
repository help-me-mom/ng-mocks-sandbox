// tslint:disable strict-type-predicates

import { Component, forwardRef } from '@angular/core';
import {
  ControlValueAccessor,
  FormsModule,
  NG_VALUE_ACCESSOR,
} from '@angular/forms';
import {
  isMockControlValueAccessor,
  MockBuilder,
  MockInstance,
  MockRender,
  MockReset,
  ngMocks,
} from 'ng-mocks';

@Component({
  providers: [
    {
      multi: true,
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DependencyComponent),
    },
  ],
  selector: 'app-child',
  template: `dependency`,
})
class DependencyComponent implements ControlValueAccessor {
  public registerOnChange = (fn: any): void => fn;
  public registerOnTouched = (fn: any): void => fn;
  public writeValue = (obj: any): void => obj;
}

@Component({
  selector: 'tested',
  template: `
    <app-child
      [ngModel]="value"
      (ngModelChange)="value = $event"
    ></app-child>
  `,
})
class TestedComponent {
  public value: any;
}

describe('MockForms', () => {
  // That is our spy on writeValue calls.
  // With auto spy this code is not needed.
  const writeValue = jasmine.createSpy('writeValue');
  // in case of jest
  // const writeValue = jest.fn();

  // Because of early calls of writeValue, we need to install
  // the spy in the ctor call.
  beforeAll(() =>
    MockInstance(DependencyComponent, () => ({
      writeValue,
    })),
  );

  // To avoid influence in other tests
  // we need to reset MockInstance effects.
  afterAll(MockReset);

  beforeEach(() => {
    return MockBuilder(TestedComponent)
      .mock(DependencyComponent)
      .keep(FormsModule);
  });

  it('sends the correct value to the mock form component', async () => {
    const fixture = MockRender(TestedComponent);
    const component = fixture.point.componentInstance;

    // Let's find the mock form component.
    const mockControl = ngMocks.find(DependencyComponent)
      .componentInstance;

    // During initialization it should be called
    // with null.
    expect(writeValue).toHaveBeenCalledWith(null);

    // Let's simulate its change, like a user does it.
    if (isMockControlValueAccessor(mockControl)) {
      mockControl.__simulateChange('foo');
      fixture.detectChanges();
      await fixture.whenStable();
    }
    expect(component.value).toBe('foo');

    // Let's check that change on existing value
    // causes calls of `writeValue` on the mock component.
    component.value = 'bar';
    fixture.detectChanges();
    await fixture.whenStable();
    expect(writeValue).toHaveBeenCalledWith('bar');
  });
});
