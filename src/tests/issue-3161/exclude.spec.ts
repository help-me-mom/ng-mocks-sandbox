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

ngMocks.globalExclude(TranslateModule);

@Component({
  selector: 'standalone',
  standalone: true,
  template: `{{ name | translate }}`,
  imports: [TranslateModule],
})
class StandaloneComponent {
  @Input() public readonly name: string = '';
}

// @see https://github.com/help-me-mom/ng-mocks/issues/3161
describe('issue-3161:exclude', () => {
  beforeEach(() => MockBuilder(StandaloneComponent));

  it('fails because of excluded module', () => {
    expect(() =>
      MockRender(StandaloneComponent, {
        name: 'sandbox',
      }),
    ).toThrowError(/The pipe 'translate' could not be found/);
  });
});
