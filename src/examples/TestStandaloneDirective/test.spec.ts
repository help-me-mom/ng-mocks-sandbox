import { Directive, Injectable, Input, OnInit } from '@angular/core';

import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

// A root service we want to mock.
@Injectable({
  providedIn: 'root',
})
class RootService {
  trigger(name: string | null) {
    // does something very cool

    return name;
  }
}

// A standalone directive we are going to test.
@Directive({
  selector: 'standalone',
})
class StandaloneDirective implements OnInit {
  @Input() public readonly name: string | null = null;

  constructor(public readonly rootService: RootService) {}

  ngOnInit(): void {
    this.rootService.trigger(this.name);
  }
}

describe('TestStandaloneDirective', () => {
  beforeEach(() => {
    return MockBuilder(StandaloneDirective);
  });

  it('renders dependencies', () => {
    // Rendering the directive.
    MockRender(StandaloneDirective, {
      name: 'test',
    });

    // Asserting that StandaloneDirective calls RootService.trigger.
    const rootService = ngMocks.findInstance(RootService);
    // it's possible because of autoSpy.
    expect(rootService.trigger).toHaveBeenCalledWith('test');
  });
});
