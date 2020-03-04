import { Component, OnInit,Inject } from '@angular/core';
import { Http, Response,URLSearchParams,RequestOptions,Headers }  from '@angular/http';
import { MatDialog, MatDialogRef,MatSnackBar} from '@angular/material';
import { MAT_DIALOG_DATA} from '@angular/material';
import { BACKEND_ROOT } from "app/globals";

@Component({
    selector: 'service-run-dialog',
    templateUrl: 'service-run-dialog.html',
  })
  export class ServiceRunDialog {
    locationId : number;
    alias : string;
    serviceId : number;
    interfaces : any;
    constructor(public dialogRef: MatDialogRef<ServiceRunDialog>,@Inject(MAT_DIALOG_DATA) public data: any,public snackBar: MatSnackBar) {
          console.dir(data)
          this.interfaces = data.interfaces
    }
    public onLocationSelected(locationId:number ) {
      console.log("Location selected = "+locationId)
      this.locationId = locationId
    }

  }
