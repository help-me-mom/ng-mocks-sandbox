import {
  Component,
  ElementRef,
  HostListener,
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
  selector: 'target-ng-mocks-trigger-focus',
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
  public focusListener: any;
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

  @HostListener('focus', ['$event'])
  public hostListenerClick(event: any) {
    this.focusListener = event;
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

describe('ng-mocks-trigger:focus', () => {
  beforeEach(() => MockBuilder(TargetComponent).keep(TargetModule));

  it('is able to focus for all subscribers via ngMocks.trigger with string', () => {
    const fixture = MockRender(TargetComponent);
    const component = fixture.point.componentInstance;
    expect(component.focusFromEvent).toBeUndefined();
    expect(component.focusTag).toBeUndefined();

    const debugElement = ngMocks.find('input');
    ngMocks.trigger(debugElement, 'focus', {
      x: 666,
      y: 777,
    });
    expect(component.focusTag).toEqual(
      jasmine.objectContaining({
        x: 666,
        y: 777,
      }),
    );
    expect(component.focusFromEvent).toBe(component.focusTag);

    expect(component.focusListener).toBeUndefined();
    ngMocks.trigger(fixture.point, 'focus');
    expect(component.focusListener).toBeDefined();
  });

  it('is able to focus for all subscribers via ngMocks.trigger with event', () => {
    const fixture = MockRender(TargetComponent);
    const component = fixture.point.componentInstance;
    expect(component.focusFromEvent).toBeUndefined();
    expect(component.focusTag).toBeUndefined();

    const debugElement = ngMocks.find('input');
    const event = ngMocks.event(
      'focus',
      {
        bubbles: false,
      },
      {
        x: 666,
        y: 777,
      },
    );
    ngMocks.trigger(debugElement, event);
    expect(component.focusTag).toEqual(
      jasmine.objectContaining({
        x: 666,
        y: 777,
      }),
    );
    expect(component.focusFromEvent).toBe(component.focusTag);

    expect(component.focusListener).toBeUndefined();
    ngMocks.trigger(fixture.point, event);
    expect(component.focusListener).toBeDefined();
  });
});
