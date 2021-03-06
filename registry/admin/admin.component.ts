import { Component, OnInit } from '@angular/core';
import { BACKEND_ROOT } from "app/globals";
import { Http, Response,URLSearchParams }  from '@angular/http';
import {FimpService} from "../../fimp/fimp.service";
import {FimpMessage} from "../../fimp/Message";

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {

  constructor(private http : Http, private fimp:FimpService) { }

  ngOnInit() {
  }


  public vinculumSyncRooms(){
    let msg  = new FimpMessage("tpflow","cmd.registry.sync_rooms","null",null,null,null)
    this.fimp.publish("pt:j1/mt:cmd/rt:app/rn:registry/ad:1",msg.toString());
  }

  public vinculumSyncDevices(){
    let msg  = new FimpMessage("tpflow","cmd.registry.sync_devices","null",null,null,null)
    this.fimp.publish("pt:j1/mt:cmd/rt:app/rn:registry/ad:1",msg.toString());
  }


  public clearRegistry(){
    // let val = {"id":this.thingId,"alias":this.alias,"location_id":this.locationId}
    let msg  = new FimpMessage("tpflow","cmd.registry.factory_reset","null",null,null,null)
    this.fimp.publish("pt:j1/mt:cmd/rt:app/rn:registry/ad:1",msg.toString());
  }
 
  public reindexRegistry(){
    this.http
    .post(BACKEND_ROOT+'/fimp/api/registry/reindex',null)
    .subscribe ((result) => {
       console.log("DB reindexed successfully");
    });
  }

  public sendExclusionEvent(adapter,address: string) {
    let val = {"address":address};
    let msg  = new FimpMessage(adapter,"evt.thing.exclusion_report","object",val,null,null);
    let topicAdapter = adapter.replace("zwave-ad","zw");
    this.fimp.publish("pt:j1/mt:evt/rt:ad/rn:"+topicAdapter+"/ad:1",msg.toString());
  }
}
