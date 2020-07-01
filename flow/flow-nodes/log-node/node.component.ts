import {MetaNode} from "../../flow-editor/flow-editor.component";
import {Component, Input, OnInit} from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import {ContextVariable} from "../../flow-context/variable-selector.component";

@Component({
  selector: 'log-node',
  templateUrl: './node.html',
  styleUrls: ['../flow-nodes.component.css']
})
export class LogNodeComponent implements OnInit {
  @Input() node :MetaNode;
  @Input() nodes:MetaNode[];
  @Input() flowId:string;
  localVars:any;
  globalVars:any;

  constructor(public dialog: MatDialog) {
  }

  ngOnInit() {
    this.loadDefaultConfig();

  }

  loadDefaultConfig() {
    if (this.node.Config == null) {
      this.node.Config = {
        "VariableName": "",
        "IsVariableGlobal": false,
        "LogLevel": "info",
        "Text":""
      }
    }
  }

  inputVariableSelected(cvar:ContextVariable) {
    this.node.Config.VariableName = cvar.Name;
    this.node.Config.IsVariableGlobal = cvar.isGlobal;
  }

}
