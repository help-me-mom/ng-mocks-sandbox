import {
  Component,
  model,
  reflectComponentType,
  signal,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { MockBuilder, MockComponent, ngMocks } from 'ng-mocks';

// @see https://github.com/help-me-mom/ng-mocks/issues/10942
describe('issue-10942', () => {
  @Component({
    selector: 'target-10942-signal',
    template: '',
  })
  class SignalComponent {
    public value = model('');
  }

  @Component({
    imports: [SignalComponent],
    selector: 'target-10942',
    template: `
      <h1>{{ title() }}</h1>
      <target-10942-signal [(value)]="title"></target-10942-signal>
    `,
  })
  class TargetComponent {
    public title = signal('test-default');
  }

  const hasCompiledModelMetadata = () => {
    const mirror = reflectComponentType(SignalComponent);
    const signalCmp = (SignalComponent as any).ɵcmp;
    const inputs =
      signalCmp && signalCmp.inputs ? signalCmp.inputs : {};
    const outputs =
      signalCmp && signalCmp.outputs ? signalCmp.outputs : {};
    const mirrorInputs =
      mirror && mirror.inputs ? mirror.inputs.length : 0;
    const mirrorOutputs =
      mirror && mirror.outputs ? mirror.outputs.length : 0;

    return (
      Object.keys(inputs).length > 0 ||
      Object.keys(outputs).length > 0 ||
      mirrorInputs > 0 ||
      mirrorOutputs > 0
    );
  };

  if (!hasCompiledModelMetadata()) {
    it('needs compiled signal model metadata', () => {
      expect(true).toBeTruthy();
    });

    return;
  }

  beforeEach(() => MockBuilder(TargetComponent));

  it('creates a mock with signal model bindings', () => {
    const mockComponent = MockComponent(SignalComponent) as any;
    const mockCmp = mockComponent.ɵcmp;
    const inputs = mockCmp && mockCmp.inputs ? mockCmp.inputs : {};
    const outputs = mockCmp && mockCmp.outputs ? mockCmp.outputs : {};

    expect(inputs.value).toBeDefined();
    expect(outputs.valueChange).toBeDefined();
  });

  it('provides the signal model change emitter after change detection', () => {
    const fixture = TestBed.createComponent(TargetComponent);

    fixture.detectChanges();
    expect(() =>
      ngMocks
        .output('target-10942-signal', 'valueChange')
        .emit('test-new'),
    ).not.toThrow();
    fixture.detectChanges();

    expect(ngMocks.find('h1').nativeElement.innerHTML).toEqual(
      'test-new',
    );
  });
});
