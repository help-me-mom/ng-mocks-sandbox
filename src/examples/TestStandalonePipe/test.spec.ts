import { Injectable, Pipe, PipeTransform } from '@angular/core';

import {
  MockBuilder,
  MockInstance,
  MockRender,
  ngMocks,
} from 'ng-mocks';

// A root service we want to mock.
@Injectable({
  providedIn: 'root',
})
class RootService {
  trigger(name: string) {
    // does something very cool

    return name;
  }
}

// A standalone pipe we are going to test.
@Pipe({
  name: 'standalone',
  standalone: true,
} as never)
class StandalonePipe implements PipeTransform {
  constructor(public readonly rootService: RootService) {}

  transform(value: string): string {
    return this.rootService.trigger(value);
  }
}

describe('TestStandalonePipe', () => {
  // It creates a context for mocks which will be reset after each test.
  MockInstance.scope();

  beforeEach(() => {
    return MockBuilder(StandalonePipe);
  });

  it('renders dependencies', () => {
    // Customizing what RootService does.
    MockInstance(
      RootService,
      'trigger',
      jasmine.createSpy().and.returnValue('mock'),
      // or in case of jest
      // jest.fn().mockReturnValue('mock'),
    );

    // Rendering the pipe.
    const fixture = MockRender(StandalonePipe, {
      $implicit: 'test',
    });

    // Asserting that StandalonePipe calls RootService.trigger.
    const rootService = ngMocks.findInstance(RootService);
    // It's possible because of autoSpy.
    expect(rootService.trigger).toHaveBeenCalledWith('test');

    // Asserting that StandalonePipe has rendered the result of the RootService
    expect(ngMocks.formatText(fixture)).toEqual('mock');
  });
});
