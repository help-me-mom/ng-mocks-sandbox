import { Component, NgModule, RendererFactory2 } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { BrowserModule, EventManager } from '@angular/platform-browser';
import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

@Component({
  selector: 'app-root',
  template: `<a (click)="title = 'test'">click</a>`,
})
export class AppComponent {
  title = 'ng-routing-test';
}

@Component({
  selector: 'app-mock',
  template: `<a (click)="title = 'test'">click</a>`,
})
export class MockComponent {
  title = 'ng-routing-test';
}

@NgModule({
  bootstrap: [AppComponent],
  declarations: [AppComponent, MockComponent],
  exports: [MockComponent],
  imports: [BrowserModule],
})
export class AppModule {}

describe('issue-162', () => {
  beforeEach(() => MockBuilder(AppComponent, AppModule));

  it(`verifies that EventManager was not replaced with a mock copy`, () => {
    MockRender(AppComponent);
    TestBed.resetTestingModule();
    const target: EventManager = TestBed.get(EventManager);
    expect(target.addEventListener).toEqual(jasmine.any(Function));
    expect((target.addEventListener as any).__ngMocks).toBeUndefined();
    TestBed.resetTestingModule();
  });

  it(`verifies that RendererFactory2 was not replaced with a mock copy`, () => {
    MockRender(AppComponent);
    TestBed.resetTestingModule();
    const target: RendererFactory2 = TestBed.get(RendererFactory2);
    expect(target.createRenderer).toEqual(jasmine.any(Function));
    expect((target.createRenderer as any).__ngMocks).toBeUndefined();
  });

  it(`verifies that spyOnProperty works`, () => {
    const fixture = MockRender(MockComponent);

    // mocking the property via auto spy.
    ngMocks.stub(fixture.point.componentInstance, 'title', 'get');
    ngMocks.stub(fixture.point.componentInstance, 'title', 'set');
    let getSpy: any;
    let setSpy: any;

    // creating spies
    if (typeof jest !== 'undefined') {
      getSpy = jest.spyOn(fixture.point.componentInstance, 'title', 'get');
      setSpy = jest.spyOn(fixture.point.componentInstance, 'title', 'set');
      getSpy.mockReturnValue('spy');
    } else if (typeof jasmine !== 'undefined') {
      getSpy = spyOnProperty(fixture.point.componentInstance, 'title', 'get');
      setSpy = spyOnProperty(fixture.point.componentInstance, 'title', 'set');
      getSpy.and.returnValue('spy');
    }

    expect(fixture.point.componentInstance.title).toEqual('spy');
    fixture.point.componentInstance.title = 'updated';
    expect(setSpy).toHaveBeenCalledWith('updated');
  });
});
