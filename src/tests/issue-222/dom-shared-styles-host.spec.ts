import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { Component, NgModule } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

@Component({
  animations: [
    trigger('openClose', [
      state(
        'open',
        style({
          backgroundColor: 'yellow',
          height: '200px',
          opacity: 1,
        }),
      ),
      state(
        'closed',
        style({
          backgroundColor: 'green',
          height: '100px',
          opacity: 0.5,
        }),
      ),
      transition('open => closed', [animate('1s')]),
      transition('closed => open', [animate('0.5s')]),
    ]),
  ],
  selector: 'target',
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
  imports: [BrowserModule, BrowserAnimationsModule],
})
class TargetModule {}

describe('issue-222:DomSharedStylesHost:mock', () => {
  beforeEach(() => MockBuilder(TargetComponent, TargetModule));

  it('correctly handles DomSharedStylesHost in a mock module', () => {
    const fixture = MockRender(TargetComponent);
    expect(fixture.nativeElement.innerHTML).toContain(
      'The box is now Open!',
    );
    // Animations are replaced with a mock copy, therefore no styles.
    expect(fixture.nativeElement.innerHTML).not.toContain('yellow');
  });
});

describe('issue-222:DomSharedStylesHost:keep', () => {
  beforeEach(() => MockBuilder(TargetComponent).keep(TargetModule));

  it('correctly handles DomSharedStylesHost in a kept module', () => {
    const fixture = MockRender(TargetComponent);
    expect(fixture.nativeElement.innerHTML).toContain(
      'The box is now Open!',
    );
    // Animations are kept, therefore we should get styles.
    expect(fixture.nativeElement.innerHTML).toContain('yellow');
  });
});

describe('issue-222:DomSharedStylesHost:guts', () => {
  beforeEach(() =>
    TestBed.configureTestingModule(
      ngMocks.guts(TargetComponent, TargetModule),
    ).compileComponents(),
  );

  it('correctly handles DomSharedStylesHost in a mock module', () => {
    const fixture = MockRender(TargetComponent);
    expect(fixture.nativeElement.innerHTML).toContain(
      'The box is now Open!',
    );
    // Animations are replaced with a mock copy, therefore no styles.
    expect(fixture.nativeElement.innerHTML).not.toContain('yellow');
  });
});
