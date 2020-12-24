// tslint:disable strict-type-predicates

import { Component, Injectable } from '@angular/core';
import {
  MockBuilder,
  MockInstance,
  MockRender,
  MockReset,
  ngMocks,
} from 'ng-mocks';

@Injectable()
class TargetService {
  public prop = 0;
  private readonly value = 1;

  public method(): number {
    return this.value;
  }
}

@Component({
  selector: 'target',
  template: 'target',
})
class TargetComponent {
  public constructor(public readonly service: TargetService) {}
}

describe('examples:performance', () => {
  describe('beforeEach:mock-instance', () => {
    ngMocks.faster(); // <-- add it before

    // A normal setup of the TestBed, TargetService will be replaced
    // with its mock copy.
    beforeEach(() => {
      return MockBuilder(TargetComponent).mock(TargetService);
    });

    // Configuring behavior of the mock TargetService.
    beforeAll(() => {
      MockInstance(TargetService, {
        init: instance => {
          instance.method = jasmine.createSpy().and.returnValue(5);
          // in case of jest
          // instance.method = jest.fn().mockReturnValue(5);
          instance.prop = 123;
        },
      });
    });

    // Don't forget to reset the spy between runs.
    afterAll(MockReset);

    it('test:1', () => {
      const fixture = MockRender(TargetComponent);

      expect(fixture.point.componentInstance.service.prop).toBe(123);
      const actual = fixture.point.componentInstance.service.method();
      expect(actual).toBe(5);
      expect(
        fixture.point.componentInstance.service.method,
      ).toHaveBeenCalledTimes(1);
    });

    it('test:2', () => {
      const fixture = MockRender(TargetComponent);

      expect(fixture.point.componentInstance.service.prop).toBe(123);
      const actual = fixture.point.componentInstance.service.method();
      expect(actual).toBe(5);
      expect(
        fixture.point.componentInstance.service.method,
      ).toHaveBeenCalledTimes(1);
    });
  });

  describe('beforeEach:manual-spy', () => {
    ngMocks.faster(); // <-- add it before

    // Creating a spy outside of `beforeEach`
    // allows its pointer being the same between tests
    // and this let ngMocks.faster do its job.
    const mock = {
      method: jasmine.createSpy().and.returnValue(5),
      // in case of jest
      // method: jest.fn().mockReturnValue(5),
      prop: 123,
    };

    // Don't forget to reset the spy between runs.
    beforeEach(() => {
      (mock.method as jasmine.Spy).calls.reset();
      // in case of jest
      // mock.method = jest.fn().mockReturnValue(5);
      mock.prop = 123;
    });

    // A normal setup of the TestBed, TargetService will be replaced
    // with its mock copy.
    beforeEach(() => {
      return MockBuilder(TargetComponent).mock(TargetService, mock);
    });

    it('test:1', () => {
      const fixture = MockRender(TargetComponent);

      expect(fixture.point.componentInstance.service.prop).toBe(123);
      const actual = fixture.point.componentInstance.service.method();
      expect(actual).toBe(5);
      expect(
        fixture.point.componentInstance.service.method,
      ).toHaveBeenCalledTimes(1);
    });

    it('test:2', () => {
      const fixture = MockRender(TargetComponent);

      expect(fixture.point.componentInstance.service.prop).toBe(123);
      const actual = fixture.point.componentInstance.service.method();
      expect(actual).toBe(5);
      expect(
        fixture.point.componentInstance.service.method,
      ).toHaveBeenCalledTimes(1);
    });
  });
});
