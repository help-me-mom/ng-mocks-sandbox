import { Component, Inject, InjectionToken } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  MockBuilder,
  MockRender,
  NG_MOCKS_ROOT_PROVIDERS,
  ngMocks,
} from 'ng-mocks';

interface InjectedFn {
  (): string;
  hello: () => number;
}

const injectedFn: InjectionToken<InjectedFn> =
  new (InjectionToken as any)('InjectedFn', {
    factory: () => {
      const fn: any = jasmine.createSpy(); // or jest.fn();
      fn.hello = jasmine.createSpy(); // or jest.fn();

      return fn;
    },
    providedIn: 'root',
  });

@Component({ template: '' })
export class TestWithoutDecoratorComponent {
  public constructor(
    @Inject(injectedFn) public myInjectedFn: InjectedFn,
  ) {}
}

@Component({ template: '' })
export class TestWithDecoratorComponent {
  public constructor(
    @Inject(injectedFn) public myInjectedFn: InjectedFn,
  ) {}
}

ngMocks.defaultMock(
  injectedFn,
  () => jasmine.createSpy().and.returnValue('FOO') as any,
);

// @see https://github.com/ike18t/ng-mocks/issues/455
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
        expect(
          fixture.point.componentInstance.myInjectedFn(),
        ).toEqual('FOO');
        expect(
          fixture.point.componentInstance.myInjectedFn,
        ).toHaveBeenCalledTimes(1);
      });
    });

    describe('using explicit mock', () => {
      describe('without `precise` flag', () => {
        beforeEach(() =>
          MockBuilder(TestWithoutDecoratorComponent)
            .mock(
              injectedFn,
              jasmine.createSpy().and.returnValue('BAR') as any,
              // or jest.fn().mockReturnValue('BAR')) as any,
            )
            .keep(NG_MOCKS_ROOT_PROVIDERS),
        );

        it('should build properly but fails', () => {
          const fixture = MockRender(TestWithoutDecoratorComponent);
          expect(
            fixture.point.componentInstance.myInjectedFn(),
          ).toEqual('BAR');
          expect(
            fixture.point.componentInstance.myInjectedFn,
          ).toHaveBeenCalledTimes(1);
        });
      });

      describe('with `precise` flag', () => {
        beforeEach(() =>
          MockBuilder(TestWithoutDecoratorComponent)
            .mock(
              injectedFn as any,
              jasmine.createSpy().and.returnValue('BAR') as any,
              // or jest.fn().mockReturnValue('BAR')) as any,
              { precise: true },
            )
            .keep(NG_MOCKS_ROOT_PROVIDERS),
        );

        it('should build properly and succeed', () => {
          const fixture = MockRender(TestWithoutDecoratorComponent);
          expect(
            fixture.point.componentInstance.myInjectedFn(),
          ).toEqual('BAR');
          expect(
            fixture.point.componentInstance.myInjectedFn,
          ).toHaveBeenCalledTimes(1);
        });
      });
    });
  });

  describe('with inject decorator', () => {
    describe('with provide', () => {
      beforeEach(() =>
        MockBuilder(TestWithDecoratorComponent).provide({
          provide: injectedFn,
          useFactory: () =>
            jasmine.createSpy().and.returnValue('QUX'),
          // or jest.fn().mockReturnValue('QUX'),
        }),
      );

      it('should build properly and succeed', () => {
        const fixture = MockRender(TestWithDecoratorComponent);
        expect(
          fixture.point.componentInstance.myInjectedFn(),
        ).toEqual('QUX');
        expect(
          fixture.point.componentInstance.myInjectedFn,
        ).toHaveBeenCalledTimes(1);
      });
    });
  });
});
