import {Component, Inject} from "@angular/core";
import {MAT_DIALOG_DATA, MatDialogRef, MatSnackBar} from "@angular/material";

@Component({
  selector: 'flow-props-dialog',
  templateUrl: 'flow-props-dialog.html',
})
export class FlowPropsDialog {
  public flow :any;
  public opType : string;
  public settings : any[];
  public hasCustomSettings = false;
  constructor(public dialogRef: MatDialogRef<FlowPropsDialog>,@Inject(MAT_DIALOG_DATA) public data:any) {
    this.flow = data;
    this.settings = [];
    if(this.flow.Id=="-"||this.flow.Id=="" || this.flow.Id == undefined) {
      this.opType = "add";
    }else {
      this.opType = "edit";
    }
    console.log("props dialog")
    console.dir(this.flow.Settings)
    for(let k in this.flow.Settings) {
      let v = this.flow.Settings[k]
      v["Key"] = k;
      this.settings.push(v);
      this.hasCustomSettings = true;
    }
    console.dir(this.settings)
  }

  save(){
    // if (this.hasCustomSettings) {
    //   for(let s in this.settings) {
    //     this.flow.Settings[]
    //   }
    // }
    this.dialogRef.close(this.flow);
  }

}
