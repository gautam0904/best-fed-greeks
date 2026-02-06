import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditMealPlanPage } from './edit-meal-plan.page';

describe('EditMealPlanPage', () => {
  let component: EditMealPlanPage;
  let fixture: ComponentFixture<EditMealPlanPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditMealPlanPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditMealPlanPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
