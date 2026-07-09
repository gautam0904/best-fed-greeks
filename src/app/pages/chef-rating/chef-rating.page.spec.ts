import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChefRatingPage } from './chef-rating.page';

describe('ChefRatingPage', () => {
  let component: ChefRatingPage;
  let fixture: ComponentFixture<ChefRatingPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChefRatingPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChefRatingPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
