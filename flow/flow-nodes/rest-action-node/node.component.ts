import {MetaNode} from "../../flow-editor/flow-editor.component";
import {Component, Input, OnInit} from "@angular/core";
import {MatDialog} from "@angular/material";

@Component({
  selector: 'rest-action-node',
  templateUrl: './node.html',
  styleUrls: ['../flow-nodes.component.css']
})
export class RestActionNodeComponent implements OnInit {
  @Input() node :MetaNode;
  @Input() nodes:MetaNode[];
  shortcuts:any[];
  constructor(public dialog: MatDialog) { }
  ngOnInit() {
    this.loadDefaultConfig();
  }
  addHeader() {
    this.node.Config.Headers.push({"Name":"","Value":""})
  }

  requestPayloadTypeSelected(){
    if(this.node.Config.RequestPayloadType == "json") {
      this.node.Config.Headers.push({"Name":"Content-type","Value":"application/json"})
    }else if(this.node.Config.RequestPayloadType == "xml") {
      this.node.Config.Headers.push({"Name":"Content-type","Value":"text/xml"})
    }

  }

  variableSelected(responseMap,isGlobal:boolean) {
    responseMap.IsVariableGlobal = isGlobal
  }

  addResponseMapping() {
    this.node.Config.ResponseMapping.push({"Name":"","PathType":"json","Path":"","TargetVariableName":"","IsVariableGlobal":false,"TargetVariableType":"string"})
  }

  deleteResponseMapping(configObj:any) {
    var i = this.node.Config.ResponseMapping.indexOf(configObj);
    if(i != -1) {
      this.node.Config.ResponseMapping.splice(i, 1);
    }
  }

  deleteHeader(configObj:any) {
    var i = this.node.Config.Headers.indexOf(configObj);
    if(i != -1) {
      this.node.Config.Headers.splice(i, 1);
    }
  }

  loadDefaultConfig() {
    if (this.node.Config==null) {
      this.node.Config = {
        "Url": "http://",
        "Method": "GET",
        "RequestPayloadType": "json",
        "RequestTemplate": "", "LogResponse": false,
        "Headers": [{"Name": "Content-type", "Value": "application/json"}],
        "ResponseMapping": [],
        "Auth": {
          "Enabled": false,
          "GrantType": "password",
          "Url": "http://",
          "ClientID": "",
          "ClientSecret": "",
          "Scope": "",
          "Username": "",
          "Password": ""
        }
      };
    }else{
      if (this.node.Config.Auth==undefined ) {
        this.node.Config["Auth"] = {
          "Enabled": false,
          "GrantType": "password",
          "Url": "http://",
          "ClientID": "",
          "ClientSecret": "",
          "Scope": "",
          "Username": "",
          "Password": ""
        }

      }
    }
  }


}
