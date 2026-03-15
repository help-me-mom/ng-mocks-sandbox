import {
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { AnimationDriver } from '@angular/animations/browser';
import { Component, DebugElement, NgModule } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { BrowserModule } from '@angular/platform-browser';
import {
  BrowserAnimationsModule,
  NoopAnimationsModule,
} from '@angular/platform-browser/animations';

import {
  isMockOf,
  MockBuilder,
  MockComponent,
  MockModule,
  MockRender,
  ngMocks,
} from 'ng-mocks';

@Component({
  animations: [
    trigger('openClose', [
      state(
        'open',
        style({
          opacity: 0,
        }),
      ),
      state(
        'closed',
        style({
          opacity: 1,
        }),
      ),
      transition('open => closed', []),
      transition('closed => open', []),
    ]),
  ],
  selector: 'target-1377',
  standalone: false,
  template: `
    <div [@openClose]="isOpen ? 'open' : 'closed'">
      The box is now {{ isOpen ? 'Open' : 'Closed' }}!
    </div>
  `,
})
class TargetComponent {
  public isOpen = true;

  public toggle() {
    this.isOpen = !this.isOpen;
  }
}

@NgModule({
  declarations: [TargetComponent],
  exports: [TargetComponent],
  imports: [BrowserModule, BrowserAnimationsModule],
})
class TargetModule {}

const expectBrowserAnimations = async () => {
  const fixture = MockRender(TargetComponent);
  const driver = fixture.point.injector.get(AnimationDriver);
  // the browser provider
  // Skipping the check for IE and react-jsdom
  if (
    typeof (Element as any) !== 'undefined' &&
    typeof (Element as any).prototype.animate === 'function'
  ) {
    expect(driver.constructor.name).not.toMatch(
      /_?NoopAnimationDriver$/,
    );
  }
  expect((driver as any).__ngMocks).toBeUndefined();

  {
    const div = ngMocks.find<DebugElement>('div');
    expect(ngMocks.formatText(div)).toContain('Open!');
    expect(div.nativeElement.style['opacity']).toEqual('0');
  }

  fixture.point.componentInstance.toggle();
  fixture.detectChanges();
  await fixture.whenStable();

  {
    const div = ngMocks.find<DebugElement>('div');
    expect(ngMocks.formatText(div)).toContain('Closed!');
    expect(div.nativeElement.style['opacity']).toEqual('1');
  }
};

const expectNoopAnimations = async () => {
  const fixture = MockRender(TargetComponent);
  const driver = fixture.point.injector.get(AnimationDriver);
  // the noop provider
  expect(driver.constructor.name).toMatch(/_?NoopAnimationDriver$/);
  expect((driver as any).__ngMocks).toBeUndefined();

  {
    const div = ngMocks.find<DebugElement>('div');
    expect(ngMocks.formatText(div)).toContain('Open!');
    expect(div.nativeElement.style['opacity']).toEqual('0');
  }

  fixture.point.componentInstance.toggle();
  fixture.detectChanges();
  await fixture.whenStable();

  {
    const div = ngMocks.find<DebugElement>('div');
    expect(ngMocks.formatText(div)).toContain('Closed!');
    expect(div.nativeElement.style['opacity']).toEqual('1');
  }
};

const expectNoAnimations = async () => {
  const fixture = MockRender(TargetComponent);
  const driver = fixture.point.injector.get(AnimationDriver);
  // the mock provider
  expect((driver as any).__ngMocks).toEqual(true);

  {
    const div = ngMocks.find<DebugElement>('div');
    expect(ngMocks.formatText(div)).toContain('Open!');
    expect(div.nativeElement.style['opacity']).toEqual('');
  }

  fixture.point.componentInstance.toggle();
  fixture.detectChanges();
  await fixture.whenStable();

  {
    const div = ngMocks.find<DebugElement>('div');
    expect(ngMocks.formatText(div)).toContain('Closed!');
    expect(div.nativeElement.style['opacity']).toEqual('');
  }
};

const expectThrow = () => {
  expect(() => MockRender(TargetComponent)).toThrowError(
    /BrowserAnimationsModule/,
  );
};

const expectEmpty = () => {
  const fixture = MockRender(TargetComponent);

  expect(ngMocks.formatHtml(fixture)).toEqual(
    '<target-1377></target-1377>',
  );
  expect(
    isMockOf(fixture.point.componentInstance, TargetComponent, 'c'),
  ).toEqual(true);
};

// @see https://github.com/help-me-mom/ng-mocks/issues/1377
describe('issue-1377', () => {
  it('requires Angular < 19', () => {
    expect(true).toBeTruthy();
  });
});
