import { Component, OnInit ,Input ,Pipe, PipeTransform } from '@angular/core';
import {Interface, Service} from "../model";
import { FimpService } from 'app/fimp/fimp.service';
import { FimpMessage ,NewFimpMessageFromString } from 'app/fimp/Message';
import {DomSanitizer} from '@angular/platform-browser';

@Component({
  selector: 'thing-intf-ui',
  templateUrl: './thing-intf-ui.component.html',
  styleUrls: ['./thing-intf-ui.component.css'],
})
export class ThingIntfUiComponent implements OnInit {
  @Input() intf: Interface;
  @Input() serv: Service;
  @Input() msgType : string;
  @Input() addr: string;
  @Input() service :string;
  backgroundColor :string
  constructor(private fimp:FimpService, public _DomSanitizationService: DomSanitizer) {

    // this.fimp.getGlobalObservable().subscribe((msg) => {
    // let fimpMsg = NewFimpMessageFromString(msg.payload.toString());
    // });
    this.backgroundColor = 'rgb(0,0 ,0)';
   }

  ngOnInit() {
  }
  updateBackgroundColor(r:number,g:number,b:number) {
    this.backgroundColor = "rgb("+r+","+g+" ,"+b+")";
  }

  cmdBinarySet(val:boolean){
    let msg  = new FimpMessage(this.service,this.intf.msgType,this.intf.valueType,val,null,null)
    this.fimp.publish("pt:j1/mt:cmd"+this.addr,msg.toString());
  }
  cmdConfigSet(name:string,value:string){
    let val = {};
    val[name] = value;
    let msg  = new FimpMessage(this.service,this.intf.msgType,this.intf.valueType,val,null,null)
    this.fimp.publish("pt:j1/mt:cmd"+this.addr,msg.toString());
  }
  cmdSetBoolArrayOneItem(name:string,value:boolean){
    let val = {};
    val[name] = value;
    console.dir(val);
    let msg  = new FimpMessage(this.service,this.intf.msgType,this.intf.valueType,val,null,null)
    this.fimp.publish("pt:j1/mt:cmd"+this.addr,msg.toString());
  }
  cmdLvlSet(level:number,duration:number){
    var props = new Map<string,string>() ;
    props["duration"] = String(duration);
    let msg  = new FimpMessage(this.service,this.intf.msgType,this.intf.valueType,level,props,null)
    this.fimp.publish("pt:j1/mt:cmd"+this.addr,msg.toString());
  }
  cmdColorSet(compName:string,lvl:number){
    var val = new Map<string,string>() ;
    val[compName] = lvl;
    let msg  = new FimpMessage(this.service,this.intf.msgType,this.intf.valueType,val,null,null)
    this.fimp.publish("pt:j1/mt:cmd"+this.addr,msg.toString());
  }
  cmdSetpointSet(setpointType:string,temp:string){
    let val = {};
    val["type"] = setpointType;
    val["temp"] = temp;
    let msg  = new FimpMessage(this.service,this.intf.msgType,this.intf.valueType,val,null,null)
    this.fimp.publish("pt:j1/mt:cmd"+this.addr,msg.toString());
  }
  cmdModeLvlSet(mode:string,lvl:number){
    let val = {};
    val[mode] = lvl*1;
    let msg  = new FimpMessage(this.service,this.intf.msgType,this.intf.valueType,val,null,null)
    this.fimp.publish("pt:j1/mt:cmd"+this.addr,msg.toString());
  }
  cmdSetpointReportGet(name:string){
    let msg  = new FimpMessage(this.service,this.intf.msgType,this.intf.valueType,name,null,null)
    this.fimp.publish("pt:j1/mt:cmd"+this.addr,msg.toString());
  }
  cmdModeSet(mode:string){
    let msg  = new FimpMessage(this.service,this.intf.msgType,this.intf.valueType,mode,null,null)
    this.fimp.publish("pt:j1/mt:cmd"+this.addr,msg.toString());
  }


  cmdLevelStart(direction:string,duration:number){
    var val = direction;
    var props = new Map<string,string>() ;
    props["duration"] = String(duration);
    let msg  = new FimpMessage(this.service,this.intf.msgType,this.intf.valueType,val,props,null)
    this.fimp.publish("pt:j1/mt:cmd"+this.addr,msg.toString());
  }
  cmdLevelStop(direction:string){
    let msg  = new FimpMessage(this.service,this.intf.msgType,this.intf.valueType,null,null,null)
    this.fimp.publish("pt:j1/mt:cmd"+this.addr,msg.toString());
  }

  cmdGroupSet(group:string,member:string){
    let val = {};
    val["group"] = group;
    val["members"] = [member];
    let msg  = new FimpMessage(this.service,this.intf.msgType,this.intf.valueType,val,null,null)
    this.fimp.publish("pt:j1/mt:cmd"+this.addr,msg.toString());
  }
  cmdGroupReportGet(group:string){
    let msg  = new FimpMessage(this.service,this.intf.msgType,this.intf.valueType,group,null,null)
    this.fimp.publish("pt:j1/mt:cmd"+this.addr,msg.toString());
  }
  cmdModeLvlReportGet(mode:string){
    let msg  = new FimpMessage(this.service,this.intf.msgType,this.intf.valueType,mode,null,null)
    this.fimp.publish("pt:j1/mt:cmd"+this.addr,msg.toString());
  }
  cmdStateSet(state:string){
    let msg  = new FimpMessage(this.service,this.intf.msgType,this.intf.valueType,state,null,null)
    this.fimp.publish("pt:j1/mt:cmd"+this.addr,msg.toString());
  }
  cmdConfigReportGet(name:string){
    let val = [name];
    let msg  = new FimpMessage(this.service,this.intf.msgType,this.intf.valueType,val,null,null)
    this.fimp.publish("pt:j1/mt:cmd"+this.addr,msg.toString());
  }

  cmdGetReportNull(){
    let msg  = new FimpMessage(this.service,this.intf.msgType,this.intf.valueType,null,null,null)
    this.fimp.publish("pt:j1/mt:cmd"+this.addr,msg.toString());
  }

  cmdMeterReportGet(unit:string){
    let msg  = new FimpMessage(this.service,this.intf.msgType,this.intf.valueType,unit,null,null)
    this.fimp.publish("pt:j1/mt:cmd"+this.addr,msg.toString());
  }
  cmdSensorReportGet(unit:string){
    let msg  = new FimpMessage(this.service,this.intf.msgType,this.intf.valueType,unit,null,null)
    this.fimp.publish("pt:j1/mt:cmd"+this.addr,msg.toString());
  }
  cmdSendMap(val:any) {
    let msg  = new FimpMessage(this.service,this.intf.msgType,this.intf.valueType,val,null,null)
    this.fimp.publish("pt:j1/mt:cmd"+this.addr,msg.toString());
  }

}
@Pipe({name: 'keys'})
export class KeysPipe implements PipeTransform {
  transform(value, args:string[]) : any {
    if (!value) {
      return value;
    }

    let keys = [];
    for (let key in value) {
      keys.push({key: key, value: value[key]});
    }
    return keys;
  }
}
