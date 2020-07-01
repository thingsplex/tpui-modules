import { Component, OnInit } from '@angular/core';
import { BACKEND_ROOT } from "app/globals";
import {FlowLogDialog, FlowSourceDialog} from "../flow-editor/flow-editor.component";
import { MatDialog } from "@angular/material/dialog";
import {HttpClient, HttpHeaders} from "@angular/common/http";

@Component({
  selector: 'flow-overview',
  templateUrl: './flow-overview.component.html',
  styleUrls: ['./flow-overview.component.css']
})
export class FlowOverviewComponent implements OnInit {
  flows : any[];
  groups : string[];
  filter : string;
  constructor(private http : HttpClient,public dialog: MatDialog) {
    this.filter = "RUNNING"
  }

  ngOnInit() {
    this.loadListOfFlows()
  }
  loadListOfFlows() {
     this.http
      .get(BACKEND_ROOT+'/fimp/flow/list')
      .subscribe ((result:any) => {
         this.flows = result;
         var groupsSet = new Set();
         for (let gr of this.flows) {
           groupsSet.add(gr.Group);

         }

         this.flows.forEach((value, index,ar) => {
           groupsSet.add(value.Group);
           if(ar[index].Stats.LastExecutionTime>10000000) {
              ar[index].Stats.LastExecutionTime = 0;
           }
         })

         this.groups = [];
         groupsSet.forEach((value:string) => {
           this.groups.push(value);
         })
       // console.dir(this.groups);
         // var it =  groupsSet.entries();
         // for (let gr3 of it) {
         //   this.groups.push(gr3[0]);
         //   }

      });
  }
  deleteFlow(id:string) {
     this.http
      .delete(BACKEND_ROOT+'/fimp/flow/definition/'+id)
      .subscribe ((result) => {
         this.loadListOfFlows()
      });
  }

  sendFlowControlCommand(flowId:string,command:string) {
    this.http
      .post(BACKEND_ROOT+'/fimp/flow/ctrl/'+flowId+'/'+command,null,  {} )
      .subscribe ((result) => {
        console.log("Cmd was sent");
        this.loadListOfFlows();
      });
  }

  openFlowImportWindow() {
    let dialogRef = this.dialog.open(FlowSourceDialog,{
      // height: '95%',
      width: '95%',
      data:{}
    });
    dialogRef.afterClosed().subscribe(result => {
      if(result)
         this.importFlow(result)
         setTimeout(result => {
           this.loadListOfFlows()
         },1000)

    });
  }

  importFlow(flow){
    let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    let options = {headers:headers};
    this.http
      .put(BACKEND_ROOT+'/fimp/flow/definition/import',flow,  options )
      .subscribe ((result) => {
        console.log("Flow was saved");
      });
  }

  showLog() {
    let dialogRef = this.dialog.open(FlowLogDialog,{
      // height: '95%',
      width: '95%',
      data:{flowId:"",mode:"all_flows"}
    });
    dialogRef.afterClosed().subscribe(result => {

    });
  }


}
