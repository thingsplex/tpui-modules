import { Component, OnInit,Inject } from '@angular/core';
import { Http, Response,URLSearchParams,RequestOptions,Headers }  from '@angular/http';
import { MatDialog, MatDialogRef,MatSnackBar} from '@angular/material';
import { MAT_DIALOG_DATA} from '@angular/material';
import { BACKEND_ROOT } from "app/globals";

@Component({
    selector: 'location-editor-dialog',
    templateUrl: 'location-editor-dialog.html',
  })
  export class LocationEditorDialog {
    locationId : number;
    alias : string;
    type : string;
    address : string;     
    constructor(public dialogRef: MatDialogRef<LocationEditorDialog>,@Inject(MAT_DIALOG_DATA) public data: any,public snackBar: MatSnackBar,private http : Http) {
          console.dir(data)
          if (data){
            this.locationId = Number(data.id);
            this.alias = data.alias
            this.type = data.type
            this.address = data.address
          }
          
    }
    onLocationSeleted(locationId:number ) {
        console.log("Location selected = "+locationId)
    }
    save(){
      let headers = new Headers({ 'Content-Type': 'application/json' });
      let options = new RequestOptions({headers:headers});
      let request = {"id":this.locationId,"alias":this.alias,"type":this.type,"address":this.address}
      this.http
        .put(BACKEND_ROOT+'/fimp/api/registry/location',JSON.stringify(request),  options )
        .subscribe ((result) => {
           console.log("Location fields were saved");
           this.dialogRef.close("ok");
        });
    }
    
  }
  