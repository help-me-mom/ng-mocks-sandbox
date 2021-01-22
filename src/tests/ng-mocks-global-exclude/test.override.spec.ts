import { Component, NgModule } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MockModule, MockRender, ngMocks } from 'ng-mocks';

@Component({
  selector: 'target1',
  template: '{{ name }}',
})
class Target1Component {
  public readonly name = 'target1';
}

@Component({
  selector: 'target2',
  template: '{{ name }}',
})
class Target2Component {
  public readonly name = 'target2';
}

@NgModule({
  declarations: [Target1Component, Target2Component],
  exports: [Target1Component, Target2Component],
})
class TargetModule {}

describe('ng-mocks-global-exclude:override', () => {
  ngMocks.throwOnConsole();

  afterAll(() => {
    ngMocks.globalWipe(Target1Component);
    ngMocks.globalWipe(Target2Component);
  });

  describe('excluding Target1Component', () => {
    beforeEach(async () => {
      ngMocks.globalExclude(Target1Component);

      return TestBed.configureTestingModule({
        imports: [MockModule(TargetModule)],
      }).compileComponents();
    });

    it('cannot find Target1Component', () => {
      expect(() => MockRender('<target2></target2>')).not.toThrow();
      expect(() => MockRender('<target1></target1>')).toThrowError(
        /'target1' is not a known element/,
      );
    });
  });

  describe('excluding Target2Component', () => {
    beforeEach(async () => {
      ngMocks.globalExclude(Target2Component);

      return TestBed.configureTestingModule({
        imports: [MockModule(TargetModule)],
      }).compileComponents();
    });

    it('cannot find Target2Component too', () => {
      expect(() => MockRender('<target2></target2>')).toThrowError(
        /'target2' is not a known element/,
      );
    });
  });
});
