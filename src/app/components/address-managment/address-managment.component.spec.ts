import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddressManagmentComponent } from './address-managment.component';

describe('AddressManagmentComponent', () => {
  let component: AddressManagmentComponent;
  let fixture: ComponentFixture<AddressManagmentComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AddressManagmentComponent]
    });
    fixture = TestBed.createComponent(AddressManagmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
