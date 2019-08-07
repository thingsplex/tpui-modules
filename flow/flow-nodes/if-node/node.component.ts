import {MetaNode} from "../../flow-editor/flow-editor.component";
import {Component, Input, OnInit} from "@angular/core";
import {MatDialog} from "@angular/material";
import {Http, Response} from "@angular/http";
import {BACKEND_ROOT} from "../../../globals";

@Component({
  selector: 'if-node',
  templateUrl: './node.html',
  styleUrls: ['../flow-nodes.component.css']
})
export class IfNodeComponent implements OnInit {
  @Input() node :MetaNode;
  @Input() nodes:MetaNode[];
  @Input() flowId:string;
  localVars:any;
  globalVars:any;
  constructor(public dialog: MatDialog,private http : Http) { }
  ngOnInit() {
    this.loadContext();
  }
  addIfExpression(node:MetaNode){
    let rightVariable = {};
    let expr = {};
    expr["Operand"] = "eq";
    expr["LeftVariableName"] = "";
    expr["LeftVariableIsGlobal"] = false;
    rightVariable["Value"] = 100;
    rightVariable["ValueType"] = "int";
    expr["RightVariable"] = rightVariable
    expr["BooleanOperator"] = "";
    node.Config["Expression"].push(expr);
  }
  loadContext() {
    if (this.flowId) {
      this.http
        .get(BACKEND_ROOT+'/fimp/api/flow/context/'+this.flowId)
        .map(function(res: Response){
          let body = res.json();
          return body;
        }).subscribe ((result) => {
        this.localVars = [];
        for (var key in result){
          this.node
          this.localVars.push(result[key].Name);
        }

      });
    }


    this.http
      .get(BACKEND_ROOT+'/fimp/api/flow/context/global')
      .map(function(res: Response){
        let body = res.json();
        return body;
      }).subscribe ((result) => {
      this.globalVars = [];
      for (var key in result){
        this.globalVars.push(result[key].Name);
      }
    });
  }

  variableSelected(event:any,config:any){



  }
}
