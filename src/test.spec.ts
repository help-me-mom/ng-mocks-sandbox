import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  NgModule,
  Output,
} from '@angular/core';
import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// you can check more examples in src/e2e.ts
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

@Component({
  selector: 'app-target',
  template: `<a (click)="click.emit()">name: {{ name }}</a>`,
})
class TargetComponent {
  @Input() public readonly name: string = '';
  @Output()
  public readonly click: EventEmitter<void> = new EventEmitter();
}
@NgModule({
  imports: [CommonModule],
  declarations: [TargetComponent],
})
class TargetModule {}

describe('my sandbox', () => {
  beforeEach(() => MockBuilder(TargetComponent, TargetModule));

  it('should do something', () => {
    const spy = jasmine.createSpy();
    const fixture = MockRender(TargetComponent, {
      name: 'sandbox',
      click: spy,
    });
    expect(fixture.point.nativeElement.innerHTML).toContain(
      'name: sandbox',
    );

    const link = ngMocks.find(fixture.debugElement, 'a');
    expect(spy).not.toHaveBeenCalled();
    link.triggerEventHandler('click', null);
    expect(spy).toHaveBeenCalled();
  });
});
