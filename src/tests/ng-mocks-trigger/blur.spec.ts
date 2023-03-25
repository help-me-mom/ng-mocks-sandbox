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
  selector: 'target-ng-mocks-trigger-blur',
  template: `
    <input
      [formControl]="control"
      (blur)="blurTag = $event"
      #element
    />
  `,
})
class TargetComponent implements OnDestroy {
  public blurFromEvent: any;
  public blurListener: any;
  public blurTag: any;

  public readonly control = new FormControl('', {
    updateOn: 'blur',
  });

  private subscription?: rxjs.Subscription;

  @ViewChild('element')
  public set element(value: ElementRef) {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    this.subscription = fromEvent(value.nativeElement, 'blur')
      .pipe(
        tap(event => {
          this.blurFromEvent = event;
        }),
      )
      .subscribe();
  }

  @HostListener('blur', ['$event'])
  public hostListenerClick(event: any) {
    this.blurListener = event;
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

describe('ng-mocks-trigger:blur', () => {
  beforeEach(() => MockBuilder(TargetComponent).keep(TargetModule));

  it('is able to blur for all subscribers via ngMocks.trigger with string', () => {
    const fixture = MockRender(TargetComponent);
    const component = fixture.point.componentInstance;
    expect(component.blurFromEvent).toBeUndefined();
    expect(component.blurTag).toBeUndefined();

    const debugElement = ngMocks.find('input');
    ngMocks.trigger(debugElement, 'blur', {
      x: 666,
      y: 777,
    });
    expect(component.blurTag).toEqual(
      jasmine.objectContaining({
        x: 666,
        y: 777,
      }),
    );
    expect(component.blurFromEvent).toBe(component.blurTag);

    expect(component.blurListener).toBeUndefined();
    ngMocks.trigger(fixture.point, 'blur');
    expect(component.blurListener).toBeDefined();
  });

  it('is able to blur for all subscribers via ngMocks.trigger with event', () => {
    const fixture = MockRender(TargetComponent);
    const component = fixture.point.componentInstance;
    expect(component.blurFromEvent).toBeUndefined();
    expect(component.blurTag).toBeUndefined();

    const debugElement = ngMocks.find('input');
    const event = ngMocks.event(
      'blur',
      {
        bubbles: false,
      },
      {
        x: 666,
        y: 777,
      },
    );
    ngMocks.trigger(debugElement, event);
    expect(component.blurTag).toEqual(
      jasmine.objectContaining({
        x: 666,
        y: 777,
      }),
    );
    expect(component.blurFromEvent).toBe(component.blurTag);

    expect(component.blurListener).toBeUndefined();
    ngMocks.trigger(fixture.point, event);
    expect(component.blurListener).toBeDefined();
  });

  it('behaves right with input and blur', () => {
    const fixture = MockRender(TargetComponent);
    const component = fixture.point.componentInstance;
    expect(component.control.value).toEqual('');

    const debugElement = ngMocks.find('input');
    debugElement.nativeElement.value = '666';
    ngMocks.trigger(debugElement, 'input');
    ngMocks.trigger(debugElement, 'change');
    expect(component.control.value).toEqual('');

    ngMocks.trigger(debugElement.nativeElement, 'blur');
    expect(component.control.value).toEqual('666');
  });
});
