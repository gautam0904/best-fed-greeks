import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MealRatingPage } from './meal-rating.page';

describe('MealRatingPage', () => {
  let component: MealRatingPage;
  let fixture: ComponentFixture<MealRatingPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MealRatingPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MealRatingPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
