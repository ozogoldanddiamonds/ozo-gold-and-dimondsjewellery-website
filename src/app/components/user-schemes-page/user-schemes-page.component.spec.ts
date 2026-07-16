import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserSchemesPageComponent } from './user-schemes-page.component';

describe('UserSchemesPageComponent', () => {
  let component: UserSchemesPageComponent;
  let fixture: ComponentFixture<UserSchemesPageComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [UserSchemesPageComponent]
    });
    fixture = TestBed.createComponent(UserSchemesPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
