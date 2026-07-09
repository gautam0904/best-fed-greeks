import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HouseMenusPage } from './house-menus.page';

describe('HouseMenusPage', () => {
  let component: HouseMenusPage;
  let fixture: ComponentFixture<HouseMenusPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HouseMenusPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HouseMenusPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
