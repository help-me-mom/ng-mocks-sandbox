import {
  animate,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  NgModule,
  RendererFactory2,
} from '@angular/core';
import { fakeAsync, flush, tick } from '@angular/core/testing';
import {
  BrowserAnimationsModule,
  NoopAnimationsModule,
} from '@angular/platform-browser/animations';

import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

@Component({
  animations: [
    trigger('state', [
      transition('void => *', [
        style({
          backgroundColor: '#000',
          color: '#fff',
          height: 0,
        }),
        animate(10 * 1000, style({ height: 100 })),
      ]),
    ]),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'target-641',
  standalone: false,
  template: `<div @state (@state.done)="show = true">
    <span *ngIf="show">target</span>
  </div>`,
})
class TargetComponent {
  public show = false;
}

@NgModule({
  declarations: [TargetComponent],
  imports: [CommonModule, BrowserAnimationsModule],
})
class TargetModule {}

// @see https://github.com/help-me-mom/ng-mocks/issues/641
describe('issue-641', () => {
  it('requires Angular < 19', () => {
    expect(true).toBeTruthy();
  });
});
