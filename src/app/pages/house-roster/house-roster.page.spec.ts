import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HouseRosterPage } from './house-roster.page';

describe('HouseRosterPage', () => {
  let component: HouseRosterPage;
  let fixture: ComponentFixture<HouseRosterPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HouseRosterPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HouseRosterPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
