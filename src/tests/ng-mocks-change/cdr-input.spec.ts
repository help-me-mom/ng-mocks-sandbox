// tslint:disable member-ordering

import { Component, HostListener, NgModule } from '@angular/core';
import {
  ControlValueAccessor,
  FormControl,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'cva',
  template: ` {{ show }} `,
})
class CvaComponent implements ControlValueAccessor {
  public onChange: any = () => undefined;
  public onTouched: any = () => undefined;
  public show: any = null;

  @HostListener('input', ['$event'])
  public onInput = (event: any) => {
    this.show = event.target.value;
    this.onChange(this.show);
  };

  public registerOnChange = (onChange: any) =>
    (this.onChange = onChange);
  public registerOnTouched = (onTouched: any) =>
    (this.onTouched = onTouched);

  public writeValue = (value: any) => {
    this.show = value;
  };
}

@Component({
  selector: 'target',
  template: `
    <cva
      [formControl]="control"
      class="form-control"
      ngDefaultControl
    ></cva>
    <cva [(ngModel)]="value" class="ng-model" ngDefaultControl></cva>
  `,
})
class TargetComponent {
  public control = new FormControl();
  public value: string | null = null;
}

@NgModule({
  declarations: [CvaComponent, TargetComponent],
  imports: [ReactiveFormsModule, FormsModule],
})
class MyModule {}

// checking how normal form works
describe('ng-mocks-change:cdr-input', () => {
  const dataSet: Array<[string, () => void]> = [
    ['real', () => MockBuilder(TargetComponent).keep(MyModule)],
    [
      'mock-vca',
      () =>
        MockBuilder(TargetComponent)
          .keep(MyModule)
          .mock(CvaComponent),
    ],
  ];
  for (const [label, init] of dataSet) {
    describe(label, () => {
      const destroy$ = new Subject<void>();

      beforeEach(init);

      afterAll(() => {
        destroy$.next();
        destroy$.complete();
      });

      it('correctly changes CVA', () => {
        const fixture = MockRender(TargetComponent);
        const component = fixture.point.componentInstance;
        const spy = jasmine.createSpy('valueChange');
        component.control.valueChanges
          .pipe(takeUntil(destroy$))
          .subscribe(spy);

        const formControl = ngMocks.find('.form-control');
        expect(ngMocks.formatHtml(formControl)).toEqual('');
        expect(ngMocks.formatHtml(formControl, true)).toContain(
          'class="form-control ng-untouched ng-pristine ng-valid"',
        );
        expect(spy).toHaveBeenCalledTimes(0);
        ngMocks.change(formControl, '123');
        expect(spy).toHaveBeenCalledTimes(1);
        expect(component.control.value).toEqual('123');
        expect(ngMocks.formatHtml(formControl)).toEqual('');
        expect(ngMocks.formatHtml(formControl, true)).toContain(
          'class="form-control ng-untouched ng-pristine ng-valid"',
        );

        // nothing should be rendered so far, but now we trigger the render
        fixture.detectChanges();
        if (label === 'real') {
          expect(ngMocks.formatHtml(formControl)).toEqual('123');
        }
        expect(ngMocks.formatHtml(formControl, true)).toContain(
          'class="form-control ng-valid ng-touched ng-dirty"',
        );

        const ngModel = ngMocks.find('.ng-model');
        expect(ngMocks.formatHtml(ngModel)).toEqual('');
        expect(ngMocks.formatHtml(ngModel, true)).toContain(
          'class="ng-model ng-untouched ng-pristine ng-valid"',
        );
        ngMocks.change(ngModel, '123');
        expect(component.value).toEqual('123');
        expect(ngMocks.formatHtml(ngModel)).toEqual('');
        expect(ngMocks.formatHtml(ngModel, true)).toContain(
          'class="ng-model ng-untouched ng-pristine ng-valid"',
        );

        // nothing should be rendered so far, but now we trigger the render
        fixture.detectChanges();
        if (label === 'real') {
          expect(ngMocks.formatHtml(ngModel)).toEqual('123');
        }
        expect(ngMocks.formatHtml(ngModel, true)).toContain(
          'class="ng-model ng-valid ng-touched ng-dirty"',
        );
      });
    });
  }
});

describe('ng-mocks-change:cdr-change:full-mock', () => {
  const destroy$ = new Subject<void>();

  beforeEach(() => MockBuilder(TargetComponent, MyModule));

  afterAll(() => {
    destroy$.next();
    destroy$.complete();
  });

  it('correctly changes CVA', () => {
    const fixture = MockRender(TargetComponent);
    const component = fixture.point.componentInstance;
    const spy = jasmine.createSpy('valueChange');
    component.control.valueChanges
      .pipe(takeUntil(destroy$))
      .subscribe(spy);

    const formControl = ngMocks.find('.form-control');
    expect(spy).toHaveBeenCalledTimes(0);
    ngMocks.change(formControl, '123');
    expect(spy).toHaveBeenCalledTimes(1);
    expect(component.control.value).toEqual('123');

    const ngModel = ngMocks.find('.ng-model');
    ngMocks.change(ngModel, '123');
    expect(component.value).toEqual('123');
  });
});
