import { Component, Injectable, NgModule } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MockBuilder, MockRender, NgModuleWithProviders } from 'ng-mocks';

@Injectable()
class DependencyService {
  private readonly name: string = 'dependency';

  public echo(): string {
    return this.name;
  }
}

@NgModule({})
class DependencyModule {
  public static withProviders(): NgModuleWithProviders<DependencyModule> {
    return {
      ngModule: DependencyModule,
      providers: [
        {
          provide: DependencyService,
          useValue: {
            echo: () => 'via-provider',
          },
        },
      ],
    };
  }

  public constructor(public readonly service: DependencyService) {}
}

@Component({
  selector: 'target',
  template: '{{ service.echo() }}',
})
class TargetComponent {
  public constructor(public readonly service: DependencyService) {}
}

@NgModule({
  declarations: [TargetComponent],
})
class TargetModule {}

describe('issue-197:with-providers:manually-injection', () => {
  beforeEach(async () => {
    const module = MockBuilder(TargetComponent, TargetModule).build();

    return TestBed.configureTestingModule({
      declarations: module.declarations,
      imports: [...(module.imports || []), DependencyModule.withProviders()],
      providers: module.providers,
    }).compileComponents();
  });

  it('creates component with provided dependencies', () => {
    const fixture = MockRender(TargetComponent);
    expect(fixture.nativeElement.innerHTML).toEqual('<target>via-provider</target>');
  });
});

describe('issue-197:with-providers:keep', () => {
  beforeEach(() => MockBuilder(TargetComponent, TargetModule).keep(DependencyModule.withProviders()));

  it('creates component with provided dependencies', () => {
    const fixture = MockRender(TargetComponent);

    expect(fixture.nativeElement.innerHTML).toEqual('<target>via-provider</target>');
  });
});

describe('issue-197:with-providers:mock', () => {
  beforeEach(() => MockBuilder(TargetComponent, TargetModule).mock(DependencyModule.withProviders()));

  it('creates component with provided dependencies', () => {
    const fixture = MockRender(TargetComponent);

    expect(fixture.nativeElement.innerHTML).toEqual('<target></target>');
  });
});
