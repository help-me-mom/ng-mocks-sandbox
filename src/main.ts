import "jasmine-core/lib/jasmine-core/jasmine.js";
import "jasmine-core/lib/jasmine-core/jasmine-html.js";
import "jasmine-core/lib/jasmine-core/boot.js";

import "zone.js/dist/zone-testing";

import "./test.spec.ts";

import "./examples/MAIN/test.spec.ts";
import "./examples/MockBuilder/MockBuilder.spec.ts";
import "./examples/MockComponent/MockComponent.spec.ts";
import "./examples/MockDirective-Attribute/MockDirective.spec.ts";
import "./examples/MockDirective-Structural/MockDirective.spec.ts";
import "./examples/MockInstance/test.spec.ts";
import "./examples/MockModule/MockModule.spec.ts";
import "./examples/MockPipe/MockPipe.spec.ts";
import "./examples/MockReactiveForms/MockReactiveForms.spec.ts";
import "./examples/MockRender/MockRender.spec.ts";
import "./examples/NG_MOCKS/NG_MOCKS.spec.ts";
import "./examples/v10/MockComponent/test.spec.ts";
import "./examples/v10/MockDirective-Attribute/test.spec.ts";
import "./examples/v10/MockDirective-Structural/test.spec.ts";
import "./examples/v10/MockModule/test.spec.ts";
import "./examples/v10/MockPipe/test.spec.ts";
import "./examples/v10/MockReactiveForms/test.spec.ts";
import "./test.spec.ts";
import "./tests/context-with-directives/context-with-directives.spec.ts";
import "./tests/control-value-accessor-form-control/test.spec.ts";
import "./tests/control-value-accessor-ng-model/test.spec.ts";
import "./tests/exports-only/test.spec.ts";
import "./tests/get-inputs-and-outputs/test.spec.ts";
import "./tests/injected-ng-templates/injected-ng-templates.spec.ts";
import "./tests/internal-only-nested/test.spec.ts";
import "./tests/internal-only/test.spec.ts";
import "./tests/internal-vs-external/test.spec.ts";
import "./tests/issue-142/test.spec.ts";
import "./tests/issue-145/components.spec.ts";
import "./tests/issue-145/directives.spec.ts";
import "./tests/issue-151/test.spec.ts";
import "./tests/issue-157/test.spec.ts";
import "./tests/issue-162/test.spec.ts";
import "./tests/issue-166/test.spec.ts";
import "./tests/issue-167/NG_VALIDATORS.spec.ts";
import "./tests/issue-167/component.spec.ts";
import "./tests/issue-167/directive.spec.ts";
import "./tests/issue-170/test.spec.ts";
import "./tests/issue-172/test.spec.ts";
import "./tests/issue-173/test.spec.ts";
import "./tests/issue-175/test.spec.ts";
import "./tests/issue-177/test.spec.ts";
import "./tests/issue-178/test.spec.ts";
import "./tests/issue-181/test.spec.ts";
import "./tests/issue-186/test.spec.ts";
import "./tests/issue-197/abstract.spec.ts";
import "./tests/issue-197/with-providers.spec.ts";
import "./tests/mock-builder-by-directive/test.spec.ts";
import "./tests/mock-builder-keeps-application-module/test.spec.ts";
import "./tests/mock-render-mirrors-component/test.spec.ts";
import "./tests/module-with-factory-tokens/test.spec.ts";
import "./tests/module-with-tokens/test.spec.ts";
import "./tests/nested-before-each/test.spec.ts";
import "./tests/normal-usage-after-mock-builder/test.spec.ts";
import "./tests/on-push/on-push.spec.ts";
import "./tests/provider-with-dependency/test.spec.ts";
import "./tests/rerender-rendered-content-child/test.spec.ts";
import "./tests/shared-mocked-module/test.spec.ts";
import "./tests/spies/test.spec.ts";
import "./tests/structural-directives/structural-directives.spec.ts";

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
