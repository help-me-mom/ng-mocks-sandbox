import {
  Component,
  Injectable as InjectableSource,
  NgModule,
  VERSION,
} from '@angular/core';
import {
  MockBuilder,
  MockRender,
  NG_MOCKS_ROOT_PROVIDERS,
} from 'ng-mocks';

// Because of A5 we need to cast Injectable to any type.
// But because of A10+ we need to do it via a middle function.
function Injectable(...args: any[]): any {
  return InjectableSource(...args);
}

@Injectable({
  providedIn: 'root',
})
class Target1Service {
  public readonly name = 'target-1';
}

@Component({
  selector: 'target-1',
  template: `{{ service.name }}`,
})
class Target1Component {
  public constructor(public readonly service: Target1Service) {}
}

@NgModule({
  declarations: [Target1Component],
  exports: [Target1Component],
})
class Target1Module {}

@Injectable({
  providedIn: 'root',
})
class Target2Service {
  public readonly name = 'target-2';
}

@Component({
  selector: 'target-2',
  template: `{{ service.name }}`,
})
class Target2Component {
  public constructor(public readonly service: Target2Service) {}
}

@NgModule({
  declarations: [Target2Component],
  exports: [Target2Component],
})
class Target2Module {}

@NgModule({
  exports: [Target1Module, Target2Module],
  imports: [Target1Module, Target2Module],
})
class CombinedModule {}

describe('NG_MOCKS_ROOT_PROVIDERS', () => {
  beforeEach(() => {
    if (parseInt(VERSION.major, 10) <= 5) {
      pending('Need Angular > 5');
    }
  });

  describe('default for a kept module', () => {
    beforeEach(() =>
      MockBuilder(Target1Component, CombinedModule).keep(
        Target1Module,
      ),
    );

    it('keeps its global service', () => {
      const fixture = MockRender(Target1Component);
      expect(fixture.nativeElement.innerHTML).toEqual(
        '<target-1>target-1</target-1>',
      );
    });
  });

  describe('mock the token', () => {
    beforeEach(() =>
      MockBuilder(Target1Component, CombinedModule)
        .keep(Target1Module)
        .mock(NG_MOCKS_ROOT_PROVIDERS),
    );

    it('mocks global service for a kept module', () => {
      const fixture = MockRender(Target1Component);
      expect(fixture.nativeElement.innerHTML).toEqual(
        '<target-1></target-1>',
      );
    });
  });

  describe('default for a mock module', () => {
    beforeEach(() => MockBuilder(Target1Component, CombinedModule));

    it('mocks its global service', () => {
      const fixture = MockRender(Target1Component);
      expect(fixture.nativeElement.innerHTML).toEqual(
        '<target-1></target-1>',
      );
    });
  });

  describe('keep the token', () => {
    beforeEach(() =>
      MockBuilder(Target1Component, CombinedModule).keep(
        NG_MOCKS_ROOT_PROVIDERS,
      ),
    );

    it('keeps global service for a mock module', () => {
      const fixture = MockRender(Target1Component);
      expect(fixture.nativeElement.innerHTML).toEqual(
        '<target-1>target-1</target-1>',
      );
    });
  });
});
