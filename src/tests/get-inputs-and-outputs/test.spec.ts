import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

import {
  Target2Directive,
  Target3Directive,
  TargetComponent,
  TargetModule,
} from './fixtures';

describe('get-inputs-and-outputs', () => {
  beforeEach(() => MockBuilder(TargetModule));

  it('finds them correctly', () => {
    const params = {
      input1: '1',
      input2: '2',
      output1: jasmine.createSpy('output1'),
      // in case of jest
      // output1: jest.fn().mockName('output1'),
      output2: jasmine.createSpy('output2'),
      // in case of jest
      // output2: jest.fn().mockName('output2'),
      output3: jasmine.createSpy('output3'),
      // in case of jest
      // output3: jest.fn().mockName('output3'),
    };
    const fixture = MockRender<TargetComponent, typeof params>(
      `<target-get-inputs-and-outputs
        [input1]="input1"
        [input2]="input2"
        input3="3"
        (output1)="output1($event)"
        (output2)="output2($event)"
        (output3)="output3($event)"
      ></target-get-inputs-and-outputs>`,
      params,
    );

    const componentElement = fixture.point;
    const component = fixture.point.componentInstance;
    const directive2 = ngMocks.get(
      componentElement,
      Target2Directive,
    );
    const directive3 = ngMocks.get(
      componentElement,
      Target3Directive,
    );

    expect(component.input).toEqual('1');
    (params.output1 as jasmine.Spy).calls.reset();
    // in case of jest
    // (params.output1 as jest.Mock).mockReset();
    component.output.emit();
    expect(params.output1).toHaveBeenCalled();

    expect(directive2.input).toEqual('2');
    expect(directive2.input2).toEqual(undefined);
    (params.output2 as jasmine.Spy).calls.reset();
    // in case of jest
    // (params.output2 as jest.Mock).mockReset();
    directive2.output.emit();
    expect(params.output2).toHaveBeenCalled();

    expect(directive3.input).toEqual('3');
    (params.output3 as jasmine.Spy).calls.reset();
    // in case of jest
    // (params.output3 as jest.Mock).mockReset();
    directive3.output.emit();
    expect(params.output3).toHaveBeenCalled();

    // a really simple wait that allows us to skip pain of knowing directives.
    expect(ngMocks.input(componentElement, 'input1')).toEqual('1');
    expect(ngMocks.input(componentElement, 'input2')).toEqual('2');
    expect(ngMocks.input(componentElement, 'inputUnused')).toEqual(
      undefined,
    );
    expect(() =>
      ngMocks.input(componentElement, 'inputUndefined'),
    ).toThrowError(
      'Cannot find inputUndefined input via ngMocks.input',
    );
    expect(ngMocks.input(componentElement, 'input3')).toEqual('3');
    (params.output1 as jasmine.Spy).calls.reset();
    // in case of jest
    // (params.output1 as jest.Mock).mockReset();
    ngMocks.output(componentElement, 'output1').emit();
    expect(params.output1).toHaveBeenCalled();
    (params.output2 as jasmine.Spy).calls.reset();
    // in case of jest
    // (params.output2 as jest.Mock).mockReset();
    ngMocks.output(componentElement, 'output2').emit();
    expect(params.output2).toHaveBeenCalled();
    (params.output3 as jasmine.Spy).calls.reset();
    // in case of jest
    // (params.output3 as jest.Mock).mockReset();
    ngMocks.output(componentElement, 'output3').emit();
    expect(params.output3).toHaveBeenCalled();
    expect(() =>
      ngMocks.output(componentElement, 'outputUndefined'),
    ).toThrowError(
      'Cannot find outputUndefined output via ngMocks.output',
    );
  });
});
