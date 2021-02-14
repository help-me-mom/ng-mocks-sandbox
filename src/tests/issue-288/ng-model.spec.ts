import { Component, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MockBuilder, MockRender } from 'ng-mocks';

@Component({
  selector: 'target',
  template: ` <input [ngModel]="dateValue" /> `,
})
class TargetComponent {
  public dateValue = new Date();
}

@NgModule({
  declarations: [TargetComponent],
  imports: [FormsModule],
})
class TargetModule {}

// this test ensures that a mock FormsModule is not broken because of
// NgControl and how NgModel refers to it via useExisting.
describe('issue-288:ng-model', () => {
  beforeEach(() => MockBuilder(TargetComponent, TargetModule));

  it('does not fail when mocked', () => {
    expect(() => MockRender(TargetComponent)).not.toThrowError(
      `Cannot set property 'model' of undefined`,
    );
  });
});
