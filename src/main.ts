import './polyfills';

import 'jasmine-core/lib/jasmine-core/jasmine.js';
import 'jasmine-core/lib/jasmine-core/jasmine-html.js';
import 'jasmine-core/lib/jasmine-core/boot.js';

import 'zone.js/dist/zone-testing';

import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';
import { NgModuleRef } from '@angular/core';
import { getTestBed } from '@angular/core/testing';
import { ngMocks } from 'ng-mocks';

declare global {
  interface Window {
    ngRef?: NgModuleRef<unknown>;
    jasmineRef?: jasmine.Env;
  }
}

// ng-mocks customizations
ngMocks.autoSpy('jasmine');

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
