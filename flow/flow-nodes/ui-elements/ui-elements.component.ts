import { Component, OnInit ,Input } from '@angular/core';
import {Variable } from "app/flow/flow-editor/flow-editor.component";

@Component({
    selector: 'variable-element',
    templateUrl: './variable-element.html',
    styleUrls: ['./ui-elements.component.css']
  })
  export class VariableElementComponent implements OnInit {
    @Input() variable :Variable;
    constructor() { }
  
    ngOnInit() { 
      
    }
    
  }