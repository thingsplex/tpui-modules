import { Component, OnInit,Inject } from '@angular/core';
import { MatDialog, MatDialogRef,MatSnackBar} from '@angular/material';
import { MAT_DIALOG_DATA} from '@angular/material';
import {FimpService} from "app/fimp/fimp.service";
import {FimpMessage} from "app/fimp/Message";

@Component({
    selector: 'thing-editor-dialog',
    templateUrl: 'thing-editor-dialog.html',
  })
  export class ThingEditorDialog {
    locationId : number;
    alias : string;
    thingId : number;
    constructor(public dialogRef: MatDialogRef<ThingEditorDialog>,@Inject(MAT_DIALOG_DATA) public data: any,public snackBar: MatSnackBar,private fimp:FimpService) {
          console.dir(data)
          this.thingId = data.id
          this.alias = data.alias
          this.locationId = data.locationId
    }
    onLocationSelected(locationId:number ) {
        console.log("Location selected = "+locationId)
        this.locationId = locationId
    }
    save(){
      let val = {"id":this.thingId,"alias":this.alias,"location_id":this.locationId}
      let msg  = new FimpMessage("tpflow","cmd.registry.update_thing","object",val,null,null)
      this.fimp.publish("pt:j1/mt:cmd/rt:app/rn:tpflow/ad:1",msg.toString());
      this.dialogRef.close("ok");
    }

  }
