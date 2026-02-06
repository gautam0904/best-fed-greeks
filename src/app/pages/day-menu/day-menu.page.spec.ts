import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DayMenuPage } from './day-menu.page';

describe('DayMenuPage', () => {
  let component: DayMenuPage;
  let fixture: ComponentFixture<DayMenuPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DayMenuPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DayMenuPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
