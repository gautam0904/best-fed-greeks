import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WeekMenuPage } from './week-menu.page';

describe('WeekMenuPage', () => {
  let component: WeekMenuPage;
  let fixture: ComponentFixture<WeekMenuPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WeekMenuPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WeekMenuPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
