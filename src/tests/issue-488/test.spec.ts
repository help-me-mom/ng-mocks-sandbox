import { Component, Injectable } from '@angular/core';
import { getTestBed, TestBed } from '@angular/core/testing';
import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

@Injectable()
export class TargetService {
  public method() {
    return 'inside method';
  }
}

@Component({
  selector: 'target',
  template: '',
})
export class TargetComponent {
  public constructor(private readonly service: TargetService) {
    this.service.method();
  }
}

// @see https://github.com/ike18t/ng-mocks/issues/488
describe('issue-488', () => {
  ngMocks.throwOnConsole();

  beforeEach(() =>
    MockBuilder(TargetComponent).provide(TargetService),
  );

  let service: TargetService;

  describe('classic', () => {
    beforeEach(() => {
      service = TestBed.get(TargetService);
      ngMocks.stubMember(
        service,
        'method',
        jasmine.createSpy(), // or jest.fn(),
      );

      TestBed.createComponent(TargetComponent);
    });

    it('expect service.method to have been called', () => {
      expect(service.method).toHaveBeenCalled();
    });
  });

  describe('mock-render', () => {
    it('throws an error about usage of the injector', () => {
      const testBed: any = getTestBed();

      service = TestBed.get(TargetService);
      ngMocks.stubMember(
        service,
        'method',
        jasmine.createSpy(), // or jest.fn(),
      );

      if (testBed._instantiated || testBed._testModuleRef) {
        expect(() => MockRender(TargetComponent)).toThrowError(
          /Forgot to flush TestBed/,
        );
      } else {
        MockRender(TargetComponent);
        expect(service.method).toHaveBeenCalled();
      }
    });
  });
});
