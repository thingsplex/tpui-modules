import {Component, Inject} from "@angular/core";
import {MAT_DIALOG_DATA, MatDialogRef, MatSnackBar} from "@angular/material";

@Component({
  selector: 'flow-props-dialog',
  templateUrl: 'flow-props-dialog.html',
})
export class FlowPropsDialog {
  public flow :any;
  public opType : string;
  constructor(public dialogRef: MatDialogRef<FlowPropsDialog>,@Inject(MAT_DIALOG_DATA) public data:any) {
    this.flow = data;
    if(this.flow.Id=="-"||this.flow.Id=="" || this.flow.Id == undefined) {
      this.opType = "add";
    }else {
      this.opType = "edit";
    }
  }

  save(){
    this.dialogRef.close(this.flow);
  }

}
