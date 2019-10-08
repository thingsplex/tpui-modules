import {MetaNode, ServiceLookupDialog} from "../../flow-editor/flow-editor.component";
import {Component, Input, OnInit} from "@angular/core";
import {MatDialog} from "@angular/material";
// import {Http, Response} from "@angular/http";
import { HttpClient } from '@angular/common/http';
import {BACKEND_ROOT} from "../../../../globals";
import {ContextVariable} from "../../flow-context/variable-selector.component";
import {ServiceInterface} from "../../../registry/model";
import {Subscription} from "rxjs";
import {FimpMessage, NewFimpMessageFromString} from "../../../../fimp/Message";
import {FimpService} from "../../../../fimp/fimp.service";

@Component({
  selector: 'action-node',
  templateUrl: './node.html',
  styleUrls: ['../flow-nodes.component.css']
})
export class ActionNodeComponent implements OnInit {
  @Input() node :MetaNode;
  @Input() nodes:MetaNode[];
  @Input() flowId:string;
  localVars:any;
  globalVars:any;
  complexValueAsString:any; //string representation of node.Config.DefaultValue.Value
  propsAsString:any;
  constructor(public dialog: MatDialog) {
  }

  ngOnInit() {
    this.loadDefaultConfig();
    // backword compatability
    if (this.node.Config.VariableName=="undefined"){
      this.node["DefaultValue"] = {"Value":"","ValueType":""};
      this.node["VariableName"] = "";
      this.node["IsVariableGlobal"] = false;
    }
    try{
      this.complexValueAsString = JSON.stringify(this.node.Config.DefaultValue.Value);
    }catch (err){
      console.log("Can't stringify complex default value")
    }
    try{
      this.propsAsString = JSON.stringify(this.node.Config.Props);
    }catch (err){
      console.log("Can't stringify props ")
    }

  }
  updateComplexValue(){
    this.node.Config.DefaultValue.Value = JSON.parse(this.complexValueAsString)
  }
  updateProps(){
    this.node.Config.Props = JSON.parse(this.propsAsString)
  }

  onServiceConfigured(service:ServiceInterface) {
    this.node.Address = service.intfAddress;
    this.node.Service = service.serviceName;
    this.node.ServiceInterface = service.intfMsgType;
  }

  serviceLookupDialog(nodeId:string) {
    let dialogRef = this.dialog.open(ServiceLookupDialog,{
      width: '500px',
      data:"in"
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result)
        this.nodes.forEach(element => {

          if (element.Id==nodeId) {
            element.Service = result.serviceName
            if(element.Label==""||element.Label==undefined){
              element.Label =  result.serviceAlias + " at "+result.locationAlias
            }
            element.ServiceInterface = result.intfMsgType
            element.Address = result.intfAddress
            element.Config.DefaultValue.ValueType =  result.intfValueType

          }
        });
    });
  }


  variableSelected(event:any,config:any,isGlobal:boolean){
    config.IsVariableGlobal = isGlobal;

  }


  loadDefaultConfig() {
    if (this.node.Config==null) {
      this.node.Config = {
        "VariableName": "",
        "IsVariableGlobal": false,
        "Props": {},
        "RegisterAsVirtualService": false,
        "VirtualServiceGroup":"",
        "VirtualServiceProps":{},
        "ResponseToTopic":""
      };
      this.node.Config["DefaultValue"] = {"Value": "", "ValueType": ""};
      if (this.node.Ui.nodeType) {
        switch (this.node.Ui.nodeType) {
          case "vinc_action":
            this.node.Address = "pt:j1/mt:cmd/rt:app/rn:vinculum/ad:1"
            this.node.ServiceInterface = "cmd.mode.set"
            this.node.Service = "vinc_mode"
            this.node.Label = "Home action"
            this.node.Config.DefaultValue.ValueType = "string"
            break;
        }
      }
    }
  }


  inputVariableSelected(cvar:ContextVariable) {
    this.node.Config.VariableName = cvar.Name;
    this.node.Config.IsVariableGlobal = cvar.isGlobal;
    this.node.Config.VariableType = cvar.Type;
  }

}


@Component({
  selector: 'vinc-action-node',
  templateUrl: './vinc-action-node.html',
  styleUrls: ['../flow-nodes.component.css']
})
export class VincActionNodeComponent implements OnInit {
  @Input() node :MetaNode;
  @Input() nodes:MetaNode[];
  shortcuts:any[];
  globalSub : Subscription;
  constructor(public dialog: MatDialog ,private fimp:FimpService) {

  }
  ngOnInit() {

    this.globalSub = this.fimp.getGlobalObservable().subscribe((msg) => {
      let fimpMsg = NewFimpMessageFromString(msg.payload.toString());
      if (fimpMsg.service == "vinculum" ){
        if (fimpMsg.mtype == "evt.pd7.response") {
          if (fimpMsg.val) {
            this.shortcuts = fimpMsg.val.param.shortcut;
            console.log("Shortcuts update");
            console.dir(this.shortcuts);
          }else
            this.shortcuts = [];
        }
      }

    });

    this.loadDefaultConfig()
    this.loadShortcuts()
  }

