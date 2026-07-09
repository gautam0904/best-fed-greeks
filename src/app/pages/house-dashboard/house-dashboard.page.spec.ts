import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HouseDashboardPage } from './house-dashboard.page';

describe('HouseDashboardPage', () => {
  let component: HouseDashboardPage;
  let fixture: ComponentFixture<HouseDashboardPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HouseDashboardPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HouseDashboardPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
