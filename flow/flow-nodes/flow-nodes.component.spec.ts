/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { FlowNodesComponent } from './flow-nodes.component';

describe('FlowNodesComponent', () => {
  let component: FlowNodesComponent;
  let fixture: ComponentFixture<FlowNodesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FlowNodesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FlowNodesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
