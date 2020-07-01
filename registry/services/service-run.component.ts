import { Component, OnInit,Inject } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

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
