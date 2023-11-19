import { CommonModule } from '@angular/common';
import { Component, NgModule } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import {
  MockBuilder,
  MockComponent,
  MockModule,
  ngMocks,
} from 'ng-mocks';

// @see https://github.com/help-me-mom/ng-mocks/issues/6928
describe('issue-6928', () => {
  ngMocks.throwOnConsole();

  @Component({
    selector: 'app-shared1',
    template: '',
  })
  class Shared1Component {}

  @Component({
    selector: 'app-shared2',
    template: '',
  })
  class Shared2Component {}

  @NgModule({
    imports: [CommonModule],
    declarations: [Shared1Component, Shared2Component],
    exports: [Shared1Component, Shared2Component],
  })
  class SharedModule {}

  @Component({
    selector: 'app-standalone',
    template: '<app-shared1></app-shared1>',
    standalone: true,
    imports: [CommonModule, SharedModule],
  })
  class StandaloneComponent {}

  @Component({
    selector: 'app-my-component',
    template:
      '<app-shared2></app-shared2><app-standalone></app-standalone>',
  })
  class MyComponent {}

  @NgModule({
    imports: [CommonModule, StandaloneComponent, SharedModule],
    declarations: [MyComponent],
  })
  class AppModule {}

  describe('missing module import', () => {
    it('throws on 2 declarations w/o ng-mocks', () =>
      expect(() => {
        TestBed.configureTestingModule({
          imports: [StandaloneComponent],
          declarations: [MyComponent, Shared2Component],
        }).compileComponents();
        TestBed.createComponent(MyComponent).detectChanges();
      }).toThrowError(
        /is part of the declarations of 2 modules: DynamicTestModule/,
      ));

    it('handles TestBed correctly w/ ng-mocks', () => {
      expect(() => {
        TestBed.configureTestingModule({
          imports: [MockComponent(StandaloneComponent)],
          declarations: [
            MyComponent,
            MockComponent(Shared2Component),
          ],
        }).compileComponents();
        TestBed.createComponent(MyComponent).detectChanges();
      }).not.toThrow();
    });

    it('handles TestBed correctly w/ MockBuilder', () => {
      expect(() => {
        MockBuilder(MyComponent, [
          StandaloneComponent,
          Shared2Component,
        ]).then();
        TestBed.createComponent(MyComponent).detectChanges();
      }).not.toThrow();
    });
  });

  describe('correct module import', () => {
    it('passes w/o ng-mocks', () =>
      expect(() => {
        TestBed.configureTestingModule({
          imports: [StandaloneComponent, SharedModule],
          declarations: [MyComponent],
        }).compileComponents();
        TestBed.createComponent(MyComponent).detectChanges();
      }).not.toThrow());

    it('passes w/ ng-mocks', () =>
      expect(() => {
        TestBed.configureTestingModule({
          imports: [
            MockComponent(StandaloneComponent),
            MockModule(SharedModule),
          ],
          declarations: [MyComponent],
        }).compileComponents();
        TestBed.createComponent(MyComponent).detectChanges();
      }).not.toThrow());

    it('passes w/ MockBuilder', () =>
      expect(() => {
        MockBuilder(MyComponent, [
          StandaloneComponent,
          SharedModule,
        ]).then();
        TestBed.createComponent(MyComponent).detectChanges();
      }).not.toThrow());

    it('passes w/ MockBuilder and AppModule', () =>
      expect(() => {
        MockBuilder(MyComponent, [
          AppModule,
          Shared2Component,
        ]).then();
        TestBed.createComponent(MyComponent).detectChanges();
      }).not.toThrow());
  });
});
