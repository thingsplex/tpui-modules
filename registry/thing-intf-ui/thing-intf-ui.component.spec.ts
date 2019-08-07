/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { ThingIntfUiComponent } from './thing-intf-ui.component';

describe('ThingIntfUiComponent', () => {
  let component: ThingIntfUiComponent;
  let fixture: ComponentFixture<ThingIntfUiComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ThingIntfUiComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ThingIntfUiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
