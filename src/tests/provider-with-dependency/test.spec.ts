import { Injectable } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MockBuilder, MockRender } from 'ng-mocks';

import { InternalComponent } from './fixtures.components';
import { TargetModule } from './fixtures.modules';
import { ServiceReplacedParent } from './fixtures.services';

@Injectable()
class ServiceMock {
  protected value = 'mock';

  public echo() {
    return this.value;
  }
}

describe('provider-with-dependency:real', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TargetModule],
    });
    return TestBed.compileComponents();
  });

  it('should render "parent"', () => {
    const fixture = MockRender(InternalComponent);
    expect(fixture.debugElement.nativeElement.innerHTML).toEqual('<internal-component>replaced</internal-component>');
  });
});

describe('provider-with-dependency:provided', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TargetModule],
      providers: [
        {
          provide: ServiceReplacedParent,
          useClass: ServiceMock,
        },
      ],
    });
    return TestBed.compileComponents();
  });

  it('should render "parent"', () => {
    const fixture = MockRender(InternalComponent);
    expect(fixture.debugElement.nativeElement.innerHTML).toEqual('<internal-component>mock</internal-component>');
  });
});

describe('provider-with-dependency:mock', () => {
  beforeEach(() => {
    const ngModule = MockBuilder()
      .keep(TargetModule)
      .provide({
        provide: ServiceReplacedParent,
        useClass: ServiceMock,
      })
      .build();
    TestBed.configureTestingModule(ngModule);
    return TestBed.compileComponents();
  });

  it('should render "parent" even the providers where patched', () => {
    const fixture = MockRender(InternalComponent);
    expect(fixture.debugElement.nativeElement.innerHTML).toEqual('<internal-component>mock</internal-component>');
  });
});
