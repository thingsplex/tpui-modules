import {Component, EventEmitter, Input, OnInit, Output} from "@angular/core";
import {BACKEND_ROOT} from "app/globals";
import {TableContextRec} from "./model";
import {RecordEditorDialog} from "./record-editor-dialog.component";
import { MatDialog } from "@angular/material/dialog";
import {HttpClient} from "@angular/common/http";

export class ContextVariable {

  Name : string;
  Type : string;
  Value : any;
  isGlobal : boolean;
  InMemory:boolean;
}

@Component({
  selector: 'variable-selector',
  templateUrl: './variable-selector.html',
  // styleUrls: ['./locations.component.css']
})
export class VariableSelectorComponent implements OnInit {
    @Input() variableName : string;
    @Input() isGlobal : boolean;
    @Input() inMemory : boolean;
    @Input() label : string;
    @Input() flowId:string;
    @Output() onSelect = new EventEmitter<ContextVariable>();
    variableType : string;
    vars:ContextVariable[];

  ngOnInit() {
    this.loadContext();
  }
  constructor(private http : HttpClient,public dialog: MatDialog) {
  }

  loadContext() {
    this.vars = [];

    if (this.flowId) {

      this.http
        .get(BACKEND_ROOT+'/fimp/api/flow/context/'+this.flowId)
        .subscribe ((result) => {
        let isVariableInList = false;
        for (var key in result){
          let v = new ContextVariable()
          v.isGlobal = false
          v.Name  = result[key].Name
          v.Type = result[key].Variable.ValueType;
          v.Value = result[key].Variable.Value;
          if (result[key].InMemory != undefined) {
            v.InMemory = result[key].InMemory
          }else {
            v.InMemory = false
          }
          this.vars.push(v);
          if ( v.Name == this.variableName)
            isVariableInList = true ;
        }
        if (!this.isGlobal && !isVariableInList) {
          let v = new ContextVariable()
          v.isGlobal = false
          v.Name  = this.variableName;
          v.Type = this.variableType;
          v.InMemory = this.inMemory;
          this.vars.push(v);
        }

      });
    }


    this.http
      .get(BACKEND_ROOT+'/fimp/api/flow/context/global')
      .subscribe ((result) => {
      let isVariableInList = false;
      for (var key in result){
        let v = new ContextVariable()
        v.isGlobal = true
        v.Name  = result[key].Name;
        v.Type = result[key].Variable.ValueType;
        v.Value = result[key].Variable.Value;
        v.InMemory = result[key].InMemory;
        this.vars.push(v);
        if (v.isGlobal == this.isGlobal && v.Name == this.variableName)
          isVariableInList = true ;

        if (this.isGlobal && !isVariableInList) {
          let v = new ContextVariable()
          v.isGlobal = false
          v.Name  = this.variableName;
          v.Type = this.variableType;
          v.InMemory = this.inMemory;
          this.vars.push(v);
        }
      }
    });

  }

  showContextVariableDialog() {
    var ctxRec = new TableContextRec();
    if (this.isGlobal)
      ctxRec.FlowId == "global";
    else
      ctxRec.FlowId = this.flowId;
    let dialogRef = this.dialog.open(RecordEditorDialog,{
      width: '450px',
      data:ctxRec
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result)
      {
        this.variableName = result.Name
        this.variableType = result.ValueType
        this.onSelected();
        this.loadContext();

      }
    });
  }

  getVariableByName(name:string,isGlobal:boolean):ContextVariable {
    for (let v of this.vars) {
      if(v.Name == name && v.isGlobal == isGlobal) {
        return v;
      }
    }
    return null;

  }

  onSelected() {
      var event = new ContextVariable();
      console.log("OnSelected variable name = "+this.variableName );
      event.Name = this.variableName;
      event.Type = this.variableType
      event.isGlobal = this.isGlobal;
      event.InMemory = this.inMemory;

     if(this.variableName=="") {
       var event = new ContextVariable();
       event.Name = "";
       this.onSelect.emit(event);
     }
     if (this.variableType == undefined){
       event = this.getVariableByName(this.variableName,this.isGlobal)

     }
     if (event) {
       this.onSelect.emit(event);
     }

  }

}
