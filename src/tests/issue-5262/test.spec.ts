import { InjectionToken, NgModule } from '@angular/core';

import { MockBuilder, MockRender } from 'ng-mocks';

const TOKEN = new InjectionToken('TOKEN');

@NgModule({
  providers: [
    {
      provide: TOKEN,
      useValue: (() => {
        const recursive: any = {
          index: 0,
        };
        recursive.parent = recursive;

        return recursive;
      })(),
    },
  ],
})
class TargetModule {}

// @see https://github.com/help-me-mom/ng-mocks/issues/5262
describe('issue-5262', () => {
  describe('mock', () => {
    beforeEach(() => MockBuilder(null, TargetModule));

    it('does not fail on recursion', () => {
      const token = MockRender(TOKEN);
      expect(token).toBeDefined();
    });
  });

  describe('keep', () => {
    beforeEach(() => MockBuilder(TOKEN, TargetModule));

    it('does not fail on recursion', () => {
      const token = MockRender(TOKEN);
      expect(token).toBeDefined();
    });
  });
});
