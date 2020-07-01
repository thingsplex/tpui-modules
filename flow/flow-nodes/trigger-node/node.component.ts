import {Component, Input, OnInit} from "@angular/core";
import {FlowRunDialog, MetaNode, ServiceLookupDialog} from "../../flow-editor/flow-editor.component";
import { MatDialog } from "@angular/material/dialog";
import {ServiceInterface} from "../../../registry/model";
import {FimpService} from "../../../../fimp/fimp.service";
import {FimpMessage, NewFimpMessageFromString} from "../../../../fimp/Message";
import {Subscription} from "rxjs";


@Component({
  selector: 'trigger-node',
  templateUrl: './node.html',
  styleUrls: ['../flow-nodes.component.css']
})
export class TriggerNodeComponent implements OnInit {
  @Input() node :MetaNode;
  @Input() nodes:MetaNode[];
  @Input() flowId:string;
  flowPublishService: string;
  flowPublishInterface : string;
  flowPublishAddress : string;
  constructor(public dialog: MatDialog) {

  }

  ngOnInit() {

    // backword compatability
    this.loadDefaultConfig();
    if (this.node.Config.Timeout == null) {
      this.node.Config["Timeout"] = 0;
      this.node.Config["ValueFilter"] = {"Value":"","ValueType":""};
    }
  }

  onServiceConfigured(service:ServiceInterface) {
    console.log("---Sevice configured event--- "+service.intfAddress)
    this.node.Address = service.intfAddress;
    this.node.Service = service.serviceName;
    this.node.ServiceInterface = service.intfMsgType;
  }

  loadDefaultConfig() {

    console.log("Initializing config 1");
    console.dir(this.node.Config);
    if (this.node.Config==null) {
      console.log("Initializing config 2");
      this.node.Config = {};
      this.node.Config["Timeout"] = 0;
      this.node.Config["VirtualServiceGroup"] = "ch_0";
      this.node.Config["VirtualServiceProps"] = {};
      this.node.Config["RegisterAsVirtualService"] = false;
      this.node.Config["LookupServiceNameAndLocation"] = false;

      this.node.Config["ValueFilter"] = {"Value":"","ValueType":"bool"};
      this.node.Config["IsValueFilterEnabled"] = false;
    }
    if (this.flowPublishService == null) {
      this.flowPublishService = "out_bin_switch";
      this.flowPublishInterface = "cmd.binary.set";
      this.onPublishServiceChange();
    }
  }

  runFlow(node:MetaNode) {
    let dialogRef = this.dialog.open(FlowRunDialog,{
      // height: '95%',
      width: '500px',
      data:node
    });
    dialogRef.afterClosed().subscribe(result => {
      // this.flow = result;
      // this.loadContext();
    });
  }

  onPublishServiceChange(){
    console.log(this.flowPublishService);
    var msgType = "cmd";
    try{
      if (this.flowPublishInterface.indexOf("evt.")>=0){
        msgType = "evt";
      }
    }catch(err){

    }

    this.flowPublishAddress = "pt:j1/mt:"+msgType+"/rt:dev/rn:flow/ad:1/sv:"+this.flowPublishService+"/ad:"+this.flowId+"_0";
  }
  publishFlowAsVirtualDevice(){
    this.node.ServiceInterface = this.flowPublishInterface;
    this.node.Service = this.flowPublishService;
    this.node.Address = this.flowPublishAddress;
  }
  serviceLookupDialog(nodeId:string) {
    let dialogRef = this.dialog.open(ServiceLookupDialog,{
      width: '500px',
      data:"out"
    });
    dialogRef.afterClosed().subscribe(result => {
      console.dir(result)
      if (result)
        this.nodes.forEach(element => {
          if (element.Id==nodeId) {
            element.Service = result.serviceName
            if(element.Label==""||element.Label==undefined){
              element.Label =  result.serviceAlias + " at "+result.locationAlias
            }
            element.ServiceInterface = result.intfMsgType
            element.Address = result.intfAddress
            element.Config.ValueFilter.ValueType =  result.intfValueType
          }
        });
    });
  }
}


