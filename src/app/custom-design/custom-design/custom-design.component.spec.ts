import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomDesignComponent } from './custom-design.component';

describe('CustomDesignComponent', () => {
  let component: CustomDesignComponent;
  let fixture: ComponentFixture<CustomDesignComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CustomDesignComponent]
    });
    fixture = TestBed.createComponent(CustomDesignComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
