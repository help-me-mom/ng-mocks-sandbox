import './polyfills';

import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';
import { NgModuleRef } from '@angular/core';
import { getTestBed } from '@angular/core/testing';

import { MockInstance, ngMocks } from 'ng-mocks'; // eslint-disable-line import/order

// In case, if you use @angular/router and Angular 14+.
// You might want to set a mock of DefaultTitleStrategy as TitleStrategy.
// A14 fix: making DefaultTitleStrategy to be a default mock for TitleStrategy
import { DefaultTitleStrategy, TitleStrategy } from '@angular/router'; // eslint-disable-line import/order
import { MockService } from 'ng-mocks'; // eslint-disable-line import/order
ngMocks.defaultMock(TitleStrategy, () => MockService(DefaultTitleStrategy));

// Usually, *ngIf and other declarations from CommonModule aren't expected to be mocked.
// The code below keeps them.
import { CommonModule } from '@angular/common'; // eslint-disable-line import/order
import { ApplicationModule } from '@angular/core'; // eslint-disable-line import/order
import { BrowserModule } from '@angular/platform-browser'; // eslint-disable-line import/order
ngMocks.globalKeep(ApplicationModule, true);
ngMocks.globalKeep(CommonModule, true);
ngMocks.globalKeep(BrowserModule, true);

// TODO: remove when stackblitz has fixed it
declare const jasmine: any;

declare global {
  interface Window {
    ngRef?: NgModuleRef<unknown>;
    jasmineRef?: any; // jasmine.Env;
  }
}

// ng-mocks customizations
ngMocks.autoSpy('jasmine');
jasmine.getEnv().allowRespy(true);
jasmine.getEnv().addReporter({
  specDone: MockInstance.restore,
  specStarted: MockInstance.remember,
  suiteDone: MockInstance.restore,
  suiteStarted: MockInstance.remember,
});

import './e2e.ts';
import './test.spec.ts';

const platform = platformBrowserDynamicTesting();
platform.onDestroy(() => window.ngRef?.destroy());

getTestBed().resetTestEnvironment();
getTestBed().initTestEnvironment(BrowserDynamicTestingModule, platform);

setTimeout(() => {
  if (window.jasmineRef) {
    window.location.reload();
  } else {
    window.jasmineRef = jasmine.getEnv();
    window.jasmineRef.allowRespy(true);
    window.jasmineRef.configure({
      random: false,
    });
    if (window.onload) {
      window.onload(new Event('anything'));
    }
  }
}, 0);
