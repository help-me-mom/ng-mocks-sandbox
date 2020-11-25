import { Component, Injectable as InjectableSource, NgModule, Optional, Self, SkipSelf, VERSION } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MockBuilder, MockRender } from 'ng-mocks';

// Because of A5 we need to cast Injectable to any type.
// But because of A10+ we need to do it via a middle function.
function Injectable(...args: any[]): any {
  return InjectableSource(...args);
}

@Injectable({
  providedIn: 'root',
})
class Dep1Service {
  public readonly name = 'dep-1';
}

@Injectable({
  providedIn: 'root',
})
class Dep2Service {
  public readonly name = 'dep-2';
}

// Not root.
@Injectable()
class Dep3Service {
  public readonly name = 'dep-3';
}

@Injectable()
class TargetService {
  public constructor(
    public readonly service: Dep1Service,
    public readonly optional: Dep1Service,
    public readonly flag?: undefined,
  ) {}
}

@Component({
  selector: 'target',
  template: `
    "service:{{ service.service ? service.service.name : 'missed' }}" "optional:{{
      service.optional ? service.optional.name : 'missed'
    }}"
  `,
})
class TargetComponent {
  public constructor(public readonly service: TargetService) {}
}

@NgModule({
  declarations: [TargetComponent],
  exports: [TargetComponent],
  providers: [
    {
      provide: 'test',
      useValue: undefined,
    },
    {
      deps: [Dep2Service, [new Optional(), new SkipSelf(), new Self(), Dep3Service], 'test'],
      provide: TargetService,
      useClass: TargetService,
    },
  ],
})
class TargetModule {}

describe('provider-with-custom-dependencies', () => {
  beforeEach(() => {
    if (parseInt(VERSION.major, 10) <= 5) {
      pending('Need Angular > 5');
    }
  });

  describe('real', () => {
    beforeEach(() =>
      TestBed.configureTestingModule({
        imports: [TargetModule],
      }).compileComponents(),
    );

    it('creates component with custom dependencies', () => {
      const fixture = TestBed.createComponent(TargetComponent);
      fixture.detectChanges();
      // Injects root dependency correctly.
      expect(fixture.nativeElement.innerHTML).toContain('"service:dep-2"');
      // Skips unprovided local dependency.
      expect(fixture.nativeElement.innerHTML).toContain('"optional:missed"');
      // The dependency should not be provided in TestBed.
      expect(() => TestBed.get(Dep3Service)).toThrowError(/No provider for Dep3Service/);
    });
  });

  describe('mock-builder:mock', () => {
    beforeEach(() => MockBuilder(TargetComponent, TargetModule).keep(TargetService));

    it('creates component with mock custom dependencies', () => {
      const fixture = MockRender(TargetComponent);
      // Injects root dependency correctly, it is not missed, it is replaced with a mock copy.
      expect(fixture.nativeElement.innerHTML).toContain('"service:"');
      // Skips unprovided local dependency despite its mock copy.
      expect(fixture.nativeElement.innerHTML).toContain('"optional:missed"');
      // The dependency should not be provided in TestBed.
      expect(() => TestBed.get(Dep3Service)).toThrowError(/No provider for Dep3Service/);
    });
  });

  describe('mock-builder:keep', () => {
    beforeEach(() =>
      MockBuilder(TargetComponent, TargetModule).keep(TargetService).keep(Dep2Service, {
        dependency: true,
      }),
    );

    it('creates component with kept Dep2Service', () => {
      const fixture = MockRender(TargetComponent);
      // Injects root dependency correctly, it is not missed, it is replaced with a mock copy.
      expect(fixture.nativeElement.innerHTML).toContain('"service:dep-2"');
      // Skips unprovided local dependency despite its mock copy.
      expect(fixture.nativeElement.innerHTML).toContain('"optional:missed"');
      // The dependency should not be provided in TestBed.
      expect(() => TestBed.get(Dep3Service)).toThrowError(/No provider for Dep3Service/);
    });
  });
});
