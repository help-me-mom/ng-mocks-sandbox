import { ReactiveFormsModule } from '@angular/forms';

import {
  MockBuilder,
  MockComponent,
  MockRender,
  ngMocks,
} from 'ng-mocks';

import {
  ControlComponent,
  TargetComponent,
  TargetModule,
} from './fixtures';

// a real case to check possible behavior.
describe('control-value-accessor-form-control:real', () => {
  beforeEach(() => MockBuilder(TargetComponent).keep(TargetModule));

  it('respects our formControl', () => {
    const fixture = MockRender(TargetComponent, {}, false);
    const mock = ngMocks.find(
      fixture.debugElement,
      ControlComponent,
    ).componentInstance;
    ngMocks.stubMember(
      mock,
      'writeValue',
      jasmine.createSpy().and.callFake(mock.writeValue),
      // or jest.fn(mock.writeValue),
    );
    ngMocks.stubMember(
      mock,
      'setDisabledState',
      jasmine.createSpy().and.callFake(mock.setDisabledState),
      // or jest.fn(mock.setDisabledState),
    );
    fixture.detectChanges();

    expect(mock.writeValue).toHaveBeenCalledWith(null);
    expect(
      fixture.point.componentInstance.control.touched,
    ).toBeFalsy();

    // checking via original component
    fixture.point.componentInstance.control.setValue('test1');
    expect(mock.writeValue).toHaveBeenCalledWith('test1');
    expect(
      fixture.point.componentInstance.control.touched,
    ).toBeFalsy();

    fixture.point.componentInstance.control.setValue('test2');
    expect(mock.writeValue).toHaveBeenCalledWith('test2');
    expect(
      fixture.point.componentInstance.control.touched,
    ).toBeFalsy();

    // checking that touch works
    mock.changeTouch();
    expect(
      fixture.point.componentInstance.control.touched,
    ).toBeTruthy();

    // checking that reset works
    fixture.point.componentInstance.control.markAsUntouched();
    expect(
      fixture.point.componentInstance.control.touched,
    ).toBeFalsy();

    // checking that disabled works
    fixture.point.componentInstance.control.disable();
    expect(mock.setDisabledState).toHaveBeenCalledWith(true);
    fixture.point.componentInstance.control.enable();
    expect(mock.setDisabledState).toHaveBeenCalledWith(false);

    // changeValue does not trigger anything else but the callback.
    // Therefore, it does not render new value.
    // It only updates the original control's value.
    mock.changeValue('test3');
    expect(mock.writeValue).not.toHaveBeenCalledWith('test3');
    expect(
      fixture.point.componentInstance.control.touched,
    ).toBeFalsy();
    expect(fixture.point.componentInstance.control.value).toBe(
      'test3',
    );
  });
});

// a way that ensures that a mock component behaves the same way as real one.
describe('control-value-accessor-form-control:mock', () => {
  beforeEach(() =>
    MockBuilder(TargetComponent, TargetModule).keep(
      ReactiveFormsModule,
    ),
  );

  it('respects our formControl', () => {
    const fixture = MockRender(TargetComponent, {}, false);
    const mock = ngMocks.find(
      fixture.debugElement,
      MockComponent(ControlComponent),
    ).componentInstance;
    ngMocks.stubMember(
      mock,
      'writeValue',
      jasmine.createSpy().and.callFake(mock.writeValue),
      // or jest.fn(mock.writeValue),
    );
    ngMocks.stubMember(
      mock,
      'setDisabledState',
      jasmine.createSpy().and.callFake(mock.setDisabledState),
      // or jest.fn(mock.setDisabledState),
    );
    ngMocks.stubMember(
      mock,
      'registerOnChange',
      jasmine.createSpy().and.callFake(mock.registerOnChange),
      // or jest.fn(mock.registerOnChange),
    );
    ngMocks.stubMember(
      mock,
      'registerOnTouched',
      jasmine.createSpy().and.callFake(mock.registerOnTouched),
      // or jest.fn(mock.registerOnTouched),
    );
    fixture.detectChanges();

    expect(mock.writeValue).toHaveBeenCalledWith(null);
    expect(
      fixture.point.componentInstance.control.touched,
    ).toBeFalsy();

    // checking via original component
    fixture.point.componentInstance.control.setValue('test1');
    expect(mock.writeValue).toHaveBeenCalledWith('test1');
    expect(
      fixture.point.componentInstance.control.touched,
    ).toBeFalsy();

    fixture.point.componentInstance.control.setValue('test2');
    expect(mock.writeValue).toHaveBeenCalledWith('test2');
    expect(
      fixture.point.componentInstance.control.touched,
    ).toBeFalsy();

    // checking that touch works
    mock.__simulateTouch();
    expect(
      fixture.point.componentInstance.control.touched,
    ).toBeTruthy();
    fixture.point.componentInstance.control.markAsUntouched();
    expect(
      fixture.point.componentInstance.control.touched,
    ).toBeFalsy();
    // a way through a spy
    ngMocks
      .stub<any>(mock, 'registerOnTouched')
      .calls.first()
      .args[0]();
    expect(
      fixture.point.componentInstance.control.touched,
    ).toBeTruthy();
    fixture.point.componentInstance.control.markAsUntouched();

    // checking that disabled works
    fixture.point.componentInstance.control.disable();
    expect(mock.setDisabledState).toHaveBeenCalledWith(true);
    fixture.point.componentInstance.control.enable();
    expect(mock.setDisabledState).toHaveBeenCalledWith(false);

    // changeValue does not trigger anything else but the callback.
    // Therefore, it does not render new value.
    // It only updates the original control's value.
    mock.__simulateChange('test3');
    expect(mock.writeValue).not.toHaveBeenCalledWith('test3');
    expect(
      fixture.point.componentInstance.control.touched,
    ).toBeFalsy();
    expect(fixture.point.componentInstance.control.value).toBe(
      'test3',
    );
    // a way through a spy
    ngMocks
      .stub<any>(mock, 'registerOnChange')
      .calls.first()
      .args[0]('test4');
    expect(mock.writeValue).not.toHaveBeenCalledWith('test4');
    expect(
      fixture.point.componentInstance.control.touched,
    ).toBeFalsy();
    expect(fixture.point.componentInstance.control.value).toBe(
      'test4',
    );
  });
});
