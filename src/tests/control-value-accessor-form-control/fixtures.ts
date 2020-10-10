import { CommonModule } from '@angular/common';
import { Component, forwardRef, NgModule } from '@angular/core';
import { ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'target',
  template: '<control [formControl]="control"></control>',
})
export class TargetComponent {
  public readonly control = new FormControl();
}

@Component({
  providers: [
    {
      multi: true,
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ControlComponent),
    },
  ],
  selector: 'control',
  template: '',
})
export class ControlComponent implements ControlValueAccessor {
  public isDisabled = false;
  public value: any;
  public change: any = () => undefined;

  changeTouch(): void {
    this.touch();
  }

  changeValue(obj: any): void {
    this.change(obj);
  }

  registerOnChange(fn: any): void {
    this.change = fn;
  }

  registerOnTouched(fn: any): void {
    this.touch = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
  }

  public touch: any = () => undefined;

  writeValue(obj: any): void {
    this.value = obj;
  }
}

@NgModule({
  declarations: [TargetComponent, ControlComponent],
  exports: [TargetComponent],
  imports: [CommonModule, ReactiveFormsModule],
})
export class TargetModule {}
