import {
  Component,
  ElementRef,
  NgModule,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import * as rxjs from 'rxjs';
import { tap } from 'rxjs/operators';

import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';
import { fromEvent } from 'rxjs';

@Component({
  selector: 'target-ng-mocks-trigger',
  standalone: false,
  template: `
    <input
      [formControl]="control"
      (focus)="focusTag = $event"
      #element
    />
  `,
})
class TargetComponent implements OnDestroy {
  public readonly control = new FormControl();
  public focusFromEvent: any;
  public focusTag: any;

  private subscription?: rxjs.Subscription;

  @ViewChild('element')
  public set element(value: ElementRef) {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    this.subscription = fromEvent(value.nativeElement, 'focus')
      .pipe(
        tap(event => {
          this.focusFromEvent = event;
        }),
      )
      .subscribe();
  }

  public ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}

@NgModule({
  declarations: [TargetComponent],
  imports: [ReactiveFormsModule],
})
class TargetModule {}

describe('ng-mocks-trigger:test', () => {
  beforeEach(() => MockBuilder(TargetComponent).keep(TargetModule));

  it('throws on empty elements', () => {
    MockRender(TargetComponent);

    const debugElement = ngMocks.find('div', undefined);
    expect(() => ngMocks.trigger(debugElement, 'focus')).toThrowError(
      'Cannot trigger focus event undefined element',
    );

    expect(() =>
      ngMocks.trigger(debugElement, ngMocks.event('click')),
    ).toThrowError('Cannot trigger click event undefined element');
  });

  it('skips on disabled elements', () => {
    const fixture = MockRender(TargetComponent);
    const component = fixture.point.componentInstance;
    const debugElement = ngMocks.find('input');

    component.control.disable();
    fixture.detectChanges();
    ngMocks.trigger(debugElement, 'focus');
    expect(component.focusFromEvent).toBeUndefined();
    expect(component.focusTag).toBeUndefined();

    component.control.enable();
    fixture.detectChanges();
    ngMocks.trigger(debugElement, 'focus');
    expect(component.focusFromEvent).toBeDefined();
    expect(component.focusTag).toBeDefined();
  });
});