  ngOnDestroy() {
    if(this.globalSub)
      this.globalSub.unsubscribe();
  }
  loadShortcuts() {
    let val = {"cmd":"get","component":null,"id":null,"param":{"components":["shortcut"]}};
    var props = new Map<string,string>();
    let msg  = new FimpMessage("vinculum","cmd.pd7.request","object",val,props,null)
    msg.resp_to = "pt:j1/mt:rsp/rt:app/rn:thingsplex-ui/ad:1"
    this.fimp.publish("pt:j1/mt:cmd/rt:app/rn:vinculum/ad:1",msg.toString());

  }
  onSelected(v) {
    // console.log("Selected ");
    // console.dir(v.value);
    // this.node.Config.DefaultValue.Value.id = Number(v.value);
  }
  loadDefaultConfig() {
    if (this.node.Config==null) {
      this.node.Config = {
        "VariableName": "",
        "IsVariableGlobal": false,
        "Props": {},
        "RegisterAsVirtualService": false,
        "VirtualServiceGroup":"",
        "VirtualServiceProps":{},
        "ResponseToTopic":"pt:j1/mt:rsp/rt:app/rn:tpflow/ad:1"
      };
      // TODO: For some reason version , response_to fields are empty and shortcut id is string instead of number .
      this.node.Config["DefaultValue"] = {"Value":  {
          "cmd": "set",
          "component": "mode",
          "id": "home",
          "param": {},
          "requestId": 1
        }, "ValueType": "object"};
      this.node.Address = "pt:j1/mt:cmd/rt:app/rn:vinculum/ad:1"
      this.node.ServiceInterface = "cmd.pd7.request"
      this.node.Service = "vinculum"
      this.node.Label = "Home action"

    }
  }

}


@Component({
  selector: 'notification-action-node',
  templateUrl: './notification-action-node.html',
  styleUrls: ['../flow-nodes.component.css']
})
export class NotificationActionNodeComponent implements OnInit {
  @Input() node :MetaNode;
  @Input() nodes:MetaNode[];
  @Input() flowId:string;
  shortcuts:any[];
  siteId:string;
  constructor(public dialog: MatDialog , private http : HttpClient) {
    this.siteId = "";

  }
  ngOnInit() {
    this.loadDefaultConfig();
    this.loadSiteId();
  }

  loadSiteId() {
    this.http.get(BACKEND_ROOT+'/fimp/api/get-site-info').subscribe((data: any) =>{
      this.siteId = data["SiteId"];
      this.node.Config.DefaultValue.Value.SiteId = this.siteId
      console.log("Site id = "+this.siteId);
    })
  }

  loadDefaultConfig() {
    if (this.node.Config==null) {
      this.node.Config = {
        "VariableName": "",
        "IsVariableGlobal": false,
        "Props": {},
        "RegisterAsVirtualService": false,
        "VirtualServiceGroup":"",
        "VirtualServiceProps":{}
      };
      this.node.Config["DefaultValue"] = {"Value":{
          "EventName": "custom",
          "MessageContent": "Hello world",
          "SiteId": this.siteId
      },"ValueType":"object"};
      this.node.Address = "pt:j1/mt:evt/rt:app/rn:kind_owl/ad:1"
      this.node.ServiceInterface = "evt.notification.report"
      this.node.Service = "kind-owl"
      this.node.Label = "Push notification"
    }
  }

  inputVariableSelected(cvar:ContextVariable) {
    this.node.Config.VariableName = cvar.Name;
    this.node.Config.IsVariableGlobal = cvar.isGlobal;
    this.node.Config.VariableType = cvar.Type;
  }

}

@Component({
  selector: 'timeline-action-node',
  templateUrl: './timeline-action-node.html',
  styleUrls: ['../flow-nodes.component.css']
})
export class TimelineActionNodeComponent implements OnInit {
  @Input() node :MetaNode;
  @Input() nodes:MetaNode[];
  @Input() flowId:string;
  shortcuts:any[];
  constructor(public dialog: MatDialog ) {

  }
  ngOnInit() {
    this.loadDefaultConfig()
  }


  loadDefaultConfig() {
    if (this.node.Config==null) {
      this.node.Config = {
        "VariableName": "",
        "IsVariableGlobal": false,
        "Props": {},
        "RegisterAsVirtualService": false,
        "VirtualServiceGroup":"",
        "VirtualServiceProps":{}
      };
      this.node.Config["DefaultValue"] = {"Value":{
          "message_en": "",
          "message_no": "-",
          "sender": "flow"
        },"ValueType":"str_map"};
      this.node.Address = "pt:j1/mt:cmd/rt:app/rn:time_owl/ad:1"
      this.node.ServiceInterface = "cmd.timeline.set"
      this.node.Service = "time_owl"
      this.node.Label = "Publish timeline"
    }
  }

  inputVariableSelected(cvar:ContextVariable) {
    this.node.Config.VariableName = cvar.Name;
    this.node.Config.IsVariableGlobal = cvar.isGlobal;
    this.node.Config.VariableType = cvar.Type;
  }

}
