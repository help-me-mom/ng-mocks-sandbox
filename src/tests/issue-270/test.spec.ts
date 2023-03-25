import { Component, Injectable } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { EMPTY, Observable, Subject } from 'rxjs';

import { MockProvider, MockRender } from 'ng-mocks';

@Injectable()
class TargetService {
  public stream$: Observable<number> = EMPTY;
}

@Component({
  selector: 'target-270',
  template: '{{ service.stream$ | async }}',
})
class TargetComponent {
  public constructor(public readonly service: TargetService) {}
}

// @see https://github.com/help-me-mom/ng-mocks/issues/270
describe('issue-270', () => {
  const mock = {
    stream$: new Subject<number>(),
  };

  afterAll(() => mock.stream$.complete());

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TargetComponent],
      providers: [MockProvider(TargetService, mock)],
    });
  });

  it('mocks the property', () => {
    const fixture = MockRender(TargetComponent);

    // default template
    expect(fixture.nativeElement.innerHTML).toEqual(
      '<target-270></target-270>',
    );

    // emit 1
    mock.stream$.next(1);
    fixture.detectChanges();
    expect(fixture.nativeElement.innerHTML).toEqual(
      '<target-270>1</target-270>',
    );

    // emit 2
    mock.stream$.next(2);
    fixture.detectChanges();
    expect(fixture.nativeElement.innerHTML).toEqual(
      '<target-270>2</target-270>',
    );
  });
});
