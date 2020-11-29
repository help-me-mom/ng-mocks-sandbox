// tslint:disable max-file-line-count

import {
  Component,
  Directive,
  forwardRef,
  Optional,
  Self,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  ControlValueAccessor,
  FormControl,
  FormGroup,
  NgControl,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
} from '@angular/forms';
import { MockBuilder, MockRender } from 'ng-mocks';

@Component({
  selector: 'actual-empty',
  template: '',
})
export class ActualEmptyComponent {}

@Component({
  selector: 'actual-injection',
  template: '',
})
export class ActualInjectionComponent
  implements ControlValueAccessor {
  protected value: any;

  public constructor(@Self() @Optional() ngControl: NgControl) {
    if (ngControl) {
      ngControl.valueAccessor = this;
    }
  }

  public registerOnChange(fn: any): void {
    this.change = fn;
  }

  public registerOnTouched(fn: any): void {
    this.touch = fn;
  }

  public writeValue(obj: any): void {
    this.value = obj;
  }

  protected change: any = () => undefined;
  protected touch: any = () => undefined;
}

@Component({
  providers: [
    {
      multi: true,
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ActualTokenComponent),
    },
  ],
  selector: 'actual-token',
  template: '',
})
export class ActualTokenComponent implements ControlValueAccessor {
  protected value: any;

  public registerOnChange(fn: any): void {
    this.change = fn;
  }

  public registerOnTouched(fn: any): void {
    this.touch = fn;
  }

  public writeValue(obj: any): void {
    this.value = obj;
  }

  protected change: any = () => undefined;
  protected touch: any = () => undefined;
}

@Directive({
  providers: [
    {
      multi: true,
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ActualTokenDirective),
    },
  ],
  selector: '[actualToken]',
})
export class ActualTokenDirective implements ControlValueAccessor {
  protected value: any;

  public registerOnChange(fn: any): void {
    this.change = fn;
  }

  public registerOnTouched(fn: any): void {
    this.touch = fn;
  }

  public writeValue(obj: any): void {
    this.value = obj;
  }

  protected change: any = () => undefined;
  protected touch: any = () => undefined;
}

describe('issue-157:real', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      declarations: [
        ActualEmptyComponent,
        ActualInjectionComponent,
        ActualTokenComponent,
        ActualTokenDirective,
      ],
      imports: [ReactiveFormsModule],
    }).compileComponents(),
  );

  it('does not throw on both declarations of valueAccessor', () => {
    expect(() =>
      MockRender(
        `
        <form [formGroup]="form">
          <actual-empty formControlName="field" actualToken></actual-empty>
          <actual-injection formControlName="field"></actual-injection>
          <actual-token formControlName="field"></actual-token>
        </form>
      `,
        {
          form: new FormGroup({
            field: new FormControl(),
          }),
        },
      ),
    ).not.toThrow();
  });

  it('throws on mix of NG_VALUE_ACCESSOR declarations', () => {
    expect(() =>
      MockRender(
        `
        <form [formGroup]="form">
          <actual-token formControlName="field" actualToken></actual-token>
        </form>
      `,
        {
          form: new FormGroup({
            field: new FormControl(),
          }),
        },
      ),
    ).toThrow();
  });

  it('does not throw when component does not provide NG_VALUE_ACCESSOR', () => {
    expect(() =>
      MockRender(
        `
        <form [formGroup]="form">
          <actual-injection formControlName="field" actualToken></actual-injection>
        </form>
      `,
        {
          form: new FormGroup({
            field: new FormControl(),
          }),
        },
      ),
    ).not.toThrow();
  });

  it('throws when NG_VALUE_ACCESSOR is not provided', () => {
    expect(() =>
      MockRender(
        `
        <form [formGroup]="form">
          <actual-empty formControlName="field"></actual-empty>
        </form>
      `,
        {
          form: new FormGroup({
            field: new FormControl(),
          }),
        },
      ),
    ).toThrow();
  });

  it('does not throw when NG_VALUE_ACCESSOR is provided on a normal tag', () => {
    expect(() =>
      MockRender(
        `
        <form [formGroup]="form">
          <div formControlName="field" actualToken></div>
        </form>
      `,
        {
          form: new FormGroup({
            field: new FormControl(),
          }),
        },
      ),
    ).not.toThrow();
  });

  it('throws when NG_VALUE_ACCESSOR is not provided on a normal tag', () => {
    expect(() =>
      MockRender(
        `
        <form [formGroup]="form">
          <div formControlName="field"></div>
        </form>
      `,
        {
          form: new FormGroup({
            field: new FormControl(),
          }),
        },
      ),
    ).toThrow();
  });
});

describe('issue-157:mock', () => {
  beforeEach(() =>
    MockBuilder(ReactiveFormsModule)
      .mock(ActualEmptyComponent)
      .mock(ActualInjectionComponent)
      .mock(ActualTokenComponent)
      .mock(ActualTokenDirective),
  );

  it('does not throw on both declarations of valueAccessor', () => {
    expect(() =>
      MockRender(
        `
        <form [formGroup]="form">
          <actual-empty formControlName="field" actualToken></actual-empty>
          <actual-injection formControlName="field"></actual-injection>
          <actual-token formControlName="field"></actual-token>
        </form>
      `,
        {
          form: new FormGroup({
            field: new FormControl(),
          }),
        },
      ),
    ).not.toThrow();
  });

  it('throws on mix of NG_VALUE_ACCESSOR declarations', () => {
    expect(() =>
      MockRender(
        `
        <form [formGroup]="form">
          <actual-token formControlName="field" actualToken></actual-token>
        </form>
      `,
        {
          form: new FormGroup({
            field: new FormControl(),
          }),
        },
      ),
    ).toThrow();
  });

  it('does not throw when component does not provide NG_VALUE_ACCESSOR', () => {
    expect(() =>
      MockRender(
        `
        <form [formGroup]="form">
          <actual-injection formControlName="field" actualToken></actual-injection>
        </form>
      `,
        {
          form: new FormGroup({
            field: new FormControl(),
          }),
        },
      ),
    ).not.toThrow();
  });

  it('throws when NG_VALUE_ACCESSOR is not provided', () => {
    expect(() =>
      MockRender(
        `
        <form [formGroup]="form">
          <actual-empty formControlName="field"></actual-empty>
        </form>
      `,
        {
          form: new FormGroup({
            field: new FormControl(),
          }),
        },
      ),
    ).toThrow();
  });

  it('does not throw when NG_VALUE_ACCESSOR is provided on a normal tag', () => {
    expect(() =>
      MockRender(
        `
        <form [formGroup]="form">
          <div formControlName="field" actualToken></div>
        </form>
      `,
        {
          form: new FormGroup({
            field: new FormControl(),
          }),
        },
      ),
    ).not.toThrow();
  });

  it('throws when NG_VALUE_ACCESSOR is not provided on a normal tag', () => {
    expect(() =>
      MockRender(
        `
        <form [formGroup]="form">
          <div formControlName="field"></div>
        </form>
      `,
        {
          form: new FormGroup({
            field: new FormControl(),
          }),
        },
      ),
    ).toThrow();
  });
});
