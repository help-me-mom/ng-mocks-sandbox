import {
  Component,
  forwardRef,
  Inject,
  Injectable,
  NgModule,
  Optional,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { MockBuilder, MockRender } from 'ng-mocks';

@Injectable({
  providedIn: 'root',
})
class RootService {
  public readonly name = 'RootService';
}

@Injectable()
class StandardService {
  public readonly name = 'StandardService';
}

@Injectable()
class ProvidedService {
  public readonly name = 'ProvidedService';
}

@NgModule()
class ServiceModule {
  public static forRoot() {
    return {
      ngModule: ServiceModule,
      providers: [ProvidedService],
    };
  }
}

@Injectable({
  providedIn: ServiceModule,
})
class ModuleService {
  public readonly name = 'ModuleService';
}

@Component({
  selector: 'target-312',
  standalone: false,
  template: 'target',
})
class TargetComponent {
  public constructor(
    @Optional() public readonly root: RootService,
    @Optional()
    @Inject(StandardService)
    public readonly standard: StandardService | null,
    @Optional() public readonly provided: ProvidedService,
    @Optional()
    @Inject(forwardRef(() => ModuleService))
    public readonly moduleService: ModuleService,
  ) {}
}

@NgModule({
  declarations: [TargetComponent],
  exports: [TargetComponent],
  imports: [ServiceModule.forRoot()],
})
class TargetModule {}

// the idea is that all the services have been injected besides StandardService.
// @see https://github.com/help-me-mom/ng-mocks/issues/312
describe('issue-312', () => {
  describe('default', () => {
    beforeEach(() =>
      TestBed.configureTestingModule({
        imports: [TargetModule],
      }).compileComponents(),
    );

    it('detects injected services', () => {
      const component =
        MockRender(TargetComponent).point.componentInstance;
      expect(component.root).toEqual(jasmine.any(RootService));
      expect(component.root.name).toEqual('RootService');
      expect(component.standard).toEqual(null);
      expect(component.provided).toEqual(
        jasmine.any(ProvidedService),
      );
      expect(component.provided.name).toEqual('ProvidedService');
      expect(component.moduleService).toEqual(
        jasmine.any(ModuleService),
      );
      expect(component.moduleService.name).toEqual('ModuleService');
    });
  });

  describe('keep', () => {
    beforeEach(() => MockBuilder(TargetComponent).keep(TargetModule));

    it('detects injected services', () => {
      const component =
        MockRender(TargetComponent).point.componentInstance;
      expect(component.root).toEqual(jasmine.any(RootService));
      expect(component.root.name).toEqual('RootService');
      expect(component.standard).toEqual(null);
      expect(component.provided).toEqual(
        jasmine.any(ProvidedService),
      );
      expect(component.provided.name).toEqual('ProvidedService');
      expect(component.moduleService).toEqual(
        jasmine.any(ModuleService),
      );
      expect(component.moduleService.name).toEqual('ModuleService');
    });
  });

  describe('mock', () => {
    beforeEach(() => MockBuilder(TargetComponent).mock(TargetModule));

    it('detects injected services', () => {
      const component =
        MockRender(TargetComponent).point.componentInstance;
      expect(component.root).toEqual(jasmine.any(RootService));
      expect(component.root.name).toBeUndefined();
      expect(component.standard).toEqual(null);
      expect(component.provided).toEqual(
        jasmine.any(ProvidedService),
      );
      expect(component.provided.name).toBeUndefined();
      expect(component.moduleService).toEqual(
        jasmine.any(ModuleService),
      );
      expect(component.moduleService.name).toBeUndefined();
    });
  });
});
