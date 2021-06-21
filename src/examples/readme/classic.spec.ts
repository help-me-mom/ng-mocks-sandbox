// tslint:disable object-literal-sort-keys

import {
  Component,
  HostListener,
  Injectable,
  Input,
  NgModule,
  OnInit,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  MockInstance,
  MockModule,
  MockProvider,
  MockRender,
  ngMocks,
} from 'ng-mocks';
import { Subject } from 'rxjs';

// remove with A5
export const EMPTY = new Subject<any>();
EMPTY.complete();

interface User {
  email: string;
  firstName: string;
  lastName: string;
}

@Injectable()
class AuthService {
  public readonly currentUser?: User;
  public readonly isLoggedIn$ = new Subject<boolean>();
}

@Injectable()
class StorageService {
  public user?: User;

  public save(user: User): void {
    this.user = user;
  }
}

@Component({
  selector: 'profile',
  template: `<form [formGroup]="form">
    <input type="text" name="email" formControlName="email" />
    <input type="text" name="firstName" formControlName="firstName" />
    <input type="text" name="lastName" formControlName="lastName" />
  </form>`,
})
class ProfileComponent implements OnInit {
  public readonly form = new FormGroup({
    email: new FormControl(null, Validators.required),
    firstName: new FormControl(null, Validators.required),
    lastName: new FormControl(null, Validators.required),
  });

  @Input() public readonly profile: User | null = null;

  public constructor(private readonly storage: StorageService) {}

  public ngOnInit(): void {
    if (this.profile) {
      this.form.setValue(this.profile);
    }
  }

  @HostListener('keyup.control.s')
  public save(): void {
    this.storage.save(this.form.value);
  }
}

@NgModule({
  declarations: [],
  providers: [AuthService, StorageService],
})
class SharedModule {}

ngMocks.defaultMock(AuthService, () => ({
  isLoggedIn$: EMPTY,
}));

// Let's imagine that there is a ProfileComponent
// and it has 3 text fields: email, firstName,
// lastName, and a user can edit them.
// In the following test suite, we would like to
// cover behavior of the component.
describe('profile:classic', () => {
  // First of all, we would like to reuse the same
  // TestBed in every test.
  // ngMocks.faster suppresses reset of TestBed
  // after each test and allows to use TestBed,
  // MockBuilder and MockRender in beforeAll.
  // https://ng-mocks.sudo.eu/api/ngMocks/faster
  ngMocks.faster();

  // Let's declare TestBed in beforeAll instead of beforeEach.
  // The code mocks everything in SharedModule and provides a mock AuthService.
  beforeAll(async () => {
    return TestBed.configureTestingModule({
      imports: [
        MockModule(SharedModule), // mock
        ReactiveFormsModule, // real
      ],
      declarations: [
        ProfileComponent, // real
      ],
      providers: [
        MockProvider(AuthService), // mock
      ],
    }).compileComponents();
  });

  // A test to ensure that ProfileComponent can be created.
  it('should be created', () => {
    // MockRender is an advanced version of TestBed.createComponent.
    // It respects all lifecycle hooks,
    // onPush change detection, and creates a
    // wrapper component with a template like
    // <app-root ...allInputs></profile>
    // https://ng-mocks.sudo.eu/api/MockRender
    const fixture = MockRender(ProfileComponent);

    expect(fixture.point.componentInstance).toEqual(
      jasmine.any(ProfileComponent),
    );
  });

  // A test to ensure that the component listens
  // on ctrl+s hotkey.
  it('saves on ctrl+s hot key', () => {
    // A fake profile.
    const profile = {
      email: 'test2@email.com',
      firstName: 'testFirst2',
      lastName: 'testLast2',
    };

    // A spy to track save calls.
    // MockInstance helps to configure mock
    // providers, declarations and modules
    // before their initialization and usage.
    // https://ng-mocks.sudo.eu/api/MockInstance
    const spySave = MockInstance(
      StorageService,
      'save',
      jasmine.createSpy('StorageService.save'),
    );

    // Renders <profile [profile]="params.profile">
    // </profile>.
    // https://ng-mocks.sudo.eu/api/MockRender
    const { point } = MockRender(
      ProfileComponent,
      { profile }, // bindings
    );

    // Let's change the value of the form control
    // for email addresses with a random value.
    // ngMocks.change finds a related control
    // value accessor and updates it properly.
    // https://ng-mocks.sudo.eu/api/ngMocks/change
    ngMocks.change(
      '[name=email]', // css selector
      'test3@em.ail', // an email address
    );

    // Let's ensure that nothing has been called.
    expect(spySave).not.toHaveBeenCalled();

    // Let's assume that there is a host listener
    // for a keyboard combination of ctrl+s,
    // and we want to trigger it.
    // ngMocks.trigger helps to emit events via
    // simple interface.
    // https://ng-mocks.sudo.eu/api/ngMocks/trigger
    ngMocks.trigger(point, 'keyup.control.s');

    // The spy should be called with the user
    // and the random email address.
    expect(spySave).toHaveBeenCalledWith({
      email: 'test3@em.ail',
      firstName: profile.firstName,
      lastName: profile.lastName,
    });
  });
});
