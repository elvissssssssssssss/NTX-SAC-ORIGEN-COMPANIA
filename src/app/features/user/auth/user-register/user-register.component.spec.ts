import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserRegistercomponent } from './user-register.component';

describe('UserRegister', () => {
  let component: UserRegistercomponent;
  let fixture: ComponentFixture<UserRegistercomponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserRegistercomponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserRegistercomponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
