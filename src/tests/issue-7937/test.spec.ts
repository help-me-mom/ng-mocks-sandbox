import {
  Component,
  NgModule,
  Pipe,
  PipeTransform,
} from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MockBuilder, ngMocks } from 'ng-mocks';

@Pipe({
  name: 'target',
  standalone: false,
})
class TargetPipe implements PipeTransform {
  public transform(value: string): string {
    return `hi there ${value}`;
  }
}

@NgModule({
  declarations: [TargetPipe],
  exports: [TargetPipe],
  providers: [TargetPipe],
})
class TargetModule {}

@Component({
  selector: 'target-7937',
  template: '',
  imports: [TargetModule],
})
class TargetComponent {
  public constructor(public readonly targetPipe: TargetPipe) {}

  public echo(): string {
    return this.targetPipe.transform('test');
  }
}

describe('issue-7937', () => {
  beforeEach(() => MockBuilder(TargetComponent));

  it('lets TestBed.inject configure the pipe used by the component', () => {
    // Before the fix, TestBed.inject returned a seeded mock pipe instance, but Angular injected a
    // different local pipe instance into the component. ng-mocks now replays those seeded overrides
    // onto the local instance and then returns that local instance from future TestBed.inject calls.
    const targetPipe = TestBed.inject(TargetPipe);
    const transform = jasmine
      .createSpy('targetTransform')
      .and.returnValue('mock');
    // or jest.fn().mockReturnValue('mock');
    ngMocks.stub(targetPipe, { transform });

    const component =
      TestBed.createComponent(TargetComponent).componentInstance;

    expect(component.targetPipe).not.toBe(targetPipe);
    expect(component.targetPipe.transform).toBe(targetPipe.transform);
    expect(component.echo()).toEqual('mock');
    expect(transform).toHaveBeenCalledWith('test');
    expect(TestBed.inject(TargetPipe)).toBe(component.targetPipe);
  });
});

describe('issue-7937:baseline', () => {
  let fixture: ComponentFixture<TargetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TargetComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TargetComponent);
  });

  it('uses a different pipe instance than TestBed.inject in Angular itself', () => {
    // This documents the Angular baseline: plain Angular keeps TestBed.inject(TargetPipe) separate
    // from the component-local pipe instance. ng-mocks intentionally bridges that gap for mocks.
    expect(fixture.componentInstance.targetPipe).not.toBe(
      TestBed.inject(TargetPipe),
    );
    expect(fixture.componentInstance.echo()).toEqual('hi there test');
  });
});
