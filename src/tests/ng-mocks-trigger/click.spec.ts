import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  HostListener,
  NgModule,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import * as rxjs from 'rxjs';
import { tap } from 'rxjs/operators';

import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';
import { fromEvent } from 'rxjs';

@Component({
  selector: 'target-ng-mocks-trigger-click',
  template: ' <div (click)="clickTag = $event" #element></div> ',
})
class TargetComponent implements OnDestroy {
  public clickFromEvent: any;
  public clickListener: any;
  public clickTag: any;

  private subscription?: rxjs.Subscription;

  @ViewChild('element')
  public set element(value: ElementRef) {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    this.subscription = fromEvent(value.nativeElement, 'click')
      .pipe(
        tap(event => {
          this.clickFromEvent = event;
        }),
      )
      .subscribe();
  }

  @HostListener('click', ['$event'])
  public hostListenerClick(event: any) {
    this.clickListener = event;
  }

  public ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}

@NgModule({
  declarations: [TargetComponent],
  imports: [CommonModule],
})
class TargetModule {}

describe('ng-mocks-trigger:click', () => {
  beforeEach(() => MockBuilder(TargetComponent).keep(TargetModule));

  it('is able to click for all subscribers via ngMocks.click', () => {
    const component =
      MockRender(TargetComponent).point.componentInstance;
    expect(component.clickFromEvent).toBeUndefined();
    expect(component.clickListener).toBeUndefined();
    expect(component.clickTag).toBeUndefined();

    const div = ngMocks.find('div');
    ngMocks.click(div, {
      x: 666,
      y: 777,
    });

    expect(component.clickListener).toEqual(
      jasmine.objectContaining({
        x: 666,
        y: 777,
      }),
    );
    expect(component.clickFromEvent).toBe(component.clickListener);
    expect(component.clickTag).toBe(component.clickListener);
  });

  it('is able to click for all subscribers via ngMocks.touch with string', () => {
    const component =
      MockRender(TargetComponent).point.componentInstance;
    expect(component.clickFromEvent).toBeUndefined();
    expect(component.clickListener).toBeUndefined();
    expect(component.clickTag).toBeUndefined();

    const div = ngMocks.find('div');
    ngMocks.trigger(div, 'click', {
      x: 666,
      y: 777,
    });

    expect(component.clickListener).toEqual(
      jasmine.objectContaining({
        x: 666,
        y: 777,
      }),
    );
    expect(component.clickFromEvent).toBe(component.clickListener);
    expect(component.clickTag).toBe(component.clickListener);
  });

  it('is able to click for all subscribers via ngMocks.touch with event', () => {
    const component =
      MockRender(TargetComponent).point.componentInstance;
    expect(component.clickFromEvent).toBeUndefined();
    expect(component.clickListener).toBeUndefined();
    expect(component.clickTag).toBeUndefined();

    const div = ngMocks.find('div');
    const event = ngMocks.event(
      'click',
      {
        bubbles: true,
      },
      {
        x: 666,
        y: 777,
      },
    );
    ngMocks.trigger(div, event);

    expect(component.clickListener).toEqual(
      jasmine.objectContaining({
        x: 666,
        y: 777,
      }),
    );
    expect(component.clickFromEvent).toBe(component.clickListener);
    expect(component.clickTag).toBe(component.clickListener);
  });
});
