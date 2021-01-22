import {
  Component,
  Directive,
  forwardRef,
  NgModule,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  ControlValueAccessor,
  FormControl,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
  ValidationErrors,
  Validator,
} from '@angular/forms';
import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

@Directive({
  providers: [
    {
      multi: true,
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TargetDirective),
    },
    {
      multi: true,
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => TargetDirective),
    },
  ],
  selector: '[target]',
})
export class TargetDirective
  implements ControlValueAccessor, Validator {
  public valRegisterOnChange: any;
  public valRegisterOnTouched: any;
  public valRegisterOnValidatorChange: any;
  public valSetDisabledState: any;
  public valValidate: any;
  public valWriteValue: any;

  public registerOnChange(fn: any): void {
    this.valRegisterOnChange = [fn];
  }

  public registerOnTouched(fn: any): void {
    this.valRegisterOnTouched = [fn];
  }

  public registerOnValidatorChange(fn: any): void {
    this.valRegisterOnValidatorChange = [fn];
  }

  public setDisabledState(state: boolean): void {
    this.valSetDisabledState = [state];
  }

  public validate(): ValidationErrors {
    this.valValidate = [];

    return {
      mock: true,
    };
  }

  public writeValue(value: any): void {
    this.valWriteValue = [value];
  }
}

@Component({
  selector: 'app-root',
  template: '<div [formControl]="control" target></div>',
})
export class RealComponent {
  public readonly control = new FormControl();
}

@NgModule({
  declarations: [TargetDirective, RealComponent],
  exports: [RealComponent],
  imports: [ReactiveFormsModule],
})
class TargetModule {}

// NG_VALIDATORS and NG_VALUE_ACCESSOR should work together without an issue.
// material style of @Self() @Optional() ngControl?: NgControl does not work and throws
// Error: Circular dep for MockOfMyFormControlComponent
describe('issue-167:directive:real', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [TargetModule],
    }).compileComponents(),
  );

  it('should create an instance', () => {
    const fixture = MockRender(RealComponent);

    const mock = ngMocks
      .find(fixture.debugElement, TargetDirective)
      .injector.get(TargetDirective);
    spyOn(mock, 'validate').and.returnValue({
      updated: true,
    });
    spyOn(mock, 'writeValue');

    fixture.point.componentInstance.control.setValue('updated');
    expect(mock.validate).toHaveBeenCalled();
    expect(mock.writeValue).toHaveBeenCalledWith('updated');
    expect(fixture.point.componentInstance.control.errors).toEqual({
      updated: true,
    });
  });
});

describe('issue-167:directive:mock', () => {
  beforeEach(() =>
    MockBuilder(RealComponent, TargetModule).keep(
      ReactiveFormsModule,
    ),
  );

  it('should create an instance', () => {
    const fixture = MockRender(RealComponent);

    const mock = ngMocks
      .find(fixture.debugElement, TargetDirective)
      .injector.get(TargetDirective);
    spyOn(mock, 'validate').and.returnValue({
      updated: true,
    });
    spyOn(mock, 'writeValue');

    fixture.point.componentInstance.control.setValue('updated');
    expect(mock.validate).toHaveBeenCalled();
    expect(mock.writeValue).toHaveBeenCalledWith('updated');
    expect(fixture.point.componentInstance.control.errors).toEqual({
      updated: true,
    });
  });
});
