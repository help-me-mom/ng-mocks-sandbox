import { Component, Inject, InjectionToken } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import {
  MockBuilder,
  MockRender,
  NG_MOCKS_ROOT_PROVIDERS,
  ngMocks,
} from 'ng-mocks';

interface InjectedAbstraction {
  (): string;
  hello: () => number;
}

const TOKEN: InjectionToken<InjectedAbstraction> = new InjectionToken(
  'InjectedFn',
  {
    factory: () => {
      const fn: any = jasmine.createSpy(); // or jest.fn();
      fn.hello = jasmine.createSpy(); // or jest.fn();

      return fn;
    },
    providedIn: 'root',
  },
);

@Component({
  standalone: false,
  template: '',
})
class TestWithoutDecoratorComponent {
  public constructor(
    @Inject(TOKEN)
    public token: InjectedAbstraction,
  ) {}
}

@Component({
  standalone: false,
  template: '',
})
class TestWithDecoratorComponent {
  public constructor(
    @Inject(TOKEN)
    public token: InjectedAbstraction,
  ) {}
}

ngMocks.defaultMock(
  TOKEN,
  () => jasmine.createSpy().and.returnValue('FOO') as any,
  // or jest.fn().mockReturnValue('FOO')) as any,
);

// @see https://github.com/help-me-mom/ng-mocks/issues/455
describe('issue-455:token', () => {
  describe('without inject decorator', () => {
    describe('using TestBed', () => {
      beforeEach(() =>
        TestBed.configureTestingModule({
          declarations: [TestWithoutDecoratorComponent],
        }),
      );

      it('should build properly but fails', () => {
        expect(() =>
          TestBed.createComponent(TestWithoutDecoratorComponent),
        ).not.toThrow();
      });
    });
  });

  describe('without inject decorator', () => {
    describe('using default mock', () => {
      beforeEach(() => MockBuilder(TestWithoutDecoratorComponent));

      it('should build properly but fails', () => {
        const fixture = MockRender(TestWithoutDecoratorComponent);
        expect(fixture.point.componentInstance.token()).toEqual(
          'FOO',
        );
        expect(
          fixture.point.componentInstance.token,
        ).toHaveBeenCalledTimes(1);
      });
    });

    describe('using explicit mock', () => {
      describe('without `precise` flag', () => {
        beforeEach(() =>
          MockBuilder(TestWithoutDecoratorComponent)
            .mock(
              TOKEN,
              jasmine.createSpy().and.returnValue('BAR') as any,
              // or jest.fn().mockReturnValue('BAR')) as any,
            )
            .keep(NG_MOCKS_ROOT_PROVIDERS),
        );

        it('should build properly but fails', () => {
          const fixture = MockRender(TestWithoutDecoratorComponent);
          expect(fixture.point.componentInstance.token()).toEqual(
            'BAR',
          );
          expect(
            fixture.point.componentInstance.token,
          ).toHaveBeenCalledTimes(1);
        });
      });

      describe('with `precise` flag', () => {
        beforeEach(() =>
          MockBuilder(TestWithoutDecoratorComponent)
            .mock(
              TOKEN as any,
              jasmine.createSpy().and.returnValue('BAR') as any,
              // or jest.fn().mockReturnValue('BAR')) as any,
              { precise: true },
            )
            .keep(NG_MOCKS_ROOT_PROVIDERS),
        );

        it('should build properly and succeed', () => {
          const fixture = MockRender(TestWithoutDecoratorComponent);
          expect(fixture.point.componentInstance.token()).toEqual(
            'BAR',
          );
          expect(
            fixture.point.componentInstance.token,
          ).toHaveBeenCalledTimes(1);
        });
      });
    });
  });

  describe('with inject decorator', () => {
    describe('with provide', () => {
      beforeEach(() =>
        MockBuilder(TestWithDecoratorComponent).provide({
          provide: TOKEN,
          useFactory: () =>
            jasmine.createSpy().and.returnValue('QUX'),
          // or jest.fn().mockReturnValue('QUX'),
        }),
      );

      it('should build properly and succeed', () => {
        const fixture = MockRender(TestWithDecoratorComponent);
        expect(fixture.point.componentInstance.token()).toEqual(
          'QUX',
        );
        expect(
          fixture.point.componentInstance.token,
        ).toHaveBeenCalledTimes(1);
      });
    });
  });
});
