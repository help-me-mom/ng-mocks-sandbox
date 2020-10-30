import "jasmine-core/lib/jasmine-core/jasmine.js";
import "jasmine-core/lib/jasmine-core/jasmine-html.js";
import "jasmine-core/lib/jasmine-core/boot.js";

import "zone.js/dist/zone-testing";

import { getTestBed } from "@angular/core/testing";
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting
} from "@angular/platform-browser-dynamic/testing";

// ng-mocks customizations
import "ng-mocks/dist/jasmine";

import "./e2e.ts";
import "./test.spec.ts";

declare const jasmine: any;
const platform = platformBrowserDynamicTesting();

getTestBed().resetTestEnvironment();
getTestBed().initTestEnvironment(BrowserDynamicTestingModule, platform);

platform.onDestroy(() => {
  if (window["ngRef"]) {
    window["ngRef"].destroy();
  }
});

setTimeout(() => {
  if (window.jasmineRef) {
    window.location.reload();
  } else {
    window.jasmineRef = jasmine.getEnv();
    window.jasmineRef.configure({
      random: false,
    });
    window.onload(new Event("anything"));
  }
}, 0);
