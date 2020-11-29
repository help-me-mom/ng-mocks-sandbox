import {
  AfterViewInit,
  Component,
  Injectable,
  ViewChild,
} from '@angular/core';
import {
  MockBuilder,
  MockInstance,
  MockRender,
  MockReset,
} from 'ng-mocks';

import { staticFalse } from '..';

@Injectable()
export class TargetChildService {
  public print(): string {
    return this.constructor.name;
  }
}

@Injectable()
export class TargetService {
  public constructor(public child: TargetChildService) {}

  public print(): string {
    return this.constructor.name;
  }
}

@Component({
  providers: [TargetService, TargetChildService],
  selector: 'target',
  template: 'target {{ service.print() }}',
})
export class TargetComponent {
  public constructor(public service: TargetService) {}

  public someMethod() {
    return this.constructor.name;
  }
}

@Component({
  selector: 'real',
  template: '<target></target>',
})
export class RealComponent implements AfterViewInit {
  @ViewChild(TargetComponent, staticFalse)
  protected child?: TargetComponent;

  public ngAfterViewInit() {
    if (this.child) {
      this.child.service.print();
      this.child.service.child.print();
    }
  }
}

// a normal case is a creation without an error.
describe('issue-170:real', () => {
  beforeEach(() => MockBuilder(RealComponent).keep(TargetComponent));

  it('should render', () => {
    expect(() => MockRender(RealComponent)).not.toThrow();
  });
});

// when we mock a ViewChild component then we should have an option to customize its initialization with MockInstance.
describe('issue-170:mock', () => {
  beforeEach(() => MockBuilder(RealComponent).mock(TargetComponent));

  beforeEach(() => {
    MockInstance(TargetComponent, {
      init: (instance, injector) => {
        if (injector) {
          instance.service = injector.get(TargetService);
        }
      },
    });
    MockInstance(TargetService, {
      init: (instance, injector) => {
        if (injector) {
          instance.child = injector.get(TargetChildService);
        }
      },
    });
  });

  afterEach(MockReset);

  it('should render', () => {
    expect(() => MockRender(RealComponent)).not.toThrow();
  });
});

// if we call MockInstance without a callback then it should reset its state.
describe('issue-170:mock:reset', () => {
  beforeEach(() => MockBuilder(RealComponent).mock(TargetComponent));

  beforeEach(() => {
    MockInstance(TargetComponent, {
      init: (instance, injector) => {
        if (injector) {
          instance.service = injector.get(TargetService);
        }
      },
    });
    MockInstance(TargetService, {
      init: (instance, injector) => {
        if (injector) {
          instance.child = injector.get(TargetChildService);
        }
      },
    });
    MockInstance(TargetComponent);
    MockInstance(TargetService);
  });

  afterEach(MockReset);

  it('should render', () => {
    expect(() => MockRender(RealComponent)).toThrow();
  });
});
