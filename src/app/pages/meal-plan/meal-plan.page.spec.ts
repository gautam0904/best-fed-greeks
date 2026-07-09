import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MealPlanPage } from './meal-plan.page';

describe('MealPlanPage', () => {
  let component: MealPlanPage;
  let fixture: ComponentFixture<MealPlanPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MealPlanPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MealPlanPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
