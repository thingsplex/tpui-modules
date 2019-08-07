import { Component, OnInit ,Input } from '@angular/core';
import { MetaNode, ServiceLookupDialog } from "../flow-editor/flow-editor.component";
import { MatDialog, MatDialogRef} from '@angular/material';

@Component({
  selector: 'app-flow-nodes',
  templateUrl: './flow-nodes.component.html',
  styleUrls: ['./flow-nodes.component.css']
})
export class FlowNodesComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}


@Component({
  selector: 'set-variable-node',
  templateUrl: './set-variable-node.html',
  styleUrls: ['./flow-nodes.component.css']
})
export class SetVariableNodeComponent implements OnInit {
  @Input() node :MetaNode;
  @Input() nodes:MetaNode[];
  @Input() flowId:string;
  public valueSource:string;
  constructor(public dialog: MatDialog) { }
  ngOnInit() {
    if (this.node.Config.DefaultValue.ValueType == "") {
      this.valueSource = "input";
    }else {
      this.valueSource = "value";
    }
  }

  valueSourceSelected() {
    console.log("Input source changed");
    if (this.valueSource=="value") {
      this.node.Config.Name = "";
    }else {
      this.node.Config.DefaultValue.ValueType = "";
    }
  }

  resultVariableSelected(cvar) {
    this.node.Config.Name = cvar.Name;
    if (this.valueSource=="value")
       this.node.Config.DefaultValue.ValueType = cvar.Type;
    else
       this.node.Config.DefaultValue.ValueType = "";

    this.node.Config.UpdateGlobal = cvar.isGlobal;
    // this.node.Config.IsTargetVariableInMemory = cvar.InMemory;
  }
}



@Component({
  selector: 'receive-node',
  templateUrl: './receive-node.html',
  styleUrls: ['./flow-nodes.component.css']
})
export class ReceiveNodeComponent implements OnInit {
  @Input() node :MetaNode;
  @Input() nodes:MetaNode[];
  constructor(public dialog: MatDialog) { }

  ngOnInit() {
  }
  serviceLookupDialog(nodeId:string) {
    let dialogRef = this.dialog.open(ServiceLookupDialog,{
            width: '500px',
            data:"out"
          });
    dialogRef.afterClosed().subscribe(result => {
      console.dir(result)
      if (result)
        this.nodes.forEach(element => {
            if (element.Id==nodeId) {
              element.Service = result.serviceName
              if(element.Label==""||element.Label==undefined){
                element.Label =  result.serviceAlias + " at "+result.locationAlias
              }
              element.ServiceInterface = result.intfMsgType
              element.Address = result.intfAddress
              element.Config.ValueFilter.ValueType =  result.intfValueType
            }
        });
    });
  }
}


/*type TimeTriggerConfig struct {
	DefaultMsg model.Variable
	Expressions []TimeExpression
	GenerateAstroTimeEvents bool
	Latitude float64
	Longitude float64
}

type TimeExpression struct {
	Name string
	Expression string   //https://godoc.org/github.com/robfig/cron#Job
	Comment string
}
 */

@Component({
  selector: 'time-trigger-node',
  templateUrl: './time-trigger-node.html',
  styleUrls: ['./flow-nodes.component.css']
})
export class TimeTriggerNodeComponent implements OnInit {
  @Input() node :MetaNode;
  @Input() nodes:MetaNode[];
  constructor(public dialog: MatDialog) { }
  ngOnInit() {
  }
}



@Component({
  selector: 'loop-node',
  templateUrl: './loop-node.html',
  styleUrls: ['./flow-nodes.component.css']
})
export class LoopNodeComponent implements OnInit {
  @Input() node :MetaNode;
  @Input() nodes:MetaNode[];
  constructor(public dialog: MatDialog) { }
  ngOnInit() {

  }
}

@Component({
  selector: 'wait-node',
  templateUrl: './wait-node.html',
  styleUrls: ['./flow-nodes.component.css']
})
export class WaitNodeComponent implements OnInit {
  @Input() node :MetaNode;
  @Input() nodes:MetaNode[];
  constructor(public dialog: MatDialog) { }
  ngOnInit() {
  }
}

