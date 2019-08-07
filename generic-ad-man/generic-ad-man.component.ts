import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import { FimpService } from "app/fimp/fimp.service";
import { FimpMessage ,NewFimpMessageFromString } from '../fimp/Message'; 
import { Subscription } from "rxjs/Subscription";
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from "@angular/material";
// import {MatSnackBarModule} from '@angular/material/snack-bar';
import {MatSnackBar} from '@angular/material';

// import {AddDeviceDialog} from "../zwave-man/zwave-man.component";

@Component({
  selector: 'app-generic-ad-man',
  templateUrl: './generic-ad-man.component.html',
  styleUrls: ['./generic-ad-man.component.css']
})
export class GenericAdManComponent implements OnInit {
  nodes : any[];
  globalSub : Subscription;
  adapter : string; // Name of the adapter
  listOfAdapters : string[];
  constructor(public dialog: MatDialog,private fimp:FimpService,private snackBar: MatSnackBar) {
    this.listOfAdapters = [];
  }



  reloadListOfDevices(){
    if (this.adapter != undefined) {
      let msg  = new FimpMessage(this.adapter,"cmd.network.get_all_nodes","null",null,null,null)
      this.fimp.publish("pt:j1/mt:cmd/rt:ad/rn:"+this.adapter+"/ad:1",msg.toString());
    }

  } 

  discover() {
    this.listOfAdapters = [];
    this.fimp.discoverResources()

  }


  addDevice(){
    console.log("Add device")

    let dialogRef = this.dialog.open(AddGenericDeviceDialog, {
      height: '400px',
      width: '600px',
      data : {op:"inclusion",adapter:this.adapter},
    });
    dialogRef.afterClosed().subscribe(result => {
      // this.selectedOption = result;
    });
  }

  removeDevice(address:string){
    console.log("Remove device")
    let val = {"address":address.toString()}
    let msg  = new FimpMessage(this.adapter,"cmd.thing.delete","str_map",val,null,null)
    this.fimp.publish("pt:j1/mt:cmd/rt:ad/rn:"+this.adapter+"/ad:1",msg.toString());
    
  }
  
  generateExclusionReport(address:string){
    let msg  = new FimpMessage(this.adapter,"evt.thing.exclusion_report","object",{"address":String(address)},null,null)
    this.fimp.publish("pt:j1/mt:evt/rt:ad/rn:"+this.adapter+"/ad:1",msg.toString());
    
  }

  onAdapterSelected() {
    this.reloadListOfDevices()
    localStorage.setItem("selectedAdapter",this.adapter);
  }

  ngOnInit() {

    if (localStorage.getItem("selectedAdapter")!=null){
      this.adapter = localStorage.getItem("selectedAdapter");
    }

    if (localStorage.getItem("listOfAdapters")!=null){
      this.listOfAdapters = JSON.parse(localStorage.getItem("listOfAdapters"));
    }else {
       this.discover();
    }

    this.globalSub = this.fimp.getGlobalObservable().subscribe((msg) => {
      console.log(msg.payload.toString());
      let fimpMsg = NewFimpMessageFromString(msg.payload.toString());
      if (fimpMsg.service == this.adapter ){
        if(fimpMsg.mtype == "evt.network.all_nodes_report" )
        { 
          this.nodes = fimpMsg.val;
          localStorage.setItem(this.adapter+"NodesList", JSON.stringify(this.nodes));
        }else if (fimpMsg.mtype == "evt.thing.exclusion_report" || fimpMsg.mtype == "evt.thing.inclusion_report"){
            console.log("Reloading nodes 2");
            this.reloadListOfDevices();
        }

        if (fimpMsg.mtype == "evt.thing.exclusion_report") {
          // Simple message.
          let snackBarRef = this.snackBar.open('Device deleted',"",{
            duration: 5000
          });
        }
      }else if (fimpMsg.mtype == "evt.discovery.report") {
        if (fimpMsg.val.resource_type== "ad") {
          this.listOfAdapters.push(fimpMsg.val.resource_name)
          localStorage.setItem("listOfAdapters", JSON.stringify(this.listOfAdapters));
        }
      }
      //this.messages.push("topic:"+msg.topic," payload:"+msg.payload);
    });

    // Let's load nodes list from cache otherwise reload nodes from zwave-ad .
    if (localStorage.getItem(this.adapter+"NodesList")==null){
      this.reloadListOfDevices();
    }else {
      this.nodes = JSON.parse(localStorage.getItem(this.adapter+"NodesList"));
    }

  }

  ngOnDestroy() {
    if(this.globalSub)
      this.globalSub.unsubscribe();
  }

}


@Component({
  selector: 'add-device-dialog',
  templateUrl: './dialog-add-node.html',
})
export class AddGenericDeviceDialog implements OnInit, OnDestroy  {
  messages:string[]=[];
  globalSub : Subscription;
  customTemplateName : string;
  adapter : string; // Name of the adapter
  constructor(public dialogRef: MatDialogRef<AddGenericDeviceDialog>,private fimp:FimpService,@Inject(MAT_DIALOG_DATA) public data: any) {
    this.adapter = data.adapter
  }
  ngOnInit(){
    this.messages = [];
    this.globalSub = this.fimp.getGlobalObservable().subscribe((msg) => {

      let fimpMsg = NewFimpMessageFromString(msg.payload.toString());
      if (fimpMsg.service == this.adapter )
      {
        if(fimpMsg.mtype == "evt.thing.inclusion_report" )
        {
          this.messages.push("Node added :"+fimpMsg.val.address);
          this.messages.push("Product name :"+fimpMsg.val.product_name);
        } else if (fimpMsg.mtype == "evt.thing.exclusion_report" ){
          this.messages.push("Node removed :"+fimpMsg.val.address);
        }
        else if (fimpMsg.mtype == "evt.thing.inclusion_status_report" ){
          this.messages.push("New state :"+fimpMsg.val);
        } else if (fimpMsg.mtype == "evt.error.report" ){
          this.messages.push("Error : code:"+fimpMsg.val+" message:"+fimpMsg.props["msg"]);
        }
      }
    });
  }
  ngOnDestroy() {
    if(this.globalSub)
      this.globalSub.unsubscribe();
  }

  startInclusion(){
    this.messages = [];
    this.messages.push("Network is open.");
    var props = new Map<string,string>();
    props["template_name"] = this.customTemplateName;
    let msg  = new FimpMessage(this.adapter,"cmd.thing.inclusion","bool",true,props,null)
    this.fimp.publish("pt:j1/mt:cmd/rt:ad/rn:"+this.adapter+"/ad:1",msg.toString());
  }
  stopInclusion(){
    let msg  = new FimpMessage(this.adapter,"cmd.thing.inclusion","bool",false,null,null)
    this.fimp.publish("pt:j1/mt:cmd/rt:ad/rn:"+this.adapter+"/ad:1",msg.toString());
    this.dialogRef.close();
  }



}
