import { Component, OnInit,Inject } from '@angular/core';
import { MatDialog, MatDialogRef,MatSnackBar} from '@angular/material';
import { MAT_DIALOG_DATA} from '@angular/material';
import { BACKEND_ROOT } from "app/globals";
import {Variable} from "../flow-editor/flow-editor.component";
import {TableContextRec} from "./model";
import {ContextRecord} from "./model"
import {HttpClient, HttpHeaders} from "@angular/common/http";

@Component({
    selector: 'record-editor-dialog',
    templateUrl: 'record-editor-dialog.html',
    styleUrls: ['./flow-context.component.css']
  })
  export class RecordEditorDialog {
    ctxRec : TableContextRec;
    constructor(public dialogRef: MatDialogRef<RecordEditorDialog>, @Inject(MAT_DIALOG_DATA) public data: TableContextRec, public snackBar: MatSnackBar, private http : HttpClient) {
          this.ctxRec = data;
          console.dir(data)
    }

    save(){
      let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
      let options = {headers:headers};
      let request = new ContextRecord();
      request.Name = this.ctxRec.Name;
      request.Variable = new Variable();
      if (this.ctxRec.Value == undefined) {
        request.Variable.Value = "";
      }else {
        request.Variable.Value = this.ctxRec.Value;
      }

      request.Variable.ValueType = this.ctxRec.ValueType;
      request.Description = this.ctxRec.Description;
      if (this.ctxRec.FlowId == null ) {
        this.ctxRec.FlowId = "global";
      }
      this.http
        .post(BACKEND_ROOT+'/fimp/api/flow/context/record/'+this.ctxRec.FlowId,request,  options )
        .subscribe ((result) => {
           console.log("Context record was saved");
          this.snackBar.open('Saved',null,{duration: 2000});
           this.dialogRef.close(this.ctxRec);
        },(result)=> {
          this.snackBar.open('Error !!! . Save the flow and try again.',null,{duration: 10000});
        });
    }
    onTypeSelected(event) {
      console.log("Type selected")
      if (this.ctxRec.ValueType == "int" || this.ctxRec.ValueType == "float") {
        if ( typeof this.ctxRec.Value == "string" || typeof this.ctxRec.Value == "boolean" || this.ctxRec.Value == undefined) {
          this.ctxRec.Value = 0;
        }
      }else if (this.ctxRec.ValueType == "bool") {
        if (typeof this.ctxRec.Value == "string"|| typeof this.ctxRec.Value == "number" || this.ctxRec.Value == undefined) {
          this.ctxRec.Value = true;
        }
      }else {
        if (this.ctxRec.Value == undefined || typeof this.ctxRec.Value == "number" || typeof this.ctxRec.Value == "boolean") {
          this.ctxRec.Value = "";
        }
      }


    }
    delete() {
    this.http
      .delete(BACKEND_ROOT+'/fimp/api/flow/context/record/'+this.ctxRec.FlowId+'/'+this.ctxRec.Name)
      .subscribe ((result) => {
        this.dialogRef.close("ok");
      });
    }

}
