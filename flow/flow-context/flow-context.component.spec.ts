/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { FlowContextComponent } from './flow-context.component';

describe('FlowContextComponent', () => {
  let component: FlowContextComponent;
  let fixture: ComponentFixture<FlowContextComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FlowContextComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FlowContextComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
