import {
  Component,
  Input,
  NgModule,
  Pipe,
  PipeTransform,
} from '@angular/core';

import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

@Pipe({
  name: 'translate',
  standalone: false,
})
class TranslatePipe implements PipeTransform {
  transform(value: string) {
    return `${this.constructor.name}:real:${value}`;
  }
}

@NgModule({
  declarations: [TranslatePipe],
  exports: [TranslatePipe],
})
class TranslateModule {}

ngMocks.globalKeep(TranslateModule);

@Component({
  selector: 'standalone',
  template: `{{ name | translate }}`,
  imports: [TranslateModule],
})
class StandaloneComponent {
  @Input() public readonly name: string = '';
}

// @see https://github.com/help-me-mom/ng-mocks/issues/3161
describe('issue-3161:keep', () => {
  beforeEach(() => MockBuilder(StandaloneComponent));

  it('uses the original pipe', () => {
    const fixture = MockRender(StandaloneComponent, {
      name: 'sandbox',
    });

    expect(ngMocks.formatText(fixture)).toEqual(
      `${TranslatePipe.name}:real:sandbox`,
    );
  });
});
