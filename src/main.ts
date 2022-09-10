import './polyfills';

import 'jasmine-core/lib/jasmine-core/jasmine.js';
import 'jasmine-core/lib/jasmine-core/jasmine-html.js';
import 'jasmine-core/lib/jasmine-core/boot0.js';
import 'jasmine-core/lib/jasmine-core/boot1.js';

import 'zone.js/dist/zone-testing';

import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';
import { NgModuleRef } from '@angular/core';
import { getTestBed } from '@angular/core/testing';
import { MockInstance, MockService, ngMocks } from 'ng-mocks';
import { DefaultTitleStrategy, TitleStrategy } from '@angular/router';

// In case, if you use @angular/router and Angular 14+.
// You might want to set a mock of DefaultTitleStrategy as TitleStrategy.
// A14 fix: making DefaultTitleStrategy to be a default mock for TitleStrategy
ngMocks.defaultMock(TitleStrategy, () => MockService(DefaultTitleStrategy));

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