@Component({
  selector: 'vinc-trigger-node',
  templateUrl: './vinc-trigger-node.html',
  styleUrls: ['../flow-nodes.component.css']
})
export class VincTriggerNodeComponent implements OnInit {
  @Input() node :MetaNode;
  @Input() nodes:MetaNode[];
  @Input() flowId:string;
  shortcuts:any[];
  globalSub : Subscription;
  constructor(public dialog: MatDialog, private fimp:FimpService) {

  }
  ngOnInit() {
    this.loadDefaultConfig()
    this.globalSub = this.fimp.getGlobalObservable().subscribe((msg) => {
      let fimpMsg = NewFimpMessageFromString(msg.payload.toString());
      if (fimpMsg.service == "vinculum" ){
        if (fimpMsg.mtype == "evt.pd7.response") {
          if (fimpMsg.val) {
            this.shortcuts = fimpMsg.val.param.shortcut;
            this.shortcuts.forEach(sh =>  {
              sh.id = String(sh.id);
            })
            console.log("Shortcuts update");
            console.dir(this.shortcuts);
          }else
            this.shortcuts = [];
        }
      }

    });
    this.loadShortcuts()

  }
  ngOnDestroy() {
    if(this.globalSub)
      this.globalSub.unsubscribe();
  }
  loadDefaultConfig() {

    if (this.node.Config==null) {
      this.node.Config = {};
      this.node.Config["Timeout"] = 0;
      this.node.Config["ValueFilter"] = "";
      this.node.Config["IsValueFilterEnabled"] = false;
      this.node.Config["EventType"] = "mode";
      this.node.Label = "Home event trigger"
    }
  }

  loadShortcuts() {
    let val = {"cmd":"get","component":null,"id":null,"param":{"components":["shortcut"]}};
    var props = new Map<string,string>();
    let msg  = new FimpMessage("vinculum","cmd.pd7.request","object",val,props,null)
    msg.resp_to = "pt:j1/mt:rsp/rt:app/rn:thingsplex-ui/ad:1"
    this.fimp.publish("pt:j1/mt:cmd/rt:app/rn:vinculum/ad:1",msg.toString());

  }
  onSelected($event) {
    this.node.Config.ValueFilter = String(this.node.Config.ValueFilter)
  }
  runFlow(node:MetaNode) {
    let dialogRef = this.dialog.open(FlowRunDialog,{
      // height: '95%',
      width: '500px',
      data:node
    });
    dialogRef.afterClosed().subscribe(result => {
      // this.flow = result;
      // this.loadContext();
    });
  }

}


@Component({
  selector: 'scene-trigger-node',
  templateUrl: './scene-trigger-node.html',
  styleUrls: ['../flow-nodes.component.css']
})
export class SceneTriggerNodeComponent implements OnInit {
  @Input() node :MetaNode;
  @Input() nodes:MetaNode[];
  @Input() flowId:string;

   public sceneValues:string[];
  sceneSeviceTopic:string;

  constructor(public dialog: MatDialog) {

  }
  ngOnInit() {
    this.loadDefaultConfig()
  }



  loadDefaultConfig() {

    if (this.node.Config==null) {
      this.node.Config = {};
      this.node.Config["Timeout"] = 0;
      this.node.Config["VirtualServiceGroup"] = "";
      this.node.Config["VirtualServiceProps"] = {};
      this.node.Config["RegisterAsVirtualService"] = false;
      this.node.Config["ValueFilter"] = {"Value":"","ValueType":"string"};
      this.node.Config["IsValueFilterEnabled"] = false;
      this.node.Address = ""
      this.node.ServiceInterface = "evt.scene.report"
      this.node.Service = "scene_ctrl"
      this.node.Label = "Scene button trigger"
    }
  }

  runFlow(node:MetaNode) {
    let dialogRef = this.dialog.open(FlowRunDialog,{
      // height: '95%',
      width: '500px',
      data:node
    });
    dialogRef.afterClosed().subscribe(result => {
      // this.flow = result;
      // this.loadContext();
    });
  }

}
