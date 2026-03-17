import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  Input,
  TemplateRef,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

// @see https://github.com/help-me-mom/ng-mocks/issues/11324
describe('issue-11324', () => {
  @Component({
    selector: 'app-baz',
    template: `Hello World!`,
  })
  class BazComponent {}

  @Component({
    selector: 'app-foo',
    template: `<ng-template #foo><app-baz></app-baz></ng-template>`,
    imports: [CommonModule, BazComponent],
  })
  class FooComponent {
    @ViewChild('foo', { read: TemplateRef })
    templateRef: TemplateRef<any> | null = null;
  }

  @Component({
    selector: 'app-bar',
    template: ``,
  })
  class BarComponent implements AfterViewInit {
    constructor(private vcf: ViewContainerRef) {}

    @Input()
    context: any;

    @Input()
    templateRef: TemplateRef<any> | null = null;

    ngAfterViewInit(): void {
      this.vcf.clear();
      this.vcf.createEmbeddedView(this.templateRef!, this.context);
    }
  }

  beforeEach(async () => {
    const built = MockBuilder([FooComponent, BarComponent]).build();
    (built as any).teardown = { destroyAfterEach: false };
    TestBed.configureTestingModule({
      ...built,
    });
    return await TestBed.compileComponents();
  });

  it('should respect teardown configuration', () => {
    const fixture = MockRender(FooComponent); // ok
    const component = fixture.point.componentInstance;
    const templateRef = component.templateRef;

    ngMocks.flushTestBed();
    MockRender(BarComponent, { templateRef, context: {} }); // ok
    MockRender(
      BarComponent,
      { templateRef, context: {} },
      { reset: true },
    ); // ok

    expect(true).toBeTruthy();
  });
});
