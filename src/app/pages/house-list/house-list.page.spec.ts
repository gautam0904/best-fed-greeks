import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HouseListPage } from './house-list.page';

describe('HouseListPage', () => {
  let component: HouseListPage;
  let fixture: ComponentFixture<HouseListPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HouseListPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HouseListPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
