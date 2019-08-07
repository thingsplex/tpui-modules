import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from "@angular/material";
import { Observable } from 'rxjs';
import {FireService} from "app/firebase/fire.service";
import {Headers, Http, RequestOptions} from "@angular/http";
import {BACKEND_ROOT} from "app/globals";


export interface Item { name: string; }

@Component({
  selector: 'flow-lib',
  templateUrl: 'flow-lib.component.html',
  styleUrls: ['flow-lib.component.css']
})
export class FlowLibComponent implements OnInit {
  // private itemsCollection: AngularFirestoreCollection<Item>;
  items: Observable<Item[]>;
  flows: any[];
  constructor(public fire:FireService, private http : Http,public dialog: MatDialog) {
    // this.flowSourceText = JSON.stringify(data, null, 2)
    // this.itemsCollection = afs.collection<Item>('items');
    // this.items = this.itemsCollection.valueChanges();
    this.flows = [];
  }
  ngOnInit() {
    // this.fire.configureUserAuthListener();
    this.loadListOfFlows();
    // if (this.fire.checkUserAuth()){
    //
    // }else {
    //   // this.fire.initFirebaseUi();
    // }
  }
  loadListOfFlows() {
    this.fire.getFlows().then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        console.log(`${doc.id} => ${doc.data()}`);

        var prepData = doc.data()
        prepData.DocId = doc.id
        if (prepData.UpdatedAt) {
          prepData.UpdatedAtDate = prepData.UpdatedAt.toDate();
        }


        console.dir(prepData);
        this.flows.push(prepData)
      })
    }).catch((error) => {
      console.error("Error Loading documents: ", error);
      // this.showSignInDialog()
    });
  }

  // showSignInDialog() {
  // let dialogRef = this.dialog.open(SignInDialog,{
  //   width: '450px',
  // });
  // dialogRef.afterClosed().subscribe(result => {
  //   if (result)
  //   {
  //
  //   }
  // });
  // }

  deleteFlow(docId) {
    this.fire.deleteFlow(docId);
  }

  signOut() {
    this.fire.signOut();
  }
  // signIn() {
  //   this.fire.initFirebaseUi();
  // }

  importFlow(flow){
    // let headers = new Headers({ 'Content-Type': 'application/json' });
    // let options = new RequestOptions({headers:headers});
    // this.http
    //   .post(BACKEND_ROOT+'/fimp/flow/definition/import',JSON.stringify(flow),  options )
    //   .subscribe ((result) => {
    //     console.log("Flow was saved");
    //   });

    this.fire.getFlowUrlById(flow.Id).then((flowUrl) => {
      console.log("Flow URL:"+flowUrl);
      // let headers = new Headers({ 'Content-Type': 'application/json' });
      // let options = new RequestOptions({headers:headers});
      // this.http
      //     .post(BACKEND_ROOT+'/fimp/flow/definition/import',blob,  options )
      //     .subscribe ((result) => {
      //       console.log("Flow was saved");
      //     });
      this.http.put(BACKEND_ROOT+'/fimp/flow/definition/import_from_url', {Url:flowUrl,Token:""}).subscribe(res => console.log(res.json()));
      // this.http.get(flowUrl).subscribe ((result) => {

        // This can be downloaded directly:
        // var xhr = new XMLHttpRequest();
        // xhr.responseType = 'blob';
        // xhr.onload = function(event) {
        //   var blob = xhr.response;
        //   xhr.open('GET', flowUrl);
        //   xhr.send();
        //   console.log("Flow is loaded");
        //   let headers = new Headers({ 'Content-Type': 'application/json' });
        //   let options = new RequestOptions({headers:headers});
        //   this.http
        //     .post(BACKEND_ROOT+'/fimp/flow/definition/import',blob,  options )
        //     .subscribe ((result) => {
        //       console.log("Flow was saved");
        //     });
        //
        //
        // };



      // });
    });



  }


}

/*
 apiKey: "AIzaSyBc53fzFqEtPSVIl1iCOSCyPZNx8BtJayY",
    authDomain: "thingsplex.firebaseapp.com",
    databaseURL: "https://thingsplex.firebaseio.com",
    projectId: "thingsplex",
    storageBucket: "thingsplex.appspot.com",
    messagingSenderId: "867239467755"
 */
