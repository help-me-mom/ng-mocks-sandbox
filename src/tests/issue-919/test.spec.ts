import { CommonModule } from '@angular/common';
import { Component, NgModule } from '@angular/core';
import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';
import { BehaviorSubject, Observable } from 'rxjs';

@Component({
  selector: 'target',
  template: `<ng-container *ngIf="context.data$ | async as data">{{
    data.value
  }}</ng-container>`,
})
class TargetComponent {
  public context:
    | {
        data$: Observable<{ value: string }>;
      }
    | any;
}

@NgModule({
  declarations: [TargetComponent],
  imports: [CommonModule],
})
class TargetModule {}

// The goal is to provide properties before the real render.
// @see https://github.com/ike18t/ng-mocks/issues/919
describe('issue-919', () => {
  beforeEach(() => MockBuilder(TargetComponent, TargetModule));

  it('allows to change the component before render', () => {
    const fixture = MockRender(TargetComponent, {}, false);
    fixture.point.componentInstance.context = {
      data$: new BehaviorSubject({ value: 'positive' }),
    };
    fixture.detectChanges();

    expect(ngMocks.formatText(fixture)).toEqual('positive');
  });

  it('fails on render', () => {
    expect(() => MockRender(TargetComponent)).toThrowError(/data\$/);
  });
});
