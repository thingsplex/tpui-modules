import { Component, OnInit,Inject } from '@angular/core';
import { Http, Response,URLSearchParams,RequestOptions,Headers }  from '@angular/http';
import { MatDialog, MatDialogRef,MatSnackBar} from '@angular/material';
import { MAT_DIALOG_DATA} from '@angular/material';
import { BACKEND_ROOT } from "app/globals";

@Component({
    selector: 'service-editor-dialog',
    templateUrl: 'service-editor-dialog.html',
  })
  export class ServiceEditorDialog {
    locationId : number;
    alias : string;
    serviceId : number;     
    constructor(public dialogRef: MatDialogRef<ServiceEditorDialog>,@Inject(MAT_DIALOG_DATA) public data: any,public snackBar: MatSnackBar,private http : Http) {
          console.dir(data)
          this.serviceId = data.id
          this.alias = data.alias
          this.locationId = data.locationId
    }
    public onLocationSelected(locationId:number ) {
      console.log("Location selected = "+locationId)
      this.locationId = locationId
  }
    save(){
      let headers = new Headers({ 'Content-Type': 'application/json' });
      let options = new RequestOptions({headers:headers});
      let request = {"id":this.serviceId,"alias":this.alias,"location_id":this.locationId}
      this.http
        .put(BACKEND_ROOT+'/fimp/api/registry/service',JSON.stringify(request),  options )
        .subscribe ((result) => {
           console.log("Service fields were saved");
           this.dialogRef.close("ok");
        });
    }
    
  }
  