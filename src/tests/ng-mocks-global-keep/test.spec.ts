import { Component, NgModule } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  MockBuilder,
  MockComponent,
  MockModule,
  MockRender,
  ngMocks,
} from 'ng-mocks';

@Component({
  selector: 'target',
  template: '{{ name }}',
})
class TargetComponent {
  public readonly name = 'target';
}

@Component({
  selector: 'target',
  template: '{{ name }}',
})
class FakeComponent {
  public readonly name = 'fake';
}

@NgModule({
  declarations: [TargetComponent],
  exports: [TargetComponent],
})
class TargetModule {}

ngMocks.globalKeep(TargetComponent);

describe('ng-mocks-global-keep', () => {
  ngMocks.throwOnConsole();

  describe('MockComponent', () => {
    beforeEach(() =>
      TestBed.configureTestingModule({
        declarations: [MockComponent(TargetComponent)],
      }),
    );

    it('works as usual', () => {
      const fixture = MockRender('<target></target>');
      expect(fixture.nativeElement.innerHTML).toEqual(
        '<target></target>',
      );
    });
  });

  describe('MockModule', () => {
    beforeEach(() =>
      TestBed.configureTestingModule({
        imports: [MockModule(TargetModule)],
      }),
    );

    it('keeps out of the box', () => {
      const fixture = MockRender('<target></target>');
      expect(fixture.nativeElement.innerHTML).toEqual(
        '<target>target</target>',
      );
    });
  });

  describe('ngMocks.guts:default', () => {
    beforeEach(() =>
      TestBed.configureTestingModule(
        ngMocks.guts(null, TargetModule),
      ).compileComponents(),
    );

    it('keeps out of the box', () => {
      const fixture = MockRender('<target></target>');
      expect(fixture.nativeElement.innerHTML).toEqual(
        '<target>target</target>',
      );
    });
  });

  describe('ngMocks.guts:exclude', () => {
    beforeEach(() =>
      TestBed.configureTestingModule(
        ngMocks.guts(null, TargetModule, TargetComponent),
      ).compileComponents(),
    );

    it('switches to exclude', () => {
      expect(() => MockRender('<target></target>')).toThrow();
    });
  });

  describe('ngMocks.guts:mock', () => {
    beforeEach(() =>
      TestBed.configureTestingModule(
        ngMocks.guts(null, [TargetModule, TargetComponent]),
      ).compileComponents(),
    );

    it('switches to mock', () => {
      const fixture = MockRender('<target></target>');
      expect(fixture.nativeElement.innerHTML).toEqual(
        '<target></target>',
      );
    });
  });

  describe('MockBuilder:default', () => {
    beforeEach(() => MockBuilder(null, TargetModule));

    it('keeps out of the box', () => {
      const fixture = MockRender('<target></target>');
      expect(fixture.nativeElement.innerHTML).toEqual(
        '<target>target</target>',
      );
    });
  });

  describe('MockBuilder:exclude', () => {
    beforeEach(() =>
      MockBuilder(null, TargetModule).exclude(TargetComponent),
    );

    it('switches to exclude', () => {
      expect(() => MockRender('<target></target>')).toThrow();
    });
  });

  describe('MockBuilder:mock', () => {
    beforeEach(() =>
      MockBuilder(null, TargetModule).mock(TargetComponent),
    );

    it('switches to mock', () => {
      const fixture = MockRender('<target></target>');
      expect(fixture.nativeElement.innerHTML).toEqual(
        '<target></target>',
      );
    });
  });

  describe('MockBuilder:replace', () => {
    beforeEach(() =>
      MockBuilder(null, TargetModule).replace(
        TargetComponent,
        FakeComponent,
      ),
    );

    it('switches to replace', () => {
      const fixture = MockRender('<target></target>');
      expect(fixture.nativeElement.innerHTML).toEqual(
        '<target>fake</target>',
      );
    });
  });
});
