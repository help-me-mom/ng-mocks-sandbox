import {
  Component,
  Injectable,
  NgModule,
  Pipe,
  PipeTransform,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';

import {
  isMockOf,
  MockBuilder,
  MockComponent,
  MockPipe,
  MockRender,
  ngMocks,
} from 'ng-mocks';

@Injectable()
class StandaloneService {}

@NgModule({
  providers: [StandaloneService],
})
class StandaloneModule {}

@Pipe(
  {
    name: 'standalone',
    standalone: true,
  } as never /* TODO: remove after upgrade to a14 */,
)
class StandalonePipe implements PipeTransform {
  transform(): string {
    return this.constructor.name;
  }
}

@Component(
  {
    selector: 'standalone',
    template: 'service:{{ service.constructor.name }}',
    standalone: true,
    imports: [StandaloneModule, StandalonePipe],
  } as never /* TODO: remove after upgrade to a14 */,
)
class StandaloneComponent {
  constructor(public readonly service: StandaloneService) {}
}

@Component(
  {
    selector: 'empty',
    template: 'empty',
    standalone: true,
    imports: [], // this is the thing we assert: an empty imports array
  } as never /* TODO: remove after upgrade to a14 */,
)
class EmptyComponent {}

@Component(
  {
    selector: 'target',
    template:
      '<standalone></standalone> pipe:{{ null | standalone }}',
    standalone: true,
    imports: [StandaloneComponent, StandalonePipe, EmptyComponent],
  } as never /* TODO: remove after upgrade to a14 */,
)
class TargetComponent {}

describe('issue-2687', () => {
  describe('real', () => {
    beforeEach(() =>
      TestBed.configureTestingModule({
        imports: [TargetComponent, StandaloneComponent],
      }).compileComponents(),
    );

    it('renders StandaloneComponent', () => {
      const fixture = TestBed.createComponent(StandaloneComponent);
      fixture.detectChanges();
      expect(ngMocks.formatHtml(fixture)).toEqual(
        'service:StandaloneService',
      );
    });

    it('renders TargetComponent', () => {
      const fixture = TestBed.createComponent(TargetComponent);
      fixture.detectChanges();
      expect(ngMocks.formatHtml(fixture)).toEqual(
        '<standalone>service:StandaloneService</standalone> pipe:StandalonePipe',
      );
    });
  });

  describe('override', () => {
    beforeEach(() =>
      TestBed.configureTestingModule({
        imports: [TargetComponent, StandaloneComponent],
      }).compileComponents(),
    );

    beforeEach(() => {
      TestBed.overrideComponent(TargetComponent, {
        set: {
          imports: [
            MockComponent(StandaloneComponent),
            MockPipe(StandalonePipe),
          ],
        } as never /* TODO: remove after upgrade to a14 */,
      });
    });

    afterAll(() => {
      TestBed.overrideComponent(TargetComponent, {
        set: {
          imports: [StandaloneComponent, StandalonePipe],
        } as never /* TODO: remove after upgrade to a14 */,
      });
    });

    it('renders TargetComponent', () => {
      const fixture = TestBed.createComponent(TargetComponent);
      fixture.detectChanges();
      expect(ngMocks.formatHtml(fixture)).toEqual(
        '<standalone></standalone> pipe:',
      );

      const standaloneComponent = ngMocks.findInstance(
        fixture,
        StandaloneComponent,
      );
      expect(
        isMockOf(standaloneComponent, StandaloneComponent),
      ).toEqual(true);

      const standalonePipe = ngMocks.findInstance(
        fixture,
        StandalonePipe,
      );
      expect(isMockOf(standalonePipe, StandalonePipe)).toEqual(true);
    });
  });

  describe('.mock', () => {
    beforeEach(() => MockBuilder(TargetComponent));

    it('renders TargetComponent', () => {
      const fixture = MockRender(TargetComponent);
      expect(ngMocks.formatHtml(fixture)).toEqual(
        '<target><standalone></standalone> pipe:</target>',
      );
      expect(() =>
        ngMocks.findInstance(StandaloneComponent),
      ).not.toThrow();
      expect(() =>
        ngMocks.findInstance(StandalonePipe),
      ).not.toThrow();
    });
  });

  describe('.keep', () => {
    beforeEach(() =>
      MockBuilder(TargetComponent).keep(StandalonePipe),
    );

    it('renders TargetComponent', () => {
      const fixture = MockRender(TargetComponent);
      expect(ngMocks.formatHtml(fixture)).toEqual(
        '<target><standalone></standalone> pipe:StandalonePipe</target>',
      );
      expect(() =>
        ngMocks.findInstance(StandaloneComponent),
      ).not.toThrow();
      expect(() =>
        ngMocks.findInstance(StandalonePipe),
      ).not.toThrow();
    });
  });

  describe('StandaloneComponent:exclude', () => {
    beforeEach(() =>
      MockBuilder(TargetComponent).exclude(StandalonePipe),
    );

    it('renders TargetComponent', () => {
      expect(() => MockRender(TargetComponent)).toThrowError(
        /The pipe 'standalone' could not be found/,
      );
    });
  });
});
