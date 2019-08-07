import {Component, ElementRef, ViewChild, OnInit, Input} from '@angular/core';
import {DataSource} from '@angular/cdk/collections';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {Observable} from 'rxjs/Observable';
import { Http, Response,URLSearchParams }  from '@angular/http';
import 'rxjs/add/operator/startWith';
import 'rxjs/add/observable/merge';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/observable/fromEvent';
import { BACKEND_ROOT } from "app/globals";
import {ThingEditorDialog} from "../../registry/things/thing-editor.component";
import {Thing} from "../../registry/model";
import {MatDialog} from "@angular/material";
import {RecordEditorDialog} from "./record-editor-dialog.component";
import {TableContextRec} from "./model"


@Component({
  selector: 'flow-context',
  templateUrl: './flow-context.component.html',
  styleUrls: ['./flow-context.component.css']
})
export class FlowContextComponent implements OnInit {
  @Input() isEmbedded : boolean;
  @Input() flowId : string;
  loadMode : string
  displayedColumns = ['flowId','name','description','valueType','value','updatedAt','action'];
  dataSource: FlowContextDataSource | null;
  constructor(private http : Http,public dialog: MatDialog) {
  }
  ngOnInit() {
    if (!this.flowId) {
      this.flowId = "global";
    }
    this.dataSource = new FlowContextDataSource(this.http,this.flowId);
    // console.log("Is embedded = "+this.isEmbedded);
    if (this.isEmbedded) {
      this.loadMode = "local"
    }else {
      this.loadMode = "global"
    }
  }

  showRecordEditorDialog(ctxRec:TableContextRec) {
    ctxRec.FlowId = "global";
    let dialogRef = this.dialog.open(RecordEditorDialog,{
      width: '450px',
      data:ctxRec
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result)
      {
        this.dataSource.getData("global")
      }
    });
  }

  showAddNewRecordEditorDialog() {
    var ctxRec = new TableContextRec();
    ctxRec.FlowId = "global";
    let dialogRef = this.dialog.open(RecordEditorDialog,{
      width: '450px',
      data:ctxRec
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result)
      {
        this.dataSource.getData("global");
      }
    });
  }

  onModeChange(event:any) {
    if(this.loadMode == "global") {
      this.dataSource.getData("global");
    }else {
      this.dataSource.getData(this.flowId);
    }
  }

  reload() {
    this.dataSource.getData(this.flowId);
  }


}


export class FlowContextDataSource extends DataSource<any> {
  ctxRecordsObs = new BehaviorSubject<TableContextRec[]>([]);

  constructor(private http : Http,private flowId:string) {
    super();
    console.log("Getting context data")
    this.getData(flowId);
  }

  getData(flowId:string) {
    this.http
        .get(BACKEND_ROOT+'/fimp/api/flow/context/'+flowId)
        .map((res: Response)=>{
          let result = res.json();
          return this.mapContext(result,flowId);
        }).subscribe(result=>{
          this.ctxRecordsObs.next(result);
          console.log("Mappping global variable")
        });
    // if(this.flowId)
    //   this.http
    //     .get(BACKEND_ROOT+'/fimp/api/flow/context/'+this.flowId)
    //     .map((res: Response)=>{
    //       let result = res.json();
    //       return this.mapContext(result,this.flowId);
    //     }).subscribe(result=>{
    //
    //       this.ctxRecordsObs.next(this.ctxRecordsObs.getValue().concat(result));
    //   });

  }

  connect(): Observable<TableContextRec[]> {
    return this.ctxRecordsObs ;
  }
  disconnect() {}

  mapContext(result:any,flowId:string):TableContextRec[] {
    let contexts : TableContextRec[] = [];
    for (var key in result){
            let loc = new TableContextRec();
            loc.FlowId = flowId;
            loc.Name = result[key].Name;
            loc.Description = result[key].Description;
            loc.UpdatedAt = result[key].UpdatedAt;
            loc.Value = result[key].Variable.Value;
            loc.ValueType = result[key].Variable.ValueType;
            contexts.push(loc)
     }
     return contexts;
  }
}
