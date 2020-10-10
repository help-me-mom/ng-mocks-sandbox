import "jasmine-core/lib/jasmine-core/jasmine.js";
import "jasmine-core/lib/jasmine-core/jasmine-html.js";
import "jasmine-core/lib/jasmine-core/boot.js";

import "zone.js/dist/zone-testing";

import "./test.spec.ts";

import { getTestBed } from "@angular/core/testing";
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting
} from "@angular/platform-browser-dynamic/testing";

// The TestBed creates a dynamically-constructed Angular test module that emulates an Angular @NgModule
getTestBed().resetTestEnvironment();

// First, initialize the Angular testing environment.
getTestBed().initTestEnvironment(
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting()
);

declare const jasmine: any;
if (window.jasmineRef) {
  window.location.reload();
} else {
  window.jasmineRef = jasmine.getEnv();
  window.onload(new Event("anything"));
}
