import { Component, Injectable } from '@angular/core';
import { MockBuilder, MockRender } from 'ng-mocks';

// A simple service, might have contained more logic,
// but it is redundant for the test demonstration.
@Injectable()
class TargetService {
  public readonly value = 'target';
}

@Component({
  providers: [TargetService],
  selector: 'target',
  template: `{{ service.value }}`,
})
class TargetComponent {
  public constructor(public readonly service: TargetService) {}
}

describe('TestProviderInComponent', () => {
  // Because we want to test the service, we pass it as the first
  // parameter of MockBuilder.
  // Because we do not care about TargetComponent, we pass it as
  // the second parameter for being replaced with a mock copy.
  // Do not forget to return the promise of MockBuilder.
  beforeEach(() => MockBuilder(TargetService, TargetComponent));

  it('has access to the service via a component', () => {
    // Let's render the mock component. It provides a point
    // to access the service.
    const fixture = MockRender(TargetComponent);

    // The root element is fixture.point and it is the TargetComponent
    // with its injector for extracting internal services.
    const service = fixture.point.injector.get(TargetService);

    // Here we go, now we can assert everything about the service.
    expect(service.value).toEqual('target');
  });
});
