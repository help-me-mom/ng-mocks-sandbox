import { Injectable } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { MockProvider, MockService, ngMocks } from 'ng-mocks';

@Injectable()
class TargetService {
  public readonly info = {
    request: () => 'target',
  };
}

const resetSpy = (spy: any): void => {
  spy.calls.reset();
  // spy.mockClear();
};

// @see https://github.com/help-me-mom/ng-mocks/issues/10919
describe('issue-10919', () => {
  beforeEach(() => ngMocks.autoSpy('jasmine'));

  afterEach(() => ngMocks.autoSpy('reset'));

  beforeEach(() => {
    TestBed.resetTestingModule();

    // Own properties do not exist until the real constructor runs. Declare the
    // required shape explicitly and mock that plain object recursively instead
    // of constructing TargetService to discover it.
    TestBed.configureTestingModule({
      providers: [
        MockProvider(TargetService, {
          info: MockService({
            request: () => 'target',
          }),
        }),
      ],
    });
  });

  it('keeps explicitly defined own object properties of a mocked service', () => {
    const service = TestBed.inject(TargetService);

    // The explicit nested shape stays available and its method is an auto-spy.
    expect(service.info).toBeDefined();
    expect(typeof service.info.request).toEqual('function');
    resetSpy(service.info.request);

    service.info.request();

    expect(service.info.request).toHaveBeenCalledTimes(1);
  });
});
